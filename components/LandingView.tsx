
import React, { useState, useEffect } from 'react';
import { BOOK_TITLE, AUTHOR, BOOK_SUBTITLE } from '../constants';
import { FREE_CHAPTERS } from '../types';
import EmailCapture from './EmailCapture';

interface LandingViewProps {
  onEnter: () => void;
  totalBooks: number;
  totalChapters: number;
}

const LandingView: React.FC<LandingViewProps> = ({ onEnter, totalBooks, totalChapters }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-themed overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-rose-100/30 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-amber-50/40 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-indigo-50/30 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: '3s' }} />
      </div>

      {/* Decorative lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-stone-200 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-transparent via-stone-200 to-transparent opacity-50" />

      <div className={`z-10 text-center max-w-3xl px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Library emblem */}
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full border border-themed bg-themed-card/60 shadow-sm">
          <span className="text-3xl">&#x2726;</span>
        </div>

        <h2 className="text-sm tracking-[0.4em] text-themed-muted uppercase mb-6 font-medium">{BOOK_SUBTITLE}</h2>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-display text-themed mb-8 leading-[1.1] font-medium">
          {BOOK_TITLE}
        </h1>

        <div className="w-20 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto mb-8" />

        <p className="text-xl text-themed-muted italic font-serif mb-4">
          By {AUTHOR}
        </p>
        <p className="text-themed-sub font-serif text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          A curated collection of philosophical journeys exploring love, purpose, resilience, and the art of mindful existence.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-themed">{totalBooks}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-themed-muted font-bold mt-1">Books</div>
          </div>
          <div className="w-px h-10 bg-themed-muted" />
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-themed">{totalChapters}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-themed-muted font-bold mt-1">Chapters</div>
          </div>
          <div className="w-px h-10 bg-themed-muted" />
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-themed">{FREE_CHAPTERS}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-themed-muted font-bold mt-1">Free/Book</div>
          </div>
        </div>

        {/* Free chapters badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold mb-8">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          Start reading for free — no sign-up required
        </div>

        <div className="mb-12">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center px-12 py-5 font-medium tracking-wide text-white transition-all duration-300 bg-stone-800 rounded-full hover:bg-stone-700 hover:shadow-2xl hover:shadow-stone-300/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg focus:outline-none"
          >
            <span className="relative z-10 flex items-center gap-3">
              Enter the Library
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </div>

        {/* Email capture */}
        <div className={`max-w-md mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-themed-muted text-xs mb-4">Or join our newsletter for exclusive content</p>
          <EmailCapture variant="inline" />
        </div>
      </div>

      {/* Bottom quote */}
      <div className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-themed-muted text-xs tracking-[0.2em] uppercase font-medium">
          "We do not read books; we traverse landscapes of thought."
        </p>
      </div>
    </div>
  );
};

export default LandingView;
