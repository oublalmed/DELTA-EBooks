
import React, { useState, useEffect } from 'react';
import { Book, UserProgress, User, ThemeMode, ReadingStreak, FREE_CHAPTERS, PRICE_PER_BOOK, BUNDLE_PRICE, BUNDLE_SAVINGS } from '../types';
import { AUTHOR } from '../constants';
import EmailCapture from './EmailCapture';
import Logo from './Logo';

interface ShelfViewProps {
  books: Book[];
  progress: UserProgress;
  purchasedBookIds: string[];
  user: User | null;
  theme: ThemeMode;
  streak: ReadingStreak;
  onSelect: (book: Book) => void;
  onOpenPricing: (book?: Book) => void;
  onOpenBundle: () => void;
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
  { name: "Sara M.", text: "This collection changed how I see relationships. The reflection prompts are incredibly powerful.", role: "Reader", avatar: "S" },
  { name: "James K.", text: "The Stoic book alone is worth every penny. I read a chapter every morning as part of my routine.", role: "Daily Reader", avatar: "J" },
  { name: "Amira L.", text: "The AI companion feels like having a wise mentor available 24/7. Truly unique reading experience.", role: "Book Owner", avatar: "A" },
  { name: "Daniel R.", text: "Bought the bundle on a whim. Best $29.99 I've ever spent. The mindfulness book changed my mornings.", role: "Bundle Owner", avatar: "D" },
  { name: "Leila H.", text: "I've read dozens of self-help books. This collection is different — it makes you THINK, not just read.", role: "Verified Buyer", avatar: "L" },
];

