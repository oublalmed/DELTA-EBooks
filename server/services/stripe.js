import Stripe from 'stripe';

// Initialize Stripe only if API key is provided
// This allows the app to run without Stripe configured (using ad-based premium instead)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Helper to check if Stripe is configured
export function isStripeConfigured() {
  return stripe !== null;
}

export async function createPaymentIntent(amount, currency, metadata) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Use ad-based premium instead.');
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe createPaymentIntent error:', error);
    throw new Error('Failed to create payment intent.');
  }
}

export function constructWebhookEvent(body, signature) {
  if (!stripe) {
    throw new Error('Stripe is not configured.');
  }
  try {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe constructWebhookEvent error:', error);
    throw new Error('Webhook signature verification failed.');
  }
}

export default stripe;
