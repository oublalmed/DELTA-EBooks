
import React, { useState, useEffect } from 'react';
import { User, Book, PurchaseRecord, DownloadInfo } from '../types';
import { getPaymentHistory, getDownloadHistory, generateDownloadToken } from '../services/api';

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
  const [downloadingBook, setDownloadingBook] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentHistory();
    loadDownloadInfo();
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

  const purchasedBooks = books.filter(b => purchasedBookIds.includes(b.id));

  const getDownloadInfoForBook = (bookId: string) => {
    return downloadInfo.find(d => d.bookId === bookId);
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
                {t === 'books' ? `My Books (${purchasedBooks.length})` : t === 'downloads' ? 'Downloads' : 'Account'}
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
            {purchasedBooks.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-themed-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-themed-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-display font-medium text-themed mb-2">No books yet</h3>
                <p className="text-themed-muted text-sm mb-6">Browse our library to find your next transformative read.</p>
                <button onClick={onBack} className="bg-stone-800 text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-stone-700 transition-all">
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchasedBooks.map(book => {
                  const dlInfo = getDownloadInfoForBook(book.id);
                  return (
                    <div key={book.id} className="bg-themed-card rounded-2xl border border-themed overflow-hidden animate-fadeIn">
                      <div className="flex">
                        <img src={book.coverImage} className="w-32 h-44 object-cover" alt={book.title} />
                        <div className="flex-1 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Owned</span>
                            <span className="text-themed-muted text-[9px] font-bold uppercase tracking-wider">Lifetime Access</span>
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
                            <button
                              onClick={() => handleDownload(book.id)}
                              disabled={downloadingBook === book.id}
                              className="flex items-center gap-1.5 bg-themed-muted text-themed-sub py-2 px-3 rounded-lg text-xs font-bold hover:bg-themed border border-themed transition-all disabled:opacity-50"
                            >
                              {downloadingBook === book.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              PDF
                            </button>
                          </div>

                          {dlInfo && (
                            <p className="text-themed-muted text-[10px] mt-2">
                              {dlInfo.downloadsRemaining} downloads remaining
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {tab === 'downloads' && (
          <div>
            <div className="bg-themed-card rounded-2xl border border-themed p-6 mb-6">
              <h3 className="font-display font-medium text-themed text-lg mb-2">Download Your Books</h3>
              <p className="text-themed-muted text-sm mb-1">Each purchased book includes up to 5 secure PDF downloads.</p>
              <p className="text-themed-muted text-sm">PDFs are watermarked with your email for security.</p>
            </div>

            {purchasedBooks.length === 0 ? (
              <p className="text-themed-muted text-sm text-center py-10">No purchased books to download.</p>
            ) : (
              <div className="space-y-4">
                {purchasedBooks.map(book => {
                  const dlInfo = getDownloadInfoForBook(book.id);
                  return (
                    <div key={book.id} className="bg-themed-card rounded-xl border border-themed p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={book.coverImage} className="w-12 h-16 object-cover rounded-lg" alt={book.title} />
                        <div>
                          <h4 className="font-medium text-themed text-sm">{book.title}</h4>
                          <p className="text-themed-muted text-xs">
                            {dlInfo ? `${dlInfo.downloadsUsed} of ${dlInfo.maxDownloads} downloads used` : 'Ready to download'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(book.id)}
                        disabled={downloadingBook === book.id || (dlInfo && dlInfo.downloadsRemaining <= 0)}
                        className="bg-stone-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-700 disabled:opacity-40 transition-all flex items-center gap-2"
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
                    </div>
                  );
                })}
              </div>
            )}
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

            {/* Refund policy */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
              <h4 className="text-amber-800 font-bold text-sm mb-1">7-Day Refund Policy</h4>
              <p className="text-amber-700 text-xs leading-relaxed">
                Not satisfied? Contact us within 7 days of purchase for a full refund. No questions asked.
                Email: support@delta-ebooks.com
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
