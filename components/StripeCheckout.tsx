import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as api from '../services/api';
import { Book, User } from '../types';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

const CheckoutForm: React.FC<{ book: Book, user: User, onPurchaseComplete: (bookId: string) => void }> = ({ book, user, onPurchaseComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    api.createStripePaymentIntent(book.id).then(data => {
      setClientSecret(data.clientSecret);
    });
  }, [book]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: user.name,
          email: user.email,
        },
      },
    });

    if (paymentError) {
      setError(paymentError.message || 'An unexpected error occurred.');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPurchaseComplete(book.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={{
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      }} />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 py-3 cta-premium text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
      >
        {processing ? 'Processing...' : `Pay $${book.price}`}
      </button>
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
    </form>
  );
};

const StripeCheckout: React.FC<{ book: Book, user: User, onPurchaseComplete: (bookId: string) => void }> = ({ book, user, onPurchaseComplete }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm book={book} user={user} onPurchaseComplete={onPurchaseComplete} />
    </Elements>
  );
};

export default StripeCheckout;
