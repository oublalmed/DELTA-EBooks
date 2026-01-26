
import React from 'react';
import { Book, UserProgress, PremiumState, FREE_CHAPTERS_PER_BOOK, PRICE_PER_BOOK, PRICE_ALL_ACCESS } from '../types';
import { AUTHOR } from '../constants';
import EmailCapture from './EmailCapture';

interface ShelfViewProps {
  books: Book[];
  progress: UserProgress;
  premium: PremiumState;
  onSelect: (book: Book) => void;
  onOpenPricing: (book?: Book) => void;
}

const accentMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-500' },
  stone: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300', badge: 'bg-stone-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-500' },
};

const testimonials = [
  { name: "Sara M.", text: "This collection changed how I see relationships. The reflection prompts are incredibly powerful.", role: "Reader" },
  { name: "James K.", text: "The Stoic book alone is worth the price. I read a chapter every morning as part of my routine.", role: "Daily Reader" },
  { name: "Amira L.", text: "The AI companion feels like having a wise mentor available 24/7. Truly unique experience.", role: "Premium Member" },
];

const ShelfView: React.FC<ShelfViewProps> = ({ books, progress, premium, onSelect, onOpenPricing }) => {
  const totalChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);
  const totalCompleted = books.reduce((sum, b) => {
    const bp = progress.books[b.id];
    return sum + (bp ? bp.completedIds.length : 0);
  }, 0);
  const overallPercent = totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[80%] bg-rose-50/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-indigo-50/30 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-16 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                <span className="text-white text-sm font-display font-bold">&#x2726;</span>
              </div>
              <div>
                <p className="text-stone-800 font-display font-semibold text-sm">DELTA EBooks</p>
                <p className="text-stone-400 text-[10px] tracking-wider uppercase">by {AUTHOR}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {totalCompleted > 0 && (
                <div className="hidden sm:flex items-center gap-4 bg-white/80 px-5 py-2.5 rounded-full border border-stone-100 shadow-sm">
                  <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${overallPercent}%` }} />
                  </div>
                  <span className="text-xs font-bold text-stone-600">{overallPercent}%</span>
                </div>
              )}
              {!premium.allAccess && (
                <button
                  onClick={() => onOpenPricing()}
                  className="bg-stone-800 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-all"
                >
                  Get All Access
                </button>
              )}
              {premium.allAccess && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Premium
                </div>
              )}
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-16">
            <div className="animate-fadeIn">
              <h2 className="text-rose-600 text-xs tracking-[0.5em] uppercase font-bold mb-5">The Universal Library</h2>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display text-stone-800 mb-6 font-medium">
                Choose Your Journey
              </h1>
              <p className="text-stone-400 font-serif text-xl italic max-w-xl mx-auto leading-relaxed">
                "We do not read books; we traverse landscapes of thought."
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold">
                  First {FREE_CHAPTERS_PER_BOOK} chapters of every book are free
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="w-8 h-px bg-stone-200" />
                <div className="w-2 h-2 rounded-full bg-stone-200" />
                <div className="w-8 h-px bg-stone-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {books.map((book, index) => {
            const bp = progress.books[book.id];
            const completedCount = bp ? bp.completedIds.length : 0;
            const chapterCount = book.chapters.length;
            const bookPercent = chapterCount > 0 ? Math.round((completedCount / chapterCount) * 100) : 0;
            const colors = accentMap[book.accentColor] || accentMap.stone;
            const unlocked = premium.allAccess || premium.unlockedBooks.includes(book.id);

            return (
              <div
                key={book.id}
                onClick={() => onSelect(book)}
                className={`group cursor-pointer animate-fadeIn`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative bg-white rounded-3xl overflow-hidden border border-stone-100 hover:border-stone-200 transition-all duration-500 hover:shadow-2xl hover:shadow-stone-200/50 hover:-translate-y-1">
                  {/* Cover Image */}
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {unlocked ? (
                        <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Unlocked</span>
                        </div>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                          <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">{FREE_CHAPTERS_PER_BOOK} Free Chapters</span>
                        </div>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">{book.author}</p>
                      <h3 className="text-white text-2xl sm:text-3xl font-display leading-tight font-medium group-hover:translate-x-1 transition-transform duration-500">{book.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-[10px] font-bold uppercase tracking-wider mb-4`}>
                      <span>{book.subtitle}</span>
                    </div>

                    <p className="text-stone-500 font-serif italic text-base leading-relaxed mb-6">{book.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors.badge} rounded-full transition-all duration-700`} style={{ width: `${bookPercent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-stone-400">{bookPercent}%</span>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-stone-400 text-xs">
                        {completedCount > 0 ? `${completedCount} of ${chapterCount} completed` : `${chapterCount} chapters`}
                      </span>
                      <div className="flex items-center gap-2 text-stone-800 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                        <span>{completedCount > 0 ? 'Continue' : 'Begin Free'}</span>
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

      {/* All-Access Banner */}
      {!premium.allAccess && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[120%] bg-rose-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white font-display text-3xl sm:text-4xl font-medium mb-3">Unlock All {books.length} Books</h3>
              <p className="text-stone-400 font-serif italic text-lg mb-2">{totalChapters} chapters of transformative wisdom</p>
              <p className="text-stone-500 text-sm mb-8">One-time payment. Lifetime access. No subscriptions.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onOpenPricing()}
                  className="bg-white text-stone-800 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-stone-100 transition-all hover:shadow-2xl"
                >
                  Get All-Access for ${PRICE_ALL_ACCESS}
                </button>
                <span className="text-stone-500 text-xs">or ${PRICE_PER_BOOK} per book</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-rose-600 text-xs tracking-[0.4em] uppercase font-bold mb-3">What Readers Say</h2>
          <p className="font-display text-3xl text-stone-800 font-medium">Trusted by Thousands</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border border-stone-100 rounded-2xl p-6 sm:p-8 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-stone-600 font-serif italic leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="text-stone-800 font-bold text-sm">{t.name}</p>
                <p className="text-stone-400 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About the Author */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
            <span className="text-white text-4xl font-display font-bold">M</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-2xl text-stone-800 font-medium mb-2">About {AUTHOR}</h3>
            <p className="text-stone-500 font-serif italic leading-relaxed mb-4">
              Mohamed Oublal is a philosopher, author, and personal development guide dedicated to helping people build deeper relationships, discover their purpose, and master their inner world. His work blends ancient wisdom with modern psychology to create practical, transformative content.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-full text-xs font-bold">4 Published Books</span>
              <span className="bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-full text-xs font-bold">80+ Chapters</span>
              <span className="bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-full text-xs font-bold">2,000+ Readers</span>
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
          <div className="w-8 h-px bg-stone-200" />
          <div className="w-2 h-2 rounded-full bg-stone-200" />
          <div className="w-8 h-px bg-stone-200" />
        </div>
        <p className="text-stone-300 text-xs tracking-[0.2em] uppercase font-medium mb-2">
          The Universal Wisdom Library
        </p>
        <p className="text-stone-300 text-xs font-serif italic mb-4">
          {totalChapters} chapters of philosophical wisdom by {AUTHOR}
        </p>
        <p className="text-stone-300 text-[10px]">Secure payments via PayPal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ShelfView;
