/**
 * PayPal REST API integration (v2 Orders API)
 * Handles order creation, capture, and verification server-side.
 *
 * Required environment variables:
 *   PAYPAL_CLIENT_ID     - Your PayPal Business app client ID
 *   PAYPAL_CLIENT_SECRET - Your PayPal Business app secret
 *   PAYPAL_MODE          - 'sandbox' or 'live'
 */

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Get an OAuth2 access token from PayPal
 */
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} — ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Create a PayPal order for a book purchase
 */
export async function createOrder({ bookId, bookTitle, price, currency = 'USD' }) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: bookId,
        description: `DELTA EBooks — ${bookTitle}`,
        amount: {
          currency_code: currency,
          value: price.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'DELTA EBooks',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment/success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment/cancel`,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} — ${text}`);
  }

  return res.json();
}

/**
 * Capture a PayPal order after user approval
 */
export async function captureOrder(orderId) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} — ${text}`);
  }

  return res.json();
}

/**
 * Get order details for verification
 */
export async function getOrderDetails(orderId) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal get order failed: ${res.status} — ${text}`);
  }

  return res.json();
}

/**
 * Verify a webhook signature from PayPal
 */
export async function verifyWebhookSignature({ webhookId, headers, body }) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}