const themeIcons: Record<ThemeMode, string> = {
  light: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  dark: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  sepia: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

const streakBadges = [
  { min: 3, label: 'Curious Mind', icon: '🌱' },
  { min: 7, label: 'Week Warrior', icon: '🔥' },
  { min: 14, label: 'Deep Thinker', icon: '🧠' },
  { min: 30, label: 'Philosopher', icon: '🏛️' },
  { min: 60, label: 'Wisdom Seeker', icon: '⭐' },
  { min: 100, label: 'Enlightened', icon: '👑' },
];

const ShelfView: React.FC<ShelfViewProps> = ({ books, progress, purchasedBookIds, user, theme, streak, onSelect, onOpenPricing, onOpenBundle, onToggleTheme, onOpenAuth, onOpenDashboard }) => {
  const totalChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);
  const totalCompleted = books.reduce((sum, b) => {
    const bp = progress.books[b.id];
    return sum + (bp ? bp.completedIds.length : 0);
  }, 0);
  const overallPercent = totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0;
  const hasPurchases = purchasedBookIds.length > 0;
  const [readerCount, setReaderCount] = useState(142);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Live reader count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setReaderCount(prev => Math.max(100, prev + Math.floor(Math.random() * 9) - 4));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentBadge = streakBadges.filter(b => streak.currentStreak >= b.min).pop();
  const nextBadge = streakBadges.find(b => streak.currentStreak < b.min);

  return (
    <div className="min-h-screen bg-themed">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[80%] bg-rose-50/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-indigo-50/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-12">
          {/* Top bar with Logo */}
          <div className="flex items-center justify-between mb-14 animate-fadeIn">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} />
              <div>
                <p className="text-themed text-sm font-display font-semibold">Delta Wisdom</p>
                <p className="text-themed-muted text-[10px] tracking-wider uppercase">by {AUTHOR}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onToggleTheme} className="p-2.5 rounded-full bg-themed-muted border border-themed text-themed-sub hover:text-themed transition-all" title={`Theme: ${theme}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={themeIcons[theme]} />
                </svg>
              </button>

              {/* Reading streak badge */}
              {streak.currentStreak > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-full">
                  <span className="text-sm">{currentBadge?.icon || '🔥'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{streak.currentStreak} day streak</span>
                </div>
              )}

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
                {/* Live readers */}
                <div className="inline-flex items-center gap-2 text-themed-muted px-3 py-2 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-600 font-bold">{readerCount}</span> reading now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Offer — show if user hasn't bought all books */}
      {purchasedBookIds.length < books.length && (
        <div className="max-w-6xl mx-auto px-6 pb-10">
          <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 overflow-hidden animate-fadeIn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-200/30 rounded-full blur-[40px]" />

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>
                  Best Value — Save ${BUNDLE_SAVINGS.toFixed(2)}
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-stone-800 mb-2">Get All {books.length} Books</h3>
                <p className="text-stone-600 font-serif italic mb-4">The complete philosophical library — {totalChapters} chapters of transformative wisdom</p>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <span className="text-stone-400 line-through text-lg">${(PRICE_PER_BOOK * books.length).toFixed(2)}</span>
                  <span className="text-3xl font-display font-bold text-stone-800">${BUNDLE_PRICE}</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Save {Math.round((BUNDLE_SAVINGS / (PRICE_PER_BOOK * books.length)) * 100)}%</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                {/* Mini book covers */}
                <div className="flex -space-x-3">
                  {books.map(b => (
                    <img key={b.id} src={b.coverImage} alt={b.title} className="w-12 h-16 object-cover rounded-lg border-2 border-white shadow-md" />
                  ))}
                </div>
                <button
                  onClick={onOpenBundle}
                  className="bg-stone-800 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-stone-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Buy Bundle — ${BUNDLE_PRICE}
                </button>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">One-time payment &middot; All books forever</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad banner for free users */}
      {!hasPurchases && (
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="ad-banner rounded-2xl p-5 text-center animate-fadeIn">
            <p className="text-themed-muted text-[10px] font-bold uppercase tracking-wider mb-1">Sponsored</p>
            <p className="text-themed-sub text-sm">Discover our premium collection — wisdom that transforms your life, one chapter at a time.</p>
          </div>
        </div>
      )}

      {/* Reading Streak Section */}
      {streak.currentStreak > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="bg-themed-card border border-themed rounded-2xl p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{currentBadge?.icon || '🔥'}</div>
                <div>
                  <p className="font-display text-themed text-lg font-medium">{streak.currentStreak}-Day Reading Streak</p>
                  <p className="text-themed-muted text-xs">{streak.totalDaysRead} total days read &middot; Longest: {streak.longestStreak} days</p>
                </div>
              </div>
              {nextBadge && (
                <div className="sm:ml-auto flex items-center gap-3 bg-themed-muted rounded-full px-4 py-2">
                  <div className="text-xl opacity-40">{nextBadge.icon}</div>
                  <div>
                    <p className="text-themed-sub text-[10px] font-bold uppercase tracking-wider">Next: {nextBadge.label}</p>
                    <div className="w-24 h-1.5 bg-themed rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(streak.currentStreak / nextBadge.min) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )}
              {streak.badges.length > 0 && (
                <div className="flex gap-1">
                  {streak.badges.map(b => {
                    const badge = streakBadges.find(sb => sb.label === b);
                    return badge ? <span key={b} className="text-xl" title={badge.label}>{badge.icon}</span> : null;
                  })}
                </div>
              )}
            </div>
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

      {/* Testimonials — rotating carousel */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-xs tracking-[0.4em] uppercase font-bold mb-3" style={{ color: 'var(--accent)' }}>What Readers Say</h2>
          <p className="font-display text-3xl text-themed font-medium">Trusted by Thousands</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
            </div>
            <span className="text-themed-sub text-sm font-bold">4.9</span>
            <span className="text-themed-muted text-sm">&middot; 2,847 readers</span>
          </div>
        </div>

        {/* Featured testimonial (rotating) */}
        <div className="bg-themed-card border border-themed rounded-3xl p-8 sm:p-10 mb-8 text-center transition-all duration-500">
          <div className="flex items-center gap-1 justify-center mb-5">
            {[...Array(5)].map((_, s) => (
              <svg key={s} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            ))}
          </div>
          <p className="text-themed-sub font-serif italic text-xl sm:text-2xl leading-relaxed mb-6 max-w-2xl mx-auto">
            "{testimonials[testimonialIdx].text}"
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{testimonials[testimonialIdx].avatar}</span>
            </div>
            <div className="text-left">
              <p className="text-themed font-bold text-sm">{testimonials[testimonialIdx].name}</p>
              <p className="text-themed-muted text-xs">{testimonials[testimonialIdx].role}</p>
            </div>
          </div>
          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-stone-800 w-6' : 'bg-themed-muted'}`} />
            ))}
          </div>
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
          <div className="w-28 h-28 rounded-full overflow-hidden shrink-0">
            <Logo size="lg" showText={false} />
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
        <div className="mb-6">
          <Logo size="sm" showText={true} />
        </div>
        <p className="text-themed-muted text-xs font-serif italic mb-4">{totalChapters} chapters by {AUTHOR}</p>
        <div className="flex items-center justify-center gap-4 text-themed-muted text-[10px]">
          <span>Secure PayPal</span><span>&middot;</span><span>7-day refund</span><span>&middot;</span><span>support@deltawisdom.com</span>
        </div>
      </footer>
    </div>
  );
};

export default ShelfView;
