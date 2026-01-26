
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
      const { orderId } = await api.createPaymentOrder(targetBook.id);
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
        <div className="relative bg-themed-card rounded-3xl p-10 max-w-md w-full text-center animate-scaleIn border border-themed shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl text-themed font-medium mb-2">Purchase Complete!</h2>
          <p className="text-themed-sub text-sm mb-2">You now have full access to "{targetBook.title}"</p>
          <p className="text-themed-muted text-xs">All chapters unlocked + PDF download available</p>
          <div className="mt-6 pt-6 border-t border-themed">
            <p className="text-themed-muted text-xs font-serif italic">"Your journey of wisdom begins now."</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-themed-card rounded-3xl p-8 max-w-lg w-full animate-scaleIn border border-themed max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-themed-muted hover:text-themed transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Book info with premium styling */}
        <div className="flex items-start gap-5 mb-8">
          <div className="relative">
            <img src={targetBook.coverImage} alt={targetBook.title} className="w-24 h-32 object-cover rounded-xl shadow-lg" />
            <div className="absolute -top-2 -right-2 badge-featured w-7 h-7 rounded-full flex items-center justify-center text-[10px]">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl text-themed font-medium mb-1">{targetBook.title}</h2>
            <p className="text-themed-muted text-xs mb-3">{targetBook.author} &middot; {targetBook.chapters.length} chapters</p>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-display font-bold text-themed">${PRICE_PER_BOOK}</div>
              <div className="text-themed-muted text-xs line-through">$19.99</div>
            </div>
            <p className="text-emerald-600 text-[10px] uppercase tracking-wider font-bold mt-1">
              50% OFF — One-time payment
            </p>
          </div>
        </div>

        {/* Motivational message */}
        <div className="bg-themed-muted rounded-2xl p-4 mb-6 text-center">
          <p className="text-themed-sub text-sm font-serif italic">
            "Invest in yourself. Your future self will thank you."
          </p>
        </div>

        {/* What you get */}
        <div className="bg-themed-muted rounded-2xl p-5 mb-6">
          <h3 className="text-themed font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            What you get
          </h3>
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
            className="w-full py-4 cta-premium text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
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
            className="w-full py-4 cta-premium text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:shadow-lg"
          >
            Sign In to Purchase
          </button>
        )}

        {/* Urgency / social proof */}
        <div className="mt-4 text-center">
          <p className="text-themed-sub text-xs">
            <span className="text-amber-600 font-bold">127 readers</span> purchased this book in the last 30 days
          </p>
        </div>

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
