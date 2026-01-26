
import React from 'react';
import { BOOK_TITLE, AUTHOR, BOOK_SUBTITLE } from '../constants';

interface LandingViewProps {
  onEnter: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onEnter }) => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-[#fdfcf9] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-100 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-50 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 text-center max-w-2xl px-6 animate-fadeIn">
        <h2 className="text-sm tracking-[0.3em] text-stone-500 uppercase mb-4 font-medium">{BOOK_SUBTITLE}</h2>
        <h1 className="text-6xl md:text-8xl font-serif text-stone-800 mb-8 leading-tight">
          {BOOK_TITLE}
        </h1>
        <div className="w-16 h-px bg-stone-300 mx-auto mb-8" />
        <p className="text-xl text-stone-600 italic font-serif mb-12">
          By {AUTHOR}
        </p>
        
        <button 
          onClick={onEnter}
          className="group relative inline-flex items-center justify-center px-10 py-4 font-medium tracking-wide text-white transition duration-200 bg-stone-800 rounded-full hover:bg-stone-700 focus:shadow-outline focus:outline-none"
        >
          Begin the Journey
          <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-10 text-stone-400 text-sm tracking-widest uppercase">
        Explore the 20 Chapters of Real Intimacy
      </div>
    </div>
  );
};

export default LandingView;
