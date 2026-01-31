import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Book, PDFDownloadStatus, PDF_ADS_REQUIRED } from '../types';

interface PDFDownloadManagerProps {
  isOpen: boolean;
  book: Book;
  onClose: () => void;
  onDownloadReady: (bookId: string) => void;
}

const PDFDownloadManager: React.FC<PDFDownloadManagerProps> = ({ isOpen, book, onClose, onDownloadReady }) => {
  const [status, setStatus] = useState<PDFDownloadStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      loadStatus();
    }
  }, [isOpen, book]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getPDFDownloadStatus(book.id);
      setStatus(data);
    } catch (error) {
      console.error('Failed to load PDF status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = async () => {
    setWatchingAd(true);
    try {
      const result = await api.recordPDFAdWatch(book.id);
      setStatus({
        bookId: book.id,
        adsWatched: result.adsWatched,
        adsRequired: result.adsRequired,
        isUnlocked: result.isUnlocked,
        canDownload: result.canDownload
      });
      
      if (result.isUnlocked) {
        // Show success briefly, then trigger download
        setTimeout(() => {
          onDownloadReady(book.id);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to record ad watch:', error);
    } finally {
      setWatchingAd(false);
    }
  };

  if (!isOpen) return null;

  const adsRemaining = status ? status.adsRequired - status.adsWatched : PDF_ADS_REQUIRED;
  const progress = status ? (status.adsWatched / status.adsRequired) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-themed-card rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-3 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-themed-muted text-sm">Loading...</p>
          </div>
        ) : status?.isUnlocked ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-display text-themed font-medium mb-3">Download Unlocked!</h3>
            <p className="text-themed-sub mb-6">You can now download "{book.title}" as PDF.</p>
            <button
              onClick={() => {
                onDownloadReady(book.id);
                onClose();
              }}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Now
            </button>
          </div>
        ) : (
          <>
            {/* Book cover and title */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-themed">
              <img src={book.coverImage} alt={book.title} className="w-16 h-20 object-cover rounded-lg shadow-md" />
              <div>
                <h3 className="font-display text-themed font-medium text-lg leading-snug">{book.title}</h3>
                <p className="text-themed-muted text-xs">by {book.author}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-themed-muted text-xs font-bold uppercase tracking-wider">Download Progress</span>
                <span className="text-themed font-bold text-sm">{status?.adsWatched || 0} / {PDF_ADS_REQUIRED} ads</span>
              </div>
              <div className="h-3 bg-themed-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-800 font-medium text-sm mb-1">Watch {adsRemaining} more ad{adsRemaining !== 1 ? 's' : ''} to unlock</p>
                  <p className="text-amber-700 text-xs">Each ad takes ~30 seconds. Your progress is saved.</p>
                </div>
              </div>
            </div>

            {/* Watch Ad Button */}
            <button
              onClick={handleWatchAd}
              disabled={watchingAd}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              {watchingAd ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Watching Ad...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Ad ({adsRemaining} remaining)
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-themed-muted text-sm font-medium hover:text-themed transition-colors"
            >
              Cancel
            </button>

            {/* Note */}
            <p className="text-themed-muted text-[10px] text-center mt-4">
              Once unlocked, you can download the PDF anytime
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFDownloadManager;
