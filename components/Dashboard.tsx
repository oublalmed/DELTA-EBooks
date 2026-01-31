
import React, { useState, useEffect } from 'react';
import { User, Book, PurchaseRecord, DownloadInfo, PDFDownloadStatus, PDF_ADS_REQUIRED } from '../types';
import { getPaymentHistory, getDownloadHistory, generateDownloadToken, getAllPDFDownloadStatuses } from '../services/api';
import PDFDownloadManager from './PDFDownloadManager';

interface DashboardProps {
  user: User;
  books: Book[];
  purchasedBookIds: string[];
  onSelectBook: (book: Book) => void;
  onBack: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, books, purchasedBookIds, onSelectBook, onBack, onLogout, onOpenProfile }) => {
  const [tab, setTab] = useState<'books' | 'downloads' | 'account'>('books');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo[]>([]);
  const [pdfStatuses, setPdfStatuses] = useState<Record<string, PDFDownloadStatus>>({});
  const [downloadingBook, setDownloadingBook] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [showPDFManager, setShowPDFManager] = useState(false);
  const [selectedBookForPDF, setSelectedBookForPDF] = useState<Book | null>(null);

  useEffect(() => {
    loadPaymentHistory();
    loadDownloadInfo();
    loadPDFStatuses();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const data = await getPaymentHistory();
      setPurchases(data);
    } catch { /* ignore */ }
  };

  const loadDownloadInfo = async () => {
    try {
      const data = await getDownloadHistory();
      setDownloadInfo(data.downloadInfo);
    } catch { /* ignore */ }
  };
  
  const loadPDFStatuses = async () => {
    try {
      const data = await getAllPDFDownloadStatuses();
      setPdfStatuses(data.books || {});
    } catch { /* ignore */ }
  };

  const handleDownload = async (bookId: string) => {
    setDownloadingBook(bookId);
    setDownloadMessage(null);
    try {
      const { downloadUrl } = await generateDownloadToken(bookId);
      // Open download URL in a new tab
      window.open(downloadUrl, '_blank');
      setDownloadMessage('Download started! Check your downloads folder.');
      loadDownloadInfo(); // Refresh counts
    } catch (err: any) {
      setDownloadMessage(err.message || 'Download failed');
    } finally {
      setDownloadingBook(null);
    }
  };
  
  const handleOpenPDFManager = (book: Book) => {
    setSelectedBookForPDF(book);
    setShowPDFManager(true);
  };
  
  const handleDownloadReady = (bookId: string) => {
    // PDF is unlocked, trigger download
    handleDownload(bookId);
    loadPDFStatuses(); // Refresh statuses
  };

  const purchasedBooks = books.filter(b => purchasedBookIds.includes(b.id));

  const getDownloadInfoForBook = (bookId: string) => {
    return downloadInfo.find(d => d.bookId === bookId);
  };
  
  const getPDFStatusForBook = (bookId: string) => {
    return pdfStatuses[bookId];
  };

  return (
    <div className="min-h-screen bg-themed">
      {/* Header */}
      <div className="bg-themed-card border-b border-themed">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-themed-muted hover:text-themed transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-display font-medium text-themed">My Dashboard</h1>
                <p className="text-themed-muted text-xs">{user.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-themed-muted hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors">
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6">
            {(['books', 'downloads', 'account'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                  tab === t
                    ? 'border-stone-800 text-themed'
                    : 'border-transparent text-themed-muted hover:text-themed-sub'
                }`}
              >
                {t === 'books' ? 'My Books' : t === 'downloads' ? 'PDF Downloads' : 'Account'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Message */}
        {downloadMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm animate-fadeIn">
            {downloadMessage}
          </div>
        )}

        {/* Books Tab */}
        {tab === 'books' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map(book => {
                const pdfStatus = getPDFStatusForBook(book.id);
                const isPdfUnlocked = pdfStatus?.isUnlocked || false;
                
                return (
                  <div key={book.id} className="bg-themed-card rounded-2xl border border-themed overflow-hidden animate-fadeIn">
                    <div className="flex">
                      <img src={book.coverImage} className="w-32 h-44 object-cover" alt={book.title} />
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Free Access</span>
                        </div>
                        <h3 className="font-display font-medium text-themed text-base mb-1 leading-snug">{book.title}</h3>
                        <p className="text-themed-muted text-xs mb-4">{book.chapters.length} chapters</p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onSelectBook(book)}
                            className="flex-1 bg-stone-800 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-all"
                          >
                            Read
                          </button>
                          {isPdfUnlocked ? (
                            <button
                              onClick={() => handleDownload(book.id)}
                              disabled={downloadingBook === book.id}
                              className="flex items-center gap-1.5 bg-emerald-500 text-white py-2 px-3 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                              {downloadingBook === book.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              )}
                              PDF
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPDFManager(book)}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-3 rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              </svg>
                              PDF
                            </button>
                          )}
                        </div>

                        <p className="text-themed-muted text-[10px] mt-2">
                          {isPdfUnlocked ? 'PDF ready to download' : `Watch ${PDF_ADS_REQUIRED} ads to unlock PDF`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Downloads Tab */}
        {tab === 'downloads' && (
          <div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-medium text-xl mb-2">Download Books as PDF</h3>
                  <p className="text-white/80 text-sm mb-1">Watch {PDF_ADS_REQUIRED} short videos to unlock PDF download for each book.</p>
                  <p className="text-white/80 text-sm">Your progress is saved — watch at your own pace!</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {books.map(book => {
                const pdfStatus = getPDFStatusForBook(book.id);
                const isUnlocked = pdfStatus?.isUnlocked || false;
                const adsWatched = pdfStatus?.adsWatched || 0;
                const progress = (adsWatched / PDF_ADS_REQUIRED) * 100;
                
                return (
                  <div key={book.id} className="bg-themed-card rounded-xl border border-themed p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img src={book.coverImage} className="w-12 h-16 object-cover rounded-lg shadow" alt={book.title} />
                        <div>
                          <h4 className="font-medium text-themed text-sm">{book.title}</h4>
                          <p className="text-themed-muted text-xs">{book.chapters.length} chapters</p>
                        </div>
                      </div>
                      {isUnlocked ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          Unlocked
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {adsWatched}/{PDF_ADS_REQUIRED} ads
                        </span>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-themed-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isUnlocked ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                          style={{ width: `${isUnlocked ? 100 : progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {isUnlocked ? (
                      <button
                        onClick={() => handleDownload(book.id)}
                        disabled={downloadingBook === book.id}
                        className="w-full bg-emerald-500 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        {downloadingBook === book.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                        Download PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPDFManager(book)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        Watch Ads to Unlock ({PDF_ADS_REQUIRED - adsWatched} left)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Account Tab */}
        {tab === 'account' && (
          <div className="max-w-lg">
            <div className="bg-themed-card rounded-2xl border border-themed p-6 space-y-4">
              <div>
                <label className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Name</label>
                <p className="text-themed font-medium mt-1">{user.name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Email</label>
                <p className="text-themed font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Member Since</label>
                <p className="text-themed font-medium mt-1">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <label className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Books Owned</label>
                <p className="text-themed font-medium mt-1">{purchasedBookIds.length} book{purchasedBookIds.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={onOpenProfile}
                className="w-full mt-2 bg-themed-muted text-themed-sub py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-themed border border-themed transition-all"
              >
                Edit Profile
              </button>
            </div>

            {/* Purchase history */}
            {purchases.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-medium text-themed text-lg mb-4">Purchase History</h3>
                <div className="space-y-3">
                  {purchases.map(p => (
                    <div key={p.id} className="bg-themed-card rounded-xl border border-themed p-4 flex items-center justify-between">
                      <div>
                        <p className="text-themed text-sm font-medium">{p.book_title}</p>
                        <p className="text-themed-muted text-xs">{new Date(p.purchased_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-themed font-bold text-sm">${p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support info */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
              <h4 className="text-amber-800 font-bold text-sm mb-1">Need Help?</h4>
              <p className="text-amber-700 text-xs leading-relaxed">
                Contact us anytime at support@delta-ebooks.com
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* PDF Download Manager Modal */}
      {selectedBookForPDF && (
        <PDFDownloadManager
          isOpen={showPDFManager}
          book={selectedBookForPDF}
          onClose={() => {
            setShowPDFManager(false);
            setSelectedBookForPDF(null);
          }}
          onDownloadReady={handleDownloadReady}
        />
      )}
    </div>
  );
};

export default Dashboard;
