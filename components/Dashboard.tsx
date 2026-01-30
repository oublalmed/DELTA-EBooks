import React, { useState } from 'react';
import { User, Book, UserProgress } from '../types';
import AdBanner from './AdBanner';

interface DashboardProps {
  user: User;
  books: Book[];
  unlockedBookIds: string[];
  progress: UserProgress;
  onSelectBook: (book: Book) => void;
  onBack: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onUnlock: (book: Book) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, books, unlockedBookIds, progress, onSelectBook, onBack, onLogout, onOpenProfile, onUnlock }) => {
  const [tab, setTab] = useState<'library' | 'account'>('library');
  const unlockedSet = new Set(unlockedBookIds);
  const totalChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);
  const completedChapters = books.reduce((sum, b) => {
    const bp = progress.books[b.id];
    return sum + (bp ? bp.completedIds.length : 0);
  }, 0);

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
                <h1 className="text-xl font-display font-medium text-themed">My Library</h1>
                <p className="text-themed-muted text-xs">{user.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-themed-muted hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors">
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6">
            {(['library', 'account'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                  tab === t
                    ? 'border-stone-800 text-themed'
                    : 'border-transparent text-themed-muted hover:text-themed-sub'
                }`}
              >
                {t === 'library' ? 'Library' : 'Account'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'library' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Books Unlocked', value: unlockedBookIds.length },
                { label: 'Chapters Read', value: completedChapters },
                { label: 'Total Chapters', value: totalChapters },
              ].map(stat => (
                <div key={stat.label} className="bg-themed-card border border-themed rounded-2xl p-5 text-center">
                  <p className="text-themed-muted text-[10px] uppercase tracking-wider font-bold">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-themed mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            <AdBanner placement="dashboard-library" variant="banner" />

            <div className="space-y-4">
              {books.map(book => {
                const bp = progress.books[book.id];
                const completed = bp ? bp.completedIds.length : 0;
                const percent = book.chapters.length > 0 ? Math.round((completed / book.chapters.length) * 100) : 0;
                const isUnlocked = unlockedSet.has(book.id);

                return (
                  <div key={book.id} className="bg-themed-card rounded-2xl border border-themed overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <img src={book.coverImage} className="w-full sm:w-32 h-40 sm:h-44 object-cover" alt={book.title} />
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isUnlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {isUnlocked ? 'Unlocked' : 'Ad Supported'}
                          </span>
                          <span className="text-themed-muted text-[9px] font-bold uppercase tracking-wider">{completed}/{book.chapters.length} chapters</span>
                        </div>
                        <h3 className="font-display font-medium text-themed text-base mb-2 leading-snug">{book.title}</h3>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-2 bg-themed-muted rounded-full overflow-hidden">
                            <div className="h-full bg-stone-800 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-themed-muted">{percent}%</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => onSelectBook(book)}
                            className="bg-stone-800 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-all"
                          >
                            Read
                          </button>
                          {!isUnlocked && (
                            <button
                              onClick={() => onUnlock(book)}
                              className="bg-themed-muted text-themed-sub px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-themed border border-themed transition-all"
                            >
                              Watch Ad to Unlock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                <label className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Books Unlocked</label>
                <p className="text-themed font-medium mt-1">{unlockedBookIds.length} book{unlockedBookIds.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={onOpenProfile}
                className="w-full mt-2 bg-themed-muted text-themed-sub py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-themed border border-themed transition-all"
              >
                Edit Profile
              </button>
            </div>
            <div className="mt-6">
              <AdBanner placement="dashboard-account" variant="banner" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
