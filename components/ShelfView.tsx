
import React, { useState, useEffect } from 'react';
import { Book, UserProgress, User, ThemeMode, ReadingStreak, FREE_CHAPTERS } from '../types';
import { AUTHOR } from '../constants';
import AdBanner from './AdBanner';
import EmailCapture from './EmailCapture';
import Logo from './Logo';

interface ShelfViewProps {
  books: Book[];
  progress: UserProgress;
  unlockedBookIds: string[];
  user: User | null;
  theme: ThemeMode;
  streak: ReadingStreak;
  onSelect: (book: Book) => void;
  onUnlock: (book?: Book) => void;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenExpression: () => void;
  onOpenJourney: () => void;
}

const accentMap: Record<string, { bg: string; text: string; badge: string; gradient: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', badge: 'bg-rose-500', gradient: 'from-rose-500 to-pink-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-500', gradient: 'from-indigo-500 to-purple-600' },
  stone: { bg: 'bg-stone-100', text: 'text-stone-600', badge: 'bg-stone-500', gradient: 'from-stone-500 to-stone-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
};

const testimonials = [
  { name: "Sara M.", text: "This collection changed how I see relationships. The reflection prompts are incredibly powerful.", role: "Reader", rating: 5, avatar: "S" },
  { name: "James K.", text: "The Stoic book alone is worth every penny. I read a chapter every morning as part of my routine.", role: "Daily Reader", rating: 5, avatar: "J" },
  { name: "Amira L.", text: "The AI companion feels like having a wise mentor available 24/7. Truly unique reading experience.", role: "Book Owner", rating: 5, avatar: "A" },
  { name: "David R.", text: "I've bought all four books. The mindful living guide brought peace I didn't know was possible.", role: "Complete Collection", rating: 5, avatar: "D" },
];

const motivationalInsights = [
  { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", title: "Read with Purpose", desc: "Each chapter is a step toward transformation" },
  { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "Gain Clarity", desc: "Philosophical insights for modern challenges" },
  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: "Transform Your Life", desc: "Wisdom that creates lasting change" },
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

const ShelfView: React.FC<ShelfViewProps> = ({ books, progress, unlockedBookIds, user, theme, streak, onSelect, onUnlock, onToggleTheme, onOpenAuth, onOpenDashboard, onOpenExpression, onOpenJourney }) => {
  const totalChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);
  const totalCompleted = books.reduce((sum, b) => {
    const bp = progress.books[b.id];
    return sum + (bp ? bp.completedIds.length : 0);
  }, 0);
  const overallPercent = totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0;
  const hasUnlocks = unlockedBookIds.length > 0;
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
      {/* Hero header with background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1920"
            alt="Library"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[80%] bg-rose-50/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-amber-50/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-12">
          {/* Top bar with Logo */}
          <div className="flex items-center justify-between mb-14 animate-fadeIn">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} />
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-display font-bold">&#x2726;</span>
              </div>
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
                <button onClick={onOpenAuth} className="bg-stone-800 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl">
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-14">
            <div className="animate-fadeIn">
              <div className="ornament-divider mb-6">
                <span className="text-xs tracking-[0.5em] uppercase font-bold" style={{ color: 'var(--accent)' }}>The Universal Library</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display text-themed mb-6 font-medium">Choose Your Journey</h1>
              <p className="text-themed-muted font-serif text-xl italic max-w-xl mx-auto leading-relaxed mb-4">
                "Every book is a door to a better version of yourself."
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  First {FREE_CHAPTERS} chapters preview
                </div>
                <div className="inline-flex items-center gap-2 bg-themed-card border border-themed text-themed-sub px-4 py-2 rounded-full text-xs font-bold">Ad-supported unlocks &middot; No subscription</div>
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  4.9 Rating &middot; 2,847 Readers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational insights row */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {motivationalInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-4 bg-themed-card border border-themed rounded-2xl p-5 hover-lift animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={insight.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-themed font-bold text-sm mb-1">{insight.title}</h3>
                <p className="text-themed-muted text-xs">{insight.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured ad banner for new readers */}
      {!hasUnlocks && (
        <div className="max-w-6xl mx-auto px-6 pb-10">
          <AdBanner placement="shelf-featured" variant="medium" />
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
            const isUnlocked = unlockedBookIds.includes(book.id);

            return (
              <div key={book.id} onClick={() => onSelect(book)} className="group cursor-pointer animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="premium-card relative bg-themed-card rounded-3xl overflow-hidden border border-themed">
                  {/* Cover image */}
                  <div className="relative h-64 sm:h-80 overflow-hidden">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <div>
                        {index === 0 && !isUnlocked && (
                          <div className="badge-featured px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1.5 mb-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            BESTSELLER
                          </div>
                        )}
                        {isUnlocked && (
                          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                            <svg className="w-3 h-3 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="text-[10px] font-bold text-stone-700 uppercase">PDF</span>
                          </div>
                        )}
                      </div>
                      <div>
                        {isUnlocked ? (
                          <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Owned</span>
                          </div>
                        ) : (
                          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <span className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Ad Supported</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Book info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <p className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">{book.author}</p>
                      <h3 className="text-white text-2xl sm:text-3xl font-display leading-tight font-medium group-hover:translate-x-1 transition-transform duration-500 text-shadow-hero">{book.title}</h3>
                    </div>
                  </div>

                  {/* Book details */}
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-[10px] font-bold uppercase tracking-wider`}>
                        <span>{book.subtitle}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, s) => (
                          <svg key={s} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-themed-sub font-serif italic text-base leading-relaxed mb-6">{book.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 h-2 bg-themed-muted rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700`} style={{ width: `${bookPercent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-themed-muted">{bookPercent}%</span>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <span className="text-themed-muted text-xs">
                        {isUnlocked ? `${completedCount} of ${chapterCount} completed` : `${FREE_CHAPTERS} free chapters · ${chapterCount} total`}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--accent)' }}>
                        <span>{isUnlocked ? (completedCount > 0 ? 'Continue Reading' : 'Start Reading') : 'Preview Free'}</span>
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

      {/* Mid-page motivational quote section */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=1920"
            alt="Inspiration"
            className="w-full h-64 sm:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <div className="text-center max-w-2xl">
              <svg className="w-10 h-10 text-amber-400/60 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white font-serif text-2xl sm:text-3xl italic leading-relaxed mb-4">
                A book is a garden, an orchard, a storehouse, a party, a company by the way, a counselor, a multitude of counselors.
              </p>
              <p className="text-amber-400/80 text-xs font-bold uppercase tracking-[0.3em]">— Charles Baudelaire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad-supported unlock banner */}
      {!hasUnlocks && (
        <div className="max-w-6xl mx-auto px-6 pb-10">
          <div className="bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden animate-borderGlow border border-amber-500/20">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[120%] bg-amber-500/5 rounded-full blur-[80px]" />
              <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[80%] bg-rose-500/5 rounded-full blur-[60px]" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
              {/* Book covers preview */}
              <div className="flex -space-x-4 shrink-0">
                {books.slice(0, 4).map((b, i) => (
                  <img key={b.id} src={b.coverImage} alt={b.title} className="w-16 h-22 sm:w-20 sm:h-28 object-cover rounded-lg border-2 border-stone-700 shadow-lg" style={{ zIndex: 4 - i }} />
                ))}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Ad Supported
                </div>
                <h3 className="text-white font-display text-2xl sm:text-3xl font-medium mb-2">Unlock Any Book by Watching a Short Ad</h3>
                <p className="text-stone-400 font-serif italic text-base mb-5">
                  Enjoy full access to all {books[0].chapters.length} chapters with a quick ad unlock. <span className="text-amber-400/80 not-italic font-sans text-xs font-bold uppercase">No subscription. Always ad supported.</span>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button onClick={() => onUnlock(books[0])} className="bg-gradient-to-r from-amber-400 to-amber-300 text-stone-900 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-amber-400/20 transition-all hover:-translate-y-0.5">
                    Watch Ad to Unlock
                  </button>
                  <span className="text-stone-500 text-[10px] uppercase tracking-wider font-bold">Support free reading with ads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock more books with ads */}
      {hasUnlocks && unlockedBookIds.length < books.length && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[-50%] right-[-20%] w-[60%] h-[120%] bg-rose-500/10 rounded-full blur-[80px]" /></div>
            <div className="relative z-10">
              <h3 className="text-white font-display text-2xl sm:text-3xl font-medium mb-2">Unlock More Wisdom</h3>
              <p className="text-stone-400 font-serif italic text-lg mb-6">{books.length - unlockedBookIds.length} more book{books.length - unlockedBookIds.length > 1 ? 's' : ''} waiting for you</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {books.filter(b => !unlockedBookIds.includes(b.id)).slice(0, 3).map(b => (
                  <button key={b.id} onClick={(e) => { e.stopPropagation(); onUnlock(b); }} className="bg-white text-stone-800 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-all">
                    Watch Ad for "{b.title.split(' ').slice(0, 3).join(' ')}..."
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
          <div className="ornament-divider mb-4">
            <span className="text-xs tracking-[0.4em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Reader Stories</span>
          </div>
          <p className="font-display text-3xl sm:text-4xl text-themed font-medium mb-2">Trusted by Thousands</p>
          <p className="text-themed-muted text-sm mt-2">2,847 readers &middot; 4.9 average rating</p>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-themed-card border border-themed rounded-2xl p-6 hover-lift animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-themed-sub font-serif italic leading-relaxed mb-5 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-themed font-bold text-sm">{t.name}</p>
                    <p className="text-themed-muted text-[10px] uppercase tracking-wider font-bold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-stone-800 w-6' : 'bg-themed-muted'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* What you get section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4">
            <span className="text-xs tracking-[0.4em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Everything Included</span>
          </div>
          <p className="font-display text-3xl text-themed font-medium">More Than Just Books</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Full Book Access', desc: 'All 20 chapters per book, beautifully typeset', color: 'rose' },
            { icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'PDF Download', desc: 'Watermarked PDF for offline reading', color: 'indigo' },
            { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', title: 'AI Companion', desc: 'Personal philosophical guide powered by AI', color: 'emerald' },
            { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', title: 'Reflection Journal', desc: 'Sacred prompts for deep self-discovery', color: 'amber' },
          ].map((item, i) => (
            <div key={i} className="bg-themed-card border border-themed rounded-2xl p-6 text-center hover-lift animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-7 h-7 text-${item.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              </div>
              <h3 className="font-display text-themed font-medium text-lg mb-2">{item.title}</h3>
              <p className="text-themed-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expression Space & Journey Calendar */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4">
            <span className="text-xs tracking-[0.4em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Your Inner World</span>
          </div>
          <p className="font-display text-3xl text-themed font-medium mb-2">Reflect, Express, Grow</p>
          <p className="text-themed-muted font-serif italic text-base max-w-lg mx-auto">Two powerful spaces designed for your personal journey of self-discovery and growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expression Space Card */}
          <div onClick={onOpenExpression} className="group cursor-pointer">
            <div className="expression-nav-card premium-card relative bg-themed-card rounded-3xl overflow-hidden border border-themed">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"
                  alt="Philosophical Expression"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <div className="bg-indigo-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Expressive Journal
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-2xl font-display font-medium text-shadow-hero">Philosophical Expression Space</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-themed-sub font-serif italic text-base leading-relaxed mb-4">
                  A sacred space to express your feelings, experiences, adventures, successes, and deepest emotions. Write like a philosopher reflecting on life.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Feelings</span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">Insights</span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider">Stories</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--accent)' }}>
                    <span>Enter</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Calendar Card */}
          <div onClick={onOpenJourney} className="group cursor-pointer">
            <div className="journey-nav-card premium-card relative bg-themed-card rounded-3xl overflow-hidden border border-themed">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800"
                  alt="Personal Journey"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Personal Calendar
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-2xl font-display font-medium text-shadow-hero">Personal Journey Calendar</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-themed-sub font-serif italic text-base leading-relaxed mb-4">
                  Track your journey day by day. Record emotions, milestones, challenges, and reflections. Watch your growth unfold over time.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Tracking</span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Growth</span>
                    <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">Patterns</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--accent)' }}>
                    <span>Enter</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Ad Supported', desc: 'Short ads keep the library free for everyone.', color: 'emerald' },
            { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'No Subscription', desc: 'Unlock books with a quick ad when needed.', color: 'blue' },
            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Always Available', desc: 'Read anywhere with mobile-first layouts.', color: 'amber' },
          ].map((item, i) => (
            <div key={i} className="bg-themed-card border border-themed rounded-2xl p-6 text-center hover-lift">
              <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              </div>
              <h3 className="font-display text-themed font-medium mb-1">{item.title}</h3>
              <p className="text-themed-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Author */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-themed-muted rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] right-[-20%] w-[50%] h-[80%] bg-amber-100/20 rounded-full blur-[80px]" />
          </div>
          <div className="relative w-32 h-32 rounded-2xl bg-stone-800 flex items-center justify-center shrink-0 shadow-xl">
            <span className="text-white text-5xl font-display font-bold">M</span>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-stone-900 w-8 h-8 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
            </div>
          </div>
          <div className="relative flex-1 text-center md:text-left">
            <p className="text-themed-muted text-[10px] uppercase tracking-[0.3em] font-bold mb-2">About the Author</p>
            <h3 className="font-display text-2xl sm:text-3xl text-themed font-medium mb-3">{AUTHOR}</h3>
            <p className="text-themed-sub font-serif italic leading-relaxed mb-5 text-lg">
              A philosopher, author, and personal development guide dedicated to helping people build deeper relationships, discover their purpose, and master their inner world through timeless wisdom.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {[
                { value: '4', label: 'Books Published' },
                { value: '80', label: 'Chapters Written' },
                { value: '2,847', label: 'Readers Worldwide' },
              ].map(s => (
                <div key={s.label} className="bg-themed-card border border-themed px-4 py-2.5 rounded-xl text-center">
                  <div className="text-themed font-display font-bold text-lg">{s.value}</div>
                  <div className="text-themed-muted text-[10px] uppercase tracking-wider font-bold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <EmailCapture variant="card" />
      </div>

      {/* Final CTA before footer */}
      {!hasUnlocks && (
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <div className="text-center bg-themed-card border border-themed rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-50%] left-[50%] -translate-x-1/2 w-[80%] h-[80%] bg-rose-50/30 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-3xl sm:text-4xl text-themed font-medium mb-4">Ready to Begin Your Journey?</h2>
              <p className="text-themed-sub font-serif italic text-lg mb-8 max-w-lg mx-auto">
                The wisdom you seek is waiting inside these pages. Take the first step today.
              </p>
              <button
                onClick={() => onUnlock(books[0])}
                className="cta-premium text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:shadow-2xl transition-all hover:-translate-y-0.5 inline-flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Watch Ad to Unlock
              </button>
              <p className="text-themed-muted text-xs mt-4">Ad-supported reading keeps the library free for everyone</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="ornament-divider mb-6">
          <span className="text-themed-muted text-lg">&#x2726;</span>
        </div>
        <p className="text-themed-muted text-xs tracking-[0.2em] uppercase font-medium mb-2">The Universal Wisdom Library</p>
        <p className="text-themed-muted text-xs font-serif italic mb-4">{totalChapters} chapters of wisdom by {AUTHOR}</p>
        <div className="flex items-center justify-center gap-4 text-themed-muted text-[10px]">
          <span>Ad-supported</span><span>&middot;</span><span>Free access</span><span>&middot;</span><span>Privacy-first</span><span>&middot;</span><span>support@delta-ebooks.com</span>
        </div>
      </footer>
    </div>
  );
};

export default ShelfView;
