
import React from 'react';
import { Book, UserProgress } from '../types';
import { AUTHOR } from '../constants';

interface ShelfViewProps {
  books: Book[];
  progress: UserProgress;
  onSelect: (book: Book) => void;
}

const accentMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-500' },
  stone: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300', badge: 'bg-stone-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-500' },
};

const ShelfView: React.FC<ShelfViewProps> = ({ books, progress, onSelect }) => {
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
        {/* Background decoration */}
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

            {totalCompleted > 0 && (
              <div className="hidden sm:flex items-center gap-4 bg-white/80 px-5 py-2.5 rounded-full border border-stone-100 shadow-sm">
                <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${overallPercent}%` }} />
                </div>
                <span className="text-xs font-bold text-stone-600">{overallPercent}% Complete</span>
              </div>
            )}
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <div className="w-8 h-px bg-stone-200" />
                <div className="w-2 h-2 rounded-full bg-stone-200" />
                <div className="w-8 h-px bg-stone-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {books.map((book, index) => {
            const bp = progress.books[book.id];
            const completedCount = bp ? bp.completedIds.length : 0;
            const chapterCount = book.chapters.length;
            const bookPercent = chapterCount > 0 ? Math.round((completedCount / chapterCount) * 100) : 0;
            const colors = accentMap[book.accentColor] || accentMap.stone;

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
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Chapter count badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">{chapterCount} Chapters</span>
                    </div>

                    {/* Title overlay on image */}
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

                    <p className="text-stone-500 font-serif italic text-base leading-relaxed mb-6">
                      {book.description}
                    </p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.badge} rounded-full transition-all duration-700`}
                          style={{ width: `${bookPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-400">{bookPercent}%</span>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-stone-400 text-xs">
                        {completedCount > 0 ? `${completedCount} of ${chapterCount} completed` : 'Not started yet'}
                      </span>
                      <div className="flex items-center gap-2 text-stone-800 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                        <span>{completedCount > 0 ? 'Continue' : 'Begin'}</span>
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

        {/* Footer */}
        <footer className="mt-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-px bg-stone-200" />
            <div className="w-2 h-2 rounded-full bg-stone-200" />
            <div className="w-8 h-px bg-stone-200" />
          </div>
          <p className="text-stone-300 text-xs tracking-[0.2em] uppercase font-medium mb-2">
            The Universal Wisdom Library
          </p>
          <p className="text-stone-300 text-xs font-serif italic">
            {totalChapters} chapters of philosophical wisdom by {AUTHOR}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ShelfView;
