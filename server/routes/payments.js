import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { createOrder, captureOrder, getOrderDetails } from '../services/paypal.js';
import { createPaymentIntent } from '../services/stripe.js';

const router = Router();

// ── POST /api/payments/create-stripe-payment-intent ──
router.post('/create-stripe-payment-intent', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Check if already purchased
    const existingPurchase = await db.get(
      'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = ?',
      [req.user.id, bookId, 'completed']
    );

    if (existingPurchase) {
      return res.status(400).json({ error: 'You already own this book' });
    }

    // Get book details
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Create a Payment Intent with the order amount and currency
    const paymentIntent = await createPaymentIntent(book.price, book.currency, {
      userId: req.user.id.toString(),
      bookId: book.id,
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Stripe Payment Intent creation error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ── POST /api/payments/create-order ──
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Check if already purchased
    const existingPurchase = await db.get(
      'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = ?',
      [req.user.id, bookId, 'completed']
    );

    if (existingPurchase) {
      return res.status(400).json({ error: 'You already own this book' });
    }

    // Get book details
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Create PayPal order
    const order = await createOrder({
      bookId: book.id,
      bookTitle: book.title,
      price: book.price,
      currency: book.currency,
    });

    // Log payment attempt
    await db.run(`
      INSERT INTO payment_logs (user_id, book_id, paypal_order_id, event_type, amount, currency, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, bookId, order.id, 'ORDER_CREATED', book.price, book.currency, order.status, req.ip]);

    res.json({
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    console.error('Create order error:', err);

    // Log failed attempt
    await db.run(`
      INSERT INTO payment_logs (user_id, book_id, event_type, status, raw_data, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, req.body.bookId || '', 'ORDER_CREATION_FAILED', 'error', err.message, req.ip]);

    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// ── POST /api/payments/capture-order ──
router.post('/capture-order', requireAuth, async (req, res) => {
  try {
    const { orderId, bookId } = req.body;

    if (!orderId || !bookId) {
      return res.status(400).json({ error: 'Order ID and Book ID are required' });
    }

    // Check if already purchased (prevent double purchase)
    const existingPurchase = await db.get(
      'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? AND status = ?',
      [req.user.id, bookId, 'completed']
    );

    if (existingPurchase) {
      return res.status(400).json({ error: 'You already own this book' });
    }

    // Capture the PayPal order
    const captureData = await captureOrder(orderId);

    // Verify payment
    if (captureData.status !== 'COMPLETED') {
      await db.run(`
        INSERT INTO payment_logs (user_id, book_id, paypal_order_id, event_type, status, raw_data, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [req.user.id, bookId, orderId, 'CAPTURE_INCOMPLETE', captureData.status, JSON.stringify(captureData), req.ip]);

      return res.status(400).json({ error: 'Payment was not completed' });
    }

    // Verify amount matches book price
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const capturedAmount = parseFloat(
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0'
    );

    if (capturedAmount < book.price) {
      await db.run(`
        INSERT INTO payment_logs (user_id, book_id, paypal_order_id, event_type, amount, status, raw_data, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [req.user.id, bookId, orderId, 'AMOUNT_MISMATCH', capturedAmount, 'error',
        JSON.stringify({ expected: book.price, received: capturedAmount }), req.ip]);

      return res.status(400).json({ error: 'Payment amount does not match book price' });
    }

    // Record the purchase
    await db.run(`
      INSERT IGNORE INTO purchases (user_id, book_id, paypal_order_id, amount, currency, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, bookId, orderId, capturedAmount, book.currency, 'completed']);

    // Log successful capture
    await db.run(`
      INSERT INTO payment_logs (user_id, book_id, paypal_order_id, event_type, amount, currency, status, raw_data, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, bookId, orderId, 'PAYMENT_CAPTURED', capturedAmount, book.currency, 'completed', JSON.stringify(captureData), req.ip]);

    res.json({
      success: true,
      message: 'Book purchased successfully!',
      bookId,
      orderId,
    });
  } catch (err) {
    console.error('Capture order error:', err);

    await db.run(`
      INSERT INTO payment_logs (user_id, book_id, paypal_order_id, event_type, status, raw_data, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, req.body.bookId || '', req.body.orderId || '', 'CAPTURE_FAILED', 'error', err.message, req.ip]);

    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

// ── GET /api/payments/verify/:orderId ──
router.get('/verify/:orderId', requireAuth, async (req, res) => {
  try {
    const orderDetails = await getOrderDetails(req.params.orderId);
    res.json({
      status: orderDetails.status,
      payer: orderDetails.payer,
      amount: orderDetails.purchase_units?.[0]?.amount,
    });
  } catch (err) {
    console.error('Verify order error:', err);
    res.status(500).json({ error: 'Failed to verify order' });
  }
});

// ── GET /api/payments/history ──
router.get('/history', requireAuth, async (req, res) => {
  try {
    const purchases = await db.all(`
      SELECT p.*, b.title as book_title, b.cover_image
      FROM purchases p
      JOIN books b ON p.book_id = b.id
      WHERE p.user_id = ?
      ORDER BY p.purchased_at DESC
    `, [req.user.id]);

    res.json(purchases);
  } catch (err) {
    console.error('Payment history error:', err);
    res.status(500).json({ error: 'Failed to load payment history' });
  }
});

export default router;
