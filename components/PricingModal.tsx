
import React, { useState, useEffect, useRef } from 'react';
import { Book, PRICE_PER_BOOK, PRICE_ALL_ACCESS } from '../types';
import { BOOKS } from '../constants';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBook: Book | null;
  onUnlockBook: (bookId: string) => void;
  onUnlockAll: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, targetBook, onUnlockBook, onUnlockAll }) => {
  const [selectedPlan, setSelectedPlan] = useState<'book' | 'all'>('all');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const paypalBookRef = useRef<HTMLDivElement>(null);
  const paypalAllRef = useRef<HTMLDivElement>(null);
  const [paypalRendered, setPaypalRendered] = useState({ book: false, all: false });

  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus('idle');
      setPaypalRendered({ book: false, all: false });
      return;
    }

    const renderPayPalButtons = () => {
      if (!window.paypal) return;

      // Render single book button
      if (paypalBookRef.current && !paypalRendered.book && targetBook) {
        paypalBookRef.current.innerHTML = '';
        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'black', shape: 'pill', label: 'pay', height: 45 },
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: `DELTA EBooks — ${targetBook.title}`,
                amount: { value: PRICE_PER_BOOK.toFixed(2) }
              }]
            });
          },
          onApprove: async (_data: any, actions: any) => {
            setPaymentStatus('processing');
            try {
              await actions.order.capture();
              onUnlockBook(targetBook.id);
              setPaymentStatus('success');
            } catch {
              setPaymentStatus('error');
            }
          },
          onError: () => setPaymentStatus('error'),
        }).render(paypalBookRef.current);
        setPaypalRendered(prev => ({ ...prev, book: true }));
      }

      // Render all-access button
      if (paypalAllRef.current && !paypalRendered.all) {
        paypalAllRef.current.innerHTML = '';
        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 45 },
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: 'DELTA EBooks — All-Access Pass (4 Books)',
                amount: { value: PRICE_ALL_ACCESS.toFixed(2) }
              }]
            });
          },
          onApprove: async (_data: any, actions: any) => {
            setPaymentStatus('processing');
            try {
              await actions.order.capture();
              onUnlockAll();
              setPaymentStatus('success');
            } catch {
              setPaymentStatus('error');
            }
          },
          onError: () => setPaymentStatus('error'),
        }).render(paypalAllRef.current);
        setPaypalRendered(prev => ({ ...prev, all: true }));
      }
    };

    const timer = setTimeout(renderPayPalButtons, 300);
    return () => clearTimeout(timer);
  }, [isOpen, selectedPlan, targetBook]);

  if (!isOpen) return null;

  const savingsPercent = Math.round((1 - PRICE_ALL_ACCESS / (PRICE_PER_BOOK * BOOKS.length)) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-300 hover:text-stone-600 transition-colors z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success state */}
        {paymentStatus === 'success' ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-medium text-stone-800 mb-3">Welcome to the Journey</h3>
            <p className="text-stone-500 font-serif italic mb-8">Your chapters have been unlocked. Start reading and transform your life.</p>
            <button onClick={onClose} className="bg-stone-800 text-white px-10 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-stone-700 transition-all">
              Start Reading
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-800 mb-5">
                <span className="text-white text-xl font-display">&#x2726;</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-medium text-stone-800 mb-2">Unlock Premium Wisdom</h2>
              <p className="text-stone-400 text-sm">Access all chapters and transform your inner world</p>
            </div>

            {/* Plans */}
            <div className="px-8 pb-4 space-y-3">
              {/* All Access Plan */}
              <button
                onClick={() => setSelectedPlan('all')}
                className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedPlan === 'all'
                    ? 'border-stone-800 bg-stone-50 shadow-lg'
                    : 'border-stone-100 hover:border-stone-300'
                }`}
              >
                <div className="absolute -top-2.5 right-4 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Save {savingsPercent}%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-stone-800 mb-0.5">All-Access Pass</h4>
                    <p className="text-stone-400 text-xs">All {BOOKS.length} books ({BOOKS.reduce((s, b) => s + b.chapters.length, 0)} chapters)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-stone-800">${PRICE_ALL_ACCESS}</div>
                    <div className="text-[10px] text-stone-400 line-through">${(PRICE_PER_BOOK * BOOKS.length).toFixed(2)}</div>
                  </div>
                </div>
              </button>

              {/* Single Book Plan */}
              {targetBook && (
                <button
                  onClick={() => setSelectedPlan('book')}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    selectedPlan === 'book'
                      ? 'border-stone-800 bg-stone-50 shadow-lg'
                      : 'border-stone-100 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-stone-800 mb-0.5">Single Book</h4>
                      <p className="text-stone-400 text-xs">{targetBook.title}</p>
                    </div>
                    <div className="text-2xl font-display font-bold text-stone-800">${PRICE_PER_BOOK}</div>
                  </div>
                </button>
              )}
            </div>

            {/* What you get */}
            <div className="px-8 py-4">
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-3">What you get</p>
              <div className="space-y-2.5">
                {['Full access to all premium chapters', 'AI-powered philosophical companion', 'Sacred reflection journal', 'Lifetime access with future updates'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span className="text-sm text-stone-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PayPal Buttons */}
            <div className="px-8 pb-8 pt-4">
              {paymentStatus === 'processing' && (
                <div className="flex items-center justify-center gap-3 p-6 text-stone-500">
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
                  <span className="text-sm">Processing your payment...</span>
                </div>
              )}
              {paymentStatus === 'error' && (
                <div className="p-4 mb-4 bg-red-50 border border-red-100 rounded-xl text-center">
                  <p className="text-red-600 text-sm">Payment failed. Please try again.</p>
                </div>
              )}

              <div className={selectedPlan === 'all' ? '' : 'hidden'}>
                <div ref={paypalAllRef} className="min-h-[50px]" />
              </div>
              <div className={selectedPlan === 'book' ? '' : 'hidden'}>
                <div ref={paypalBookRef} className="min-h-[50px]" />
              </div>

              {!window.paypal && (
                <div className="text-center p-6">
                  <p className="text-stone-400 text-xs mb-3">PayPal is loading...</p>
                  <p className="text-stone-300 text-[10px]">If buttons don't appear, check your PayPal Client ID configuration.</p>
                </div>
              )}

              <p className="text-center text-stone-300 text-[10px] mt-4">
                Secure payment via PayPal. One-time purchase, no subscription.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricingModal;
