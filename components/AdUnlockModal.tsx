import React, { useEffect, useState } from 'react';
import AdBanner from './AdBanner';

interface AdUnlockModalProps {
  isOpen: boolean;
  bookTitle: string;
  onClose: () => void;
  onUnlock: () => void;
  countdownSeconds?: number;
}

const DEFAULT_COUNTDOWN_SECONDS = 5;

const AdUnlockModal: React.FC<AdUnlockModalProps> = ({ isOpen, bookTitle, onClose, onUnlock, countdownSeconds = DEFAULT_COUNTDOWN_SECONDS }) => {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(countdownSeconds);
    setIsReady(false);
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, countdownSeconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-themed-card rounded-3xl p-8 max-w-md w-full text-center animate-scaleIn border border-themed shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-themed-muted hover:text-themed transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        <h2 className="font-display text-2xl text-themed font-medium mb-2">Watch an Ad to Unlock</h2>
        <p className="text-themed-sub text-sm mb-6">Unlock <span className="font-semibold text-themed">"{bookTitle}"</span> after a short ad.</p>

        <AdBanner placement="unlock-modal" variant="medium" />

        <div className="mt-6">
          <button
            onClick={onUnlock}
            disabled={!isReady}
            className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 bg-stone-800 text-white hover:bg-stone-700"
          >
            {isReady ? 'Continue Reading' : `Please wait ${secondsLeft}s`}
          </button>
          <p className="text-themed-muted text-[10px] mt-3 uppercase tracking-wider font-bold">
            Ad supports free reading for everyone
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdUnlockModal;
