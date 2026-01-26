
import React, { useState } from 'react';
import { Book, User, PRICE_PER_BOOK } from '../types';
import * as api from '../services/api';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBook: Book | null;
  user: User | null;
  onPurchaseComplete: (bookId: string) => void;
  onOpenAuth: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, targetBook, user, onPurchaseComplete, onOpenAuth }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetBook) return null;

  const handlePurchase = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create PayPal order via backend
      const { orderId } = await api.createPaymentOrder(targetBook.id);

      // Step 2: Open PayPal approval window
      // In production, you'd use PayPal JS SDK for inline checkout.
      // For now, we simulate approval and capture.
      // The real PayPal flow will redirect to PayPal, then return.

      // For development/demo: directly capture the order
      // In production: PayPal SDK handles user approval first
      const result = await api.capturePaymentOrder(orderId, targetBook.id);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onPurchaseComplete(targetBook.id);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-themed-card rounded-3xl p-10 max-w-md w-full text-center animate-scaleIn border border-themed">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl text-themed font-medium mb-2">Purchase Complete!</h2>
          <p className="text-themed-sub text-sm mb-2">You now have full access to "{targetBook.title}"</p>
          <p className="text-themed-muted text-xs">All chapters unlocked + PDF download available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-themed-card rounded-3xl p-8 max-w-lg w-full animate-scaleIn border border-themed max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-themed-muted hover:text-themed transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Book info */}
        <div className="flex items-start gap-4 mb-8">
          <img src={targetBook.coverImage} alt={targetBook.title} className="w-20 h-28 object-cover rounded-xl shadow-lg" />
          <div className="flex-1">
            <h2 className="font-display text-xl text-themed font-medium mb-1">{targetBook.title}</h2>
            <p className="text-themed-muted text-xs mb-3">{targetBook.author} &middot; {targetBook.chapters.length} chapters</p>
            <div className="text-3xl font-display font-bold text-themed">${PRICE_PER_BOOK}</div>
            <p className="text-themed-muted text-[10px] uppercase tracking-wider font-bold mt-1">One-time payment</p>
          </div>
        </div>

        {/* What you get */}
        <div className="bg-themed-muted rounded-2xl p-5 mb-6">
          <h3 className="text-themed font-bold text-sm mb-3 uppercase tracking-wider">What you get</h3>
          <div className="space-y-2.5">
            {[
              'All ' + targetBook.chapters.length + ' chapters — full content',
              'Secure PDF download (watermarked)',
              'AI Companion for guided insights',
              'Sacred reflection journal',
              'Bonus content & checklists',
              'Lifetime access — read anytime',
              'All future updates included',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                <span className="text-themed-sub text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* CTA */}
        {user ? (
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-stone-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.407-1.13.963l-.84 5.325-.282 1.792a.642.642 0 0 1-.275.926z"/>
                </svg>
                Pay ${PRICE_PER_BOOK} with PayPal
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-stone-700 transition-all"
          >
            Sign In to Purchase
          </button>
        )}

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-themed-muted text-[10px] uppercase tracking-wider font-bold">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Secure
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            7-day refund
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            No subscription
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
