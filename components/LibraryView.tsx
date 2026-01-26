
import React, { useState } from 'react';
import { Chapter, Book } from '../types';

interface LibraryViewProps {
  book: Book;
  completedIds: number[];
  onSelect: (chapter: Chapter) => void;
  onChat: () => void;
  onBack: () => void;
}

const accentStyles: Record<string, { progressBg: string; badgeBg: string; hoverText: string; tagBg: string; tagText: string }> = {
  rose: { progressBg: 'bg-rose-500', badgeBg: 'bg-rose-500', hoverText: 'group-hover:text-rose-700', tagBg: 'bg-rose-50', tagText: 'text-rose-600' },
  indigo: { progressBg: 'bg-indigo-500', badgeBg: 'bg-indigo-500', hoverText: 'group-hover:text-indigo-700', tagBg: 'bg-indigo-50', tagText: 'text-indigo-600' },
  stone: { progressBg: 'bg-stone-500', badgeBg: 'bg-stone-600', hoverText: 'group-hover:text-stone-900', tagBg: 'bg-stone-100', tagText: 'text-stone-600' },
  emerald: { progressBg: 'bg-emerald-500', badgeBg: 'bg-emerald-500', hoverText: 'group-hover:text-emerald-700', tagBg: 'bg-emerald-50', tagText: 'text-emerald-600' },
};

const LibraryView: React.FC<LibraryViewProps> = ({ book, completedIds, onSelect, onChat, onBack }) => {
  const [search, setSearch] = useState('');

  const filteredChapters = book.chapters.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.summary.toLowerCase().includes(search.toLowerCase())
  );

  const progressPercent = Math.round((completedIds.length / book.chapters.length) * 100);
  const styles = accentStyles[book.accentColor] || accentStyles.stone;
  const readingTime = Math.ceil(book.chapters.length * 3.5);

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      {/* Hero header with book cover background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[#fdfcf9]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-all text-xs font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Library
            </button>

            <button
              onClick={onChat}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-full transition-all font-medium text-sm border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Ask Companion
            </button>
          </div>

          {/* Book info */}
          <div className="max-w-2xl animate-fadeIn">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-[10px] font-bold uppercase tracking-wider mb-4`}>
              {book.subtitle}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-white mb-4 font-medium leading-tight">{book.title}</h1>
            <p className="text-white/60 font-serif italic text-lg mb-8 max-w-lg">{book.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 text-white/50 text-xs">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {book.chapters.length} chapters
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ~{readingTime} min read
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {book.author}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-6 -mt-4">
        {/* Search and progress bar */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-lg p-4 sm:p-5 mb-10 animate-slideUp flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search chapters by title or topic..."
              className="w-full pl-11 pr-4 py-3 bg-stone-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-stone-200 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 px-4 sm:border-l border-stone-100">
            <div className="w-28 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full ${styles.progressBg} rounded-full transition-all duration-700`} style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-sm font-bold text-stone-700 whitespace-nowrap">{progressPercent}%</span>
          </div>
        </div>

        {/* Chapter count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-400 text-sm">
            {filteredChapters.length === book.chapters.length
              ? `All ${book.chapters.length} chapters`
              : `${filteredChapters.length} of ${book.chapters.length} chapters`}
          </p>
          <p className="text-stone-400 text-sm">{completedIds.length} completed</p>
        </div>

        {/* Chapter grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredChapters.map((chapter, index) => {
            const isCompleted = completedIds.includes(chapter.id);
            return (
              <div
                key={chapter.id}
                onClick={() => onSelect(chapter)}
                className="group cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isCompleted ? 'border-stone-200' : 'border-stone-100'}`}>
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={chapter.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={chapter.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Chapter number */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-stone-700">{chapter.id}</span>
                    </div>

                    {/* Completed badge */}
                    {isCompleted && (
                      <div className={`absolute top-3 right-3 ${styles.badgeBg} text-white p-1.5 rounded-full shadow-lg`}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-lg font-display text-stone-800 ${styles.hoverText} transition-colors leading-snug font-medium mb-1.5`}>
                      {chapter.title}
                    </h3>
                    <p className="text-stone-400 text-xs italic font-serif mb-3">{chapter.subtitle}</p>
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{chapter.summary}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
