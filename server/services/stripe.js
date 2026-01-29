import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(amount, currency, metadata) {
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
  try {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe constructWebhookEvent error:', error);
    throw new Error('Webhook signature verification failed.');
  }
}

export default stripe;
