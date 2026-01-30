
import React, { useState } from 'react';
import { Chapter, Book } from '../types';
import AdBanner from './AdBanner';

interface LibraryViewProps {
  book: Book;
  completedIds: number[];
  isBookUnlocked: boolean;
  freeChapters: number;
  onSelect: (chapter: Chapter) => void;
  onChat: () => void;
  onBack: () => void;
  onUnlock: () => void;
}

const accentMap: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', badge: 'bg-rose-500', border: 'border-rose-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-500', border: 'border-indigo-200' },
  stone: { bg: 'bg-stone-100', text: 'text-stone-600', badge: 'bg-stone-500', border: 'border-stone-300' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-500', border: 'border-emerald-200' },
};

const LibraryView: React.FC<LibraryViewProps> = ({ book, completedIds, isBookUnlocked, freeChapters, onSelect, onChat, onBack, onUnlock }) => {
  const [search, setSearch] = useState('');
  const colors = accentMap[book.accentColor] || accentMap.stone;
  const progress = book.chapters.length > 0 ? Math.round((completedIds.length / book.chapters.length) * 100) : 0;

  const filteredChapters = book.chapters.filter(ch =>
    ch.title.toLowerCase().includes(search.toLowerCase()) ||
    ch.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const getChapterStatus = (chapter: Chapter) => {
    if (isBookUnlocked) return 'accessible';
    if (chapter.id <= 2) return 'free';
    if (chapter.id === 3) return 'partial';
    if (chapter.id === 4) return 'teaser';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-themed">
      {/* Hero Header */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Library</span>
            </button>
            <button onClick={onChat} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs font-bold hover:bg-white/20 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Companion
            </button>
          </div>
        </div>

        {/* Book info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              {isBookUnlocked ? (
                <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Unlocked
                </span>
              ) : (
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {freeChapters} Preview Chapters
                </span>
              )}
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-display font-medium mb-2">{book.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-xs">
              <span>{book.author}</span>
              <span>&middot;</span>
              <span>{book.chapters.length} chapters</span>
              <span>&middot;</span>
              <span>~{book.chapters.length * 5} min read</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-2 bg-themed-muted rounded-full overflow-hidden">
            <div className={`h-full ${colors.badge} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-bold text-themed-sub">{progress}% complete</span>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-themed-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chapters..."
            className="w-full pl-11 pr-4 py-3 bg-themed-card border border-themed rounded-xl text-themed text-sm outline-none focus:ring-2 focus:ring-stone-300 transition-all"
          />
        </div>

        {/* Unlock banner */}
        {!isBookUnlocked && (
          <div className="mb-8 bg-gradient-to-r from-stone-800 to-stone-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-display text-lg font-medium">Unlock All {book.chapters.length} Chapters</h3>
              <p className="text-stone-400 text-sm">Watch a short ad to unlock full access to this book.</p>
            </div>
            <button onClick={onUnlock} className="bg-white text-stone-800 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-stone-100 transition-all whitespace-nowrap">
              Watch Ad to Unlock
            </button>
          </div>
        )}

        <AdBanner placement="library-mid" variant="banner" />

        {/* Chapters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChapters.map((chapter, index) => {
            const status = getChapterStatus(chapter);
            const isCompleted = completedIds.includes(chapter.id);
            const isLocked = status === 'locked';

            return (
              <div
                key={chapter.id}
                onClick={() => !isLocked ? onSelect(chapter) : onUnlock()}
                className={`group cursor-pointer animate-fadeIn ${isLocked ? 'opacity-70' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`bg-themed-card border border-themed rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${isLocked ? '' : 'hover:-translate-y-0.5'}`}>
                  {/* Chapter image */}
                  <div className="relative h-32 overflow-hidden">
                    <img src={chapter.image} alt={chapter.title} className={`w-full h-full object-cover ${isLocked ? 'blur-sm' : 'group-hover:scale-105'} transition-all duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Chapter number */}
                    <div className="absolute top-3 left-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted ? 'bg-emerald-500 text-white' : isLocked ? 'bg-black/50 text-white/70' : `${colors.badge} text-white`
                      }`}>
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                        ) : chapter.id}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      {status === 'free' && <span className="bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Free</span>}
                      {status === 'partial' && <span className="bg-amber-500 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Preview</span>}
                      {status === 'teaser' && <span className="bg-orange-500 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Teaser</span>}
                      {status === 'locked' && (
                        <span className="bg-stone-700 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
                          Ad Locked
                        </span>
                      )}
                    </div>

                    {/* Lock overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-themed font-medium text-sm mb-1 leading-snug">{chapter.title}</h3>
                    <p className="text-themed-muted text-xs leading-relaxed line-clamp-2">{chapter.summary}</p>
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
