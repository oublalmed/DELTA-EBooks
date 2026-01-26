
import React from 'react';
import { Book } from '../types';

interface ShelfViewProps {
  books: Book[];
  onSelect: (book: Book) => void;
}

const ShelfView: React.FC<ShelfViewProps> = ({ books, onSelect }) => {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-24">
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
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="relative w-full aspect-[3/4] mb-8 transform transition-all duration-700 group-hover:rotate-y-12 group-hover:scale-105 perspective-1000">
                <div className={`absolute inset-0 bg-${book.accentColor}-900 rounded-lg shadow-2xl overflow-hidden`}>
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <p className="text-white/60 text-[10px] tracking-widest uppercase mb-2">{book.author}</p>
                    <h3 className="text-white text-3xl font-serif leading-tight italic">{book.title}</h3>
                  </div>
                </div>
                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
              </div>
              
              <div className="text-center max-w-xs">
                <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-4 font-bold">{book.subtitle}</p>
                <p className="text-stone-600 text-sm italic font-serif leading-relaxed line-clamp-2">{book.description}</p>
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-widest">
                  Begin Reading
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelfView;
