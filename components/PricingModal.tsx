import React from 'react';
import { Book, User } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBook: Book | null;
  user: User | null;
  isBundleMode: boolean;
  allBooks: Book[];
  purchasedBookIds: string[];
  onPurchaseComplete: (bookId: string) => void;
  onOpenAuth: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  targetBook,
  user,
  isBundleMode,
  allBooks,
  purchasedBookIds,
  onPurchaseComplete,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  // Since we're using ad-based monetization, this modal now shows ad unlock options
  const handleWatchAd = () => {
    // Simulate watching an ad
    setTimeout(() => {
      if (targetBook) {
        onPurchaseComplete(targetBook.id);
      }
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-themed-card rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeIn relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-themed-muted transition-colors"
        >
          <svg className="w-5 h-5 text-themed-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-display text-themed font-medium text-center mb-3">
          {isBundleMode ? 'Unlock All Books' : `Unlock ${targetBook?.title || 'Book'}`}
        </h3>

        {/* Description */}
        <p className="text-themed-sub text-center mb-6">
          {user 
            ? 'Watch a short ad to unlock this content for free!'
            : 'Sign in to unlock content by watching ads.'
          }
        </p>

        {/* Benefits */}
        <div className="bg-themed-muted/30 rounded-xl p-4 mb-6">
          <ul className="space-y-2 text-sm text-themed-sub">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              100% Free - No payment required
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Permanent access after unlocking
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Support the platform
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {user ? (
            <button
              onClick={handleWatchAd}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Ad to Unlock
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-stone-700 transition-all"
            >
              Sign In to Continue
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-themed-muted text-sm font-medium hover:text-themed transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
