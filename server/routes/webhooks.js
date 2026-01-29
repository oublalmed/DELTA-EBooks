import { Router } from 'express';
import db from '../db.js';
import { verifyWebhookSignature } from '../services/paypal.js';

import { Router } from 'express';
import db from '../db.js';
import { verifyWebhookSignature } from '../services/paypal.js';
import { constructWebhookEvent } from '../services/stripe.js';

const router = Router();

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends webhook events for payment lifecycle events.
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    console.warn('Stripe webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const { userId, bookId } = paymentIntent.metadata;
      const amount = paymentIntent.amount / 100; // Convert from cents

      if (userId && bookId) {
        // Record the purchase
        db.prepare(`
          INSERT OR IGNORE INTO purchases (user_id, book_id, stripe_payment_intent_id, amount, currency, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, bookId, paymentIntent.id, amount, paymentIntent.currency, 'completed');

        // Log successful payment
        db.prepare(`
          INSERT INTO payment_logs (user_id, book_id, event_type, amount, currency, status, raw_data)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, bookId, 'STRIPE_PAYMENT_SUCCEEDED', amount, paymentIntent.currency, 'completed', JSON.stringify(paymentIntent));
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * POST /api/webhooks/paypal
 *
 * PayPal sends webhook events for payment lifecycle events.
 * This ensures reliability even if the client-side capture callback fails.
 */
router.post('/paypal', async (req, res) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Verify webhook signature if webhook ID is configured
    if (webhookId) {
      const isValid = await verifyWebhookSignature({
        webhookId,
        headers: req.headers,
        body: req.body,
      });

      if (!isValid) {
        console.warn('Invalid PayPal webhook signature');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    const eventType = event.event_type;

    // Log all webhook events
    db.prepare(`
      INSERT INTO payment_logs (event_type, status, raw_data, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(`WEBHOOK_${eventType}`, 'received', JSON.stringify(event), req.ip);

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Order approved — user approved payment in PayPal
        const orderId = event.resource?.id;
        if (orderId) {
          db.prepare(`
            UPDATE payment_logs SET status = 'approved'
            WHERE paypal_order_id = ? AND event_type = 'ORDER_CREATED'
          `).run(orderId);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment captured — funds received
        const captureId = event.resource?.id;
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
        const amount = parseFloat(event.resource?.amount?.value || '0');

        if (orderId) {
          // Find the purchase log to get user and book info
          const log = db.prepare(
            'SELECT user_id, book_id FROM payment_logs WHERE paypal_order_id = ? AND event_type = ? LIMIT 1'
          ).get(orderId, 'ORDER_CREATED');

          if (log) {
            // Ensure purchase is recorded (idempotent)
            db.prepare(`
              INSERT OR IGNORE INTO purchases (user_id, book_id, paypal_order_id, amount, currency, status)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(log.user_id, log.book_id, orderId, amount, 'USD', 'completed');
          }
        }

        db.prepare(`
          INSERT INTO payment_logs (paypal_order_id, event_type, amount, status, raw_data, ip_address)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(orderId || captureId, 'WEBHOOK_CAPTURE_COMPLETED', amount, 'completed', JSON.stringify(event.resource), req.ip);
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
        if (orderId && eventType === 'PAYMENT.CAPTURE.REFUNDED') {
          // Mark purchase as refunded
          db.prepare(
            'UPDATE purchases SET status = ? WHERE paypal_order_id = ?'
          ).run('refunded', orderId);
        }
        break;
      }

      default:
        // Log unknown events
        break;
    }

    // PayPal expects 200 OK response
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Still return 200 to prevent PayPal retries for processing errors
    res.status(200).json({ received: true, error: 'Processing error logged' });
  }
});

export default router;
