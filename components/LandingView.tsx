
import React, { useState, useEffect } from 'react';
import { BOOK_TITLE, AUTHOR, BOOK_SUBTITLE } from '../constants';
import { FREE_CHAPTERS } from '../types';
import EmailCapture from './EmailCapture';
import Logo from './Logo';

interface LandingViewProps {
  onEnter: () => void;
  totalBooks: number;
  totalChapters: number;
}

const motivationalQuotes = [
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "We do not read books; we traverse landscapes of thought.", author: "Mohamed Oublal" },
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
];

const LandingView: React.FC<LandingViewProps> = ({ onEnter, totalBooks, totalChapters }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [readerCount, setReaderCount] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated live reader count
  useEffect(() => {
    const base = 127 + Math.floor(Math.random() * 40);
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil(base / 30);
      if (current >= base) { current = base; clearInterval(interval); }
      setReaderCount(current);
    }, 40);

    // Fluctuate the count every 8-15 seconds for realism
    const fluctuate = setInterval(() => {
      setReaderCount(prev => prev + Math.floor(Math.random() * 7) - 3);
    }, 10000);

    return () => { clearInterval(interval); clearInterval(fluctuate); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = motivationalQuotes[quoteIndex];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-themed overflow-hidden">
      {/* Full-screen hero background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1920"
          alt="Wisdom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`z-10 text-center max-w-3xl px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Delta Wisdom Logo */}
        <div className="mb-6">
          <Logo size="hero" showText={false} />
      {/* Top navigation */}
      <div className={`relative z-20 flex items-center justify-between px-6 sm:px-10 pt-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-display font-bold">&#x2726;</span>
          </div>
          <span className="text-white/80 text-sm font-display font-semibold tracking-wider">DELTA EBooks</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {totalBooks} Books Available
          </div>
        </div>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-10">
        <div className={`text-center max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Subtitle badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-8 animate-fadeIn stagger-1">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {BOOK_SUBTITLE}
          </div>

        <p className="text-xl text-themed-muted italic font-serif mb-4">
          By {AUTHOR}
        </p>
        <p className="text-themed-sub font-serif text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          A curated collection of philosophical journeys exploring love, purpose, resilience, and the art of mindful existence.
        </p>

        {/* Live reader count */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-themed-muted text-sm font-medium">
            <span className="text-emerald-600 font-bold">{readerCount}</span> people reading right now
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-themed">{totalBooks}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-themed-muted font-bold mt-1">Books</div>
          {/* Main title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-display text-white mb-6 leading-[1.05] font-medium text-shadow-hero animate-fadeIn stagger-2">
            {BOOK_TITLE}
          </h1>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fadeIn stagger-3">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-400/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>

          <p className="text-xl sm:text-2xl text-white/60 italic font-serif mb-4 animate-fadeIn stagger-3">
            By {AUTHOR}
          </p>
          <p className="text-white/50 font-serif text-lg mb-10 max-w-2xl mx-auto leading-relaxed animate-fadeIn stagger-4">
            A curated collection of philosophical journeys exploring love, purpose, resilience, and the art of mindful existence.
            <span className="block mt-2 text-amber-300/70 font-semibold not-italic font-sans text-sm uppercase tracking-wider">
              Wisdom that transforms lives
            </span>
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10 animate-fadeIn stagger-4">
            {[
              { value: totalBooks, label: 'Books' },
              { value: totalChapters, label: 'Chapters' },
              { value: `${FREE_CHAPTERS}`, label: 'Free / Book' },
              { value: '2,847+', label: 'Readers' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/40 font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fadeIn stagger-5">
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center justify-center px-10 sm:px-14 py-5 font-bold tracking-wider text-stone-900 transition-all duration-500 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 rounded-full hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-1 active:translate-y-0 text-sm uppercase"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Reading — It's Free
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <button
              onClick={onEnter}
              className="group inline-flex items-center justify-center px-8 py-4 text-white/70 border border-white/20 rounded-full hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse the Collection
            </button>
          </div>

          {/* Free badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 px-5 py-2.5 rounded-full text-xs font-bold mb-8 border border-emerald-400/20 animate-fadeIn stagger-5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
            No sign-up required — Start your journey now
          </div>
        </div>
      </div>

      {/* Rotating motivational quote */}
      <div className={`relative z-10 px-6 pb-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 transition-all duration-700">
            <p className="text-white/60 text-sm italic font-serif leading-relaxed" key={quoteIndex}>
              "{currentQuote.text}"
            </p>
            <p className="text-amber-400/60 text-xs font-bold uppercase tracking-wider mt-2">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </div>

      {/* Email capture */}
      <div className={`relative z-10 px-6 pb-10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="max-w-md mx-auto text-center">
          <p className="text-white/40 text-xs mb-3 font-medium uppercase tracking-wider">Join our newsletter for exclusive wisdom</p>
          <EmailCapture variant="inline" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="animate-float">
          <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LandingView;
