
import React, { useState } from 'react';
import { Chapter, Book } from '../types';

interface LibraryViewProps {
  book: Book;
  completedIds: number[];
  onSelect: (chapter: Chapter) => void;
  onChat: () => void;
  onBack: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ book, completedIds, onSelect, onChat, onBack }) => {
  const [search, setSearch] = useState('');
  
  const filteredChapters = book.chapters.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.summary.toLowerCase().includes(search.toLowerCase())
  );

  const progressPercent = Math.round((completedIds.length / book.chapters.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12">
        <button 
          onClick={onBack}
          className="text-stone-400 hover:text-stone-800 flex items-center gap-2 mb-12 transition-all uppercase text-[10px] font-bold tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Switch Journey
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className={`text-${book.accentColor}-600 text-xs tracking-[0.4em] uppercase mb-2 font-bold`}>{book.subtitle}</h2>
            <h1 className="text-4xl md:text-5xl font-serif text-stone-800 italic">{book.title}</h1>
          </div>
          <button 
            onClick={onChat}
            className={`flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-full hover:bg-stone-800 transition-all shadow-lg font-medium active:scale-95`}
          >
            Ask the Companion
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-2xl border border-stone-100">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="Search chapters..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 rounded-xl outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 px-4 border-l border-stone-100 hidden md:flex">
             <span className="text-sm font-bold text-stone-800">{progressPercent}% Path Taken</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredChapters.map((chapter) => (
          <div 
            key={chapter.id}
            onClick={() => onSelect(chapter)}
            className="group cursor-pointer bg-white border border-stone-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500"
          >
            <div className="relative h-56 overflow-hidden">
              <img src={chapter.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={chapter.title} />
              {completedIds.includes(chapter.id) && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
              )}
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-serif text-stone-800 group-hover:text-rose-800 transition-colors leading-tight italic">
                {chapter.title}
              </h3>
              <p className="text-stone-400 text-xs mb-4 italic font-serif">{chapter.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
