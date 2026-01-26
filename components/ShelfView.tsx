
import React from 'react';
import { Book, UserProgress, User, ThemeMode, FREE_CHAPTERS, PRICE_PER_BOOK } from '../types';
import { AUTHOR } from '../constants';
import EmailCapture from './EmailCapture';

interface ShelfViewProps {
  books: Book[];
  progress: UserProgress;
  purchasedBookIds: string[];
  user: User | null;
  theme: ThemeMode;
  onSelect: (book: Book) => void;
  onOpenPricing: (book?: Book) => void;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
}

const accentMap: Record<string, { bg: string; text: string; badge: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', badge: 'bg-rose-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-500' },
  stone: { bg: 'bg-stone-100', text: 'text-stone-600', badge: 'bg-stone-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-500' },
};

const testimonials = [
  { name: "Sara M.", text: "This collection changed how I see relationships. The reflection prompts are incredibly powerful.", role: "Reader" },
  { name: "James K.", text: "The Stoic book alone is worth every penny. I read a chapter every morning as part of my routine.", role: "Daily Reader" },
  { name: "Amira L.", text: "The AI companion feels like having a wise mentor available 24/7. Truly unique reading experience.", role: "Book Owner" },
];

const themeIcons: Record<ThemeMode, string> = {
  light: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  dark: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  sepia: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

const ShelfView: React.FC<ShelfViewProps> = ({ books, progress, purchasedBookIds, user, theme, onSelect, onOpenPricing, onToggleTheme, onOpenAuth, onOpenDashboard }) => {
  const totalChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);
  const totalCompleted = books.reduce((sum, b) => {
    const bp = progress.books[b.id];
    return sum + (bp ? bp.completedIds.length : 0);
  }, 0);
  const overallPercent = totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0;
  const hasPurchases = purchasedBookIds.length > 0;

  return (
    <div className="min-h-screen bg-themed">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[80%] bg-rose-50/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-indigo-50/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-12">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-14 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                <span className="text-white text-sm font-display font-bold">&#x2726;</span>
              </div>
              <div>
                <p className="text-themed text-sm font-display font-semibold">DELTA EBooks</p>
                <p className="text-themed-muted text-[10px] tracking-wider uppercase">by {AUTHOR}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onToggleTheme} className="p-2.5 rounded-full bg-themed-muted border border-themed text-themed-sub hover:text-themed transition-all" title={`Theme: ${theme}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={themeIcons[theme]} />
                </svg>
              </button>

              {totalCompleted > 0 && (
                <div className="hidden sm:flex items-center gap-3 bg-themed-card px-4 py-2 rounded-full border border-themed">
                  <div className="w-20 h-1.5 bg-themed-muted rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${overallPercent}%` }} />
                  </div>
                  <span className="text-xs font-bold text-themed-sub">{overallPercent}%</span>
                </div>
              )}

              {user ? (
                <button onClick={onOpenDashboard} className="flex items-center gap-2 bg-themed-card border border-themed px-4 py-2.5 rounded-full text-themed text-xs font-bold hover:bg-themed-muted transition-all">
                  <div className="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">{(user.name || user.email)[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline">My Books</span>
                </button>
              ) : (
                <button onClick={onOpenAuth} className="bg-stone-800 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-all">
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-14">
            <div className="animate-fadeIn">
              <h2 className="text-xs tracking-[0.5em] uppercase font-bold mb-5" style={{ color: 'var(--accent)' }}>The Universal Library</h2>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display text-themed mb-6 font-medium">Choose Your Journey</h1>
              <p className="text-themed-muted font-serif text-xl italic max-w-xl mx-auto leading-relaxed">"We do not read books; we traverse landscapes of thought."</p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold">First {FREE_CHAPTERS} chapters free</div>
                <div className="inline-flex items-center gap-2 bg-themed-card border border-themed text-themed-sub px-4 py-2 rounded-full text-xs font-bold">One-time payment &middot; Lifetime access</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad banner for free users */}
      {!hasPurchases && (
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="ad-banner rounded-2xl p-5 text-center animate-fadeIn">
            <p className="text-themed-muted text-[10px] font-bold uppercase tracking-wider mb-1">Sponsored</p>
            <p className="text-themed-sub text-sm">Discover our premium collection — wisdom that transforms your life, one chapter at a time.</p>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {books.map((book, index) => {
            const bp = progress.books[book.id];
            const completedCount = bp ? bp.completedIds.length : 0;
            const chapterCount = book.chapters.length;
            const bookPercent = chapterCount > 0 ? Math.round((completedCount / chapterCount) * 100) : 0;
            const colors = accentMap[book.accentColor] || accentMap.stone;
            const purchased = purchasedBookIds.includes(book.id);

            return (
              <div key={book.id} onClick={() => onSelect(book)} className="group cursor-pointer animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="relative bg-themed-card rounded-3xl overflow-hidden border border-themed hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {purchased ? (
                        <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Owned</span>
                        </div>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                          <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">${PRICE_PER_BOOK}</span>
                        </div>
                      )}
                    </div>

                    {purchased && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                          <svg className="w-3 h-3 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="text-[10px] font-bold text-stone-700 uppercase">PDF</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">{book.author}</p>
                      <h3 className="text-white text-2xl sm:text-3xl font-display leading-tight font-medium group-hover:translate-x-1 transition-transform duration-500">{book.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-[10px] font-bold uppercase tracking-wider mb-4`}>
                      <span>{book.subtitle}</span>
                    </div>
                    <p className="text-themed-sub font-serif italic text-base leading-relaxed mb-6">{book.description}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 h-1.5 bg-themed-muted rounded-full overflow-hidden">
                        <div className={`h-full ${colors.badge} rounded-full transition-all duration-700`} style={{ width: `${bookPercent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-themed-muted">{bookPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-themed-muted text-xs">
                        {purchased ? `${completedCount} of ${chapterCount} completed` : `${FREE_CHAPTERS} free chapters · ${chapterCount} total`}
                      </span>
                      <div className="flex items-center gap-2 text-themed text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                        <span>{purchased ? (completedCount > 0 ? 'Continue' : 'Read') : 'Preview Free'}</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upsell for partial purchasers */}
      {hasPurchases && purchasedBookIds.length < books.length && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[-50%] right-[-20%] w-[60%] h-[120%] bg-rose-500/10 rounded-full blur-[80px]" /></div>
            <div className="relative z-10">
              <h3 className="text-white font-display text-2xl sm:text-3xl font-medium mb-2">Complete Your Collection</h3>
              <p className="text-stone-400 font-serif italic text-lg mb-6">{books.length - purchasedBookIds.length} more book{books.length - purchasedBookIds.length > 1 ? 's' : ''} waiting for you</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {books.filter(b => !purchasedBookIds.includes(b.id)).slice(0, 3).map(b => (
                  <button key={b.id} onClick={(e) => { e.stopPropagation(); onOpenPricing(b); }} className="bg-white text-stone-800 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-all">
                    Get "{b.title.split(' ').slice(0, 3).join(' ')}..." — ${PRICE_PER_BOOK}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-xs tracking-[0.4em] uppercase font-bold mb-3" style={{ color: 'var(--accent)' }}>What Readers Say</h2>
          <p className="font-display text-3xl text-themed font-medium">Trusted by Thousands</p>
          <p className="text-themed-muted text-sm mt-2">2,847 readers &middot; 4.9 average rating</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-themed-card border border-themed rounded-2xl p-6 sm:p-8 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-themed-sub font-serif italic leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="text-themed font-bold text-sm">{t.name}</p>
                <p className="text-themed-muted text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure Payment', desc: 'PayPal protected checkout.', color: 'emerald' },
            { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: '7-Day Refund', desc: 'Full refund, no questions asked.', color: 'blue' },
            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Lifetime Access', desc: 'Buy once, read forever.', color: 'amber' },
          ].map((item, i) => (
            <div key={i} className="bg-themed-card border border-themed rounded-2xl p-6 text-center">
              <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              </div>
              <h3 className="font-display text-themed font-medium mb-1">{item.title}</h3>
              <p className="text-themed-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-themed-card border border-themed rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="font-display text-xl text-themed font-medium mb-3">Bonus Content with Every Purchase</h3>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            {['Bonus chapter', 'Reflection checklist', 'PDF download', 'AI companion'].map(b => (
              <div key={b} className="flex items-center gap-2 text-themed-sub text-sm">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Author */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-themed-muted rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
            <span className="text-white text-4xl font-display font-bold">M</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-2xl text-themed font-medium mb-2">About {AUTHOR}</h3>
            <p className="text-themed-sub font-serif italic leading-relaxed mb-4">
              Mohamed Oublal is a philosopher, author, and personal development guide dedicated to helping people build deeper relationships, discover their purpose, and master their inner world.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {['4 Books', '80 Chapters', '2,847 Readers'].map(s => (
                <span key={s} className="bg-themed-card border border-themed text-themed-sub px-4 py-2 rounded-full text-xs font-bold">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <EmailCapture variant="card" />
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          <div className="w-8 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>
        <p className="text-themed-muted text-xs tracking-[0.2em] uppercase font-medium mb-2">The Universal Wisdom Library</p>
        <p className="text-themed-muted text-xs font-serif italic mb-4">{totalChapters} chapters by {AUTHOR}</p>
        <div className="flex items-center justify-center gap-4 text-themed-muted text-[10px]">
          <span>Secure PayPal</span><span>&middot;</span><span>7-day refund</span><span>&middot;</span><span>support@delta-ebooks.com</span>
        </div>
      </footer>
    </div>
  );
};

export default ShelfView;
