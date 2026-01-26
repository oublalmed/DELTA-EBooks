
import React from 'react';
import { Book } from '../types';

interface ShelfViewProps {
  books: Book[];
  onSelect: (book: Book) => void;
}

const ShelfView: React.FC<ShelfViewProps> = ({ books, onSelect }) => {
  return (
    <div className="min-h-screen py-20 px-6 bg-[#fdfcf9]">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-24 animate-fadeIn">
          <h2 className="text-rose-600 text-xs tracking-[0.5em] uppercase font-bold mb-4">The Universal Library</h2>
          <h1 className="text-6xl font-serif text-stone-800 mb-6 italic">Choose Your Journey</h1>
          <p className="text-stone-400 font-serif text-xl italic max-w-xl mx-auto">
            "We do not read books; we traverse landscapes of thought."
          </p>
          <div className="w-16 h-px bg-stone-200 mx-auto mt-8" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {books.map((book) => (
            <div 
              key={book.id}
              onClick={() => onSelect(book)}
              className="group cursor-pointer flex flex-col items-center perspective-1000"
            >
              <div className="relative w-full aspect-[3/4] mb-8 transform-gpu transition-all duration-700 ease-out group-hover:rotate-y-12 group-hover:-translate-y-2 group-hover:shadow-[25px_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-lg shadow-2xl overflow-hidden">
                {/* Book Cover Image */}
                <div className={`absolute inset-0 bg-stone-900 overflow-hidden`}>
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-40 transition-all duration-1000"
                  />
                </div>

                {/* Spine Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 via-white/5 to-transparent z-20" />

                {/* Static Content (Title/Author) */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 group-hover:translate-y-[-10%] transition-transform duration-700">
                  <p className="text-white/60 text-[10px] tracking-widest uppercase mb-2 font-bold">{book.author}</p>
                  <h3 className="text-white text-3xl font-serif leading-tight italic">{book.title}</h3>
                </div>

                {/* Hover Details Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-center items-center text-center z-30">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <h4 className="text-white/90 text-xs tracking-[0.3em] uppercase font-bold mb-6 border-b border-white/20 pb-4">
                      {book.subtitle}
                    </h4>
                    <p className="text-white/80 font-serif italic text-lg leading-relaxed mb-8 px-4">
                      {book.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors border border-white/20">
                      Enter Journey
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* External Metadata (Subtle) */}
              <div className="text-center max-w-xs transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-2">
                <p className="text-stone-400 text-[10px] tracking-[0.2em] uppercase mb-2 font-bold">{book.subtitle}</p>
                <div className="w-8 h-px bg-stone-200 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelfView;
