
import React, { useState, useEffect } from 'react';
import { Chapter, Book, ThemeMode, Language, PRICE_PER_BOOK } from '../types';
import { getChapterInsight } from '../services/geminiService';
import { translations } from '../i18n';

interface ReaderViewProps {
  book: Book;
  chapter: Chapter;
  isCompleted: boolean;
  savedReflection: string;
  isBookPurchased: boolean;
  theme: ThemeMode;
  fontSize: number;
  language: Language;
  onToggleComplete: () => void;
  onSaveReflection: (text: string) => void;
  onBack: () => void;
  onToggleTheme: () => void;
  onSetFontSize: (size: number) => void;
  onUpdateLanguage: (language: Language) => void;
  onUnlock: () => void;
  onNext: (id: number) => void;
}

const accentMap: Record<string, { progress: string; badge: string; badgeBorder: string; dropCap: string; reflectionBg: string }> = {
  rose: { progress: 'bg-rose-500', badge: 'bg-rose-500 border-rose-500', badgeBorder: 'hover:border-rose-300', dropCap: 'text-rose-700', reflectionBg: 'bg-rose-50 border-rose-100' },
  indigo: { progress: 'bg-indigo-500', badge: 'bg-indigo-500 border-indigo-500', badgeBorder: 'hover:border-indigo-300', dropCap: 'text-indigo-700', reflectionBg: 'bg-indigo-50 border-indigo-100' },
  stone: { progress: 'bg-stone-500', badge: 'bg-stone-600 border-stone-600', badgeBorder: 'hover:border-stone-400', dropCap: 'text-stone-700', reflectionBg: 'bg-stone-50 border-stone-200' },
  emerald: { progress: 'bg-emerald-500', badge: 'bg-emerald-500 border-emerald-500', badgeBorder: 'hover:border-emerald-300', dropCap: 'text-emerald-700', reflectionBg: 'bg-emerald-50 border-emerald-100' },
};

const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  chapter,
  isCompleted,
  savedReflection,
  isBookPurchased,
  theme,
  fontSize,
  language,
  onToggleComplete,
  onSaveReflection,
  onBack,
  onToggleTheme,
  onSetFontSize,
  onUpdateLanguage,
  onUnlock,
  onNext
}) => {
  const [reflection, setReflection] = useState(savedReflection);
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const t = translations[language].reader_view;
  const paragraphs = chapter.content.split('\n\n');
  const colors = accentMap[book.accentColor] || accentMap.stone;
  const readingTime = Math.ceil(chapter.content.split(' ').length / 200);

  const isPartial = !!(chapter as any).isPartial;
  const isTeaser = !!(chapter as any).isTeaser;
  const accessMessage = (chapter as any).accessMessage || '';

  useEffect(() => {
    setReflection(savedReflection);
    setInsight(null);
    setSaved(false);
  }, [chapter, savedReflection]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInsight = async () => {
    setIsGenerating(true);
    const text = await getChapterInsight(chapter.title);
    setInsight(text);
    setIsGenerating(false);
  };

  const handleSave = () => {
    onSaveReflection(reflection);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeIcon = () => {
    if (theme === 'light') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
    if (theme === 'dark') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    );
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  };

  return (
    <article className="min-h-screen bg-themed">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-themed-muted z-50">
        <div
          className={`h-full ${colors.progress} transition-all duration-150`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 bg-themed-card/80 backdrop-blur-md z-40 border-b border-themed">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-themed-muted hover:text-themed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Chapters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-themed-muted text-xs font-medium">{chapter.id} / {book.chapters.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-themed-muted hover:text-themed hover:bg-themed-muted transition-all"
              title="Reading settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Complete button */}
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                isCompleted
                ? `${colors.badge} text-white`
                : `bg-themed-card border-themed text-themed-muted hover:text-themed ${colors.badgeBorder}`
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Complete
                </>
              ) : 'Mark Complete'}
            </button>

            {/* Next */}
            <button
              onClick={() => onNext(chapter.id + 1)}
              disabled={chapter.id >= book.chapters.length}
              className="flex items-center gap-1 text-themed-muted hover:text-themed disabled:opacity-20 transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="border-t border-themed px-6 py-4 animate-fadeIn">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-6">
              {/* Theme toggle */}
              <div className="flex items-center gap-3">
                <span className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Theme</span>
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 bg-themed-muted rounded-lg text-themed-sub text-xs font-medium hover:bg-themed border border-themed transition-all"
                >
                  {themeIcon()}
                  <span className="capitalize">{theme}</span>
                </button>
              </div>

              {/* Language switcher */}
              <div className="flex items-center gap-3">
                <span className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Language</span>
                <select
                  value={language}
                  onChange={(e) => onUpdateLanguage(e.target.value as Language)}
                  className="bg-themed-muted rounded-lg text-themed-sub text-xs font-medium hover:bg-themed border border-themed transition-all px-3 py-1.5"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>

              {/* Font size */}
              <div className="flex items-center gap-3">
                <span className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">{t.font}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSetFontSize(Math.max(14, fontSize - 2))}
                    disabled={fontSize <= 14}
                    className="w-7 h-7 rounded-lg bg-themed-muted border border-themed flex items-center justify-center text-themed-sub text-xs font-bold hover:bg-themed disabled:opacity-30 transition-all"
                  >
                    A-
                  </button>
                  <span className="text-themed-sub text-xs font-mono w-8 text-center">{fontSize}</span>
                  <button
                    onClick={() => onSetFontSize(Math.min(28, fontSize + 2))}
                    disabled={fontSize >= 28}
                    className="w-7 h-7 rounded-lg bg-themed-muted border border-themed flex items-center justify-center text-themed-sub text-sm font-bold hover:bg-themed disabled:opacity-30 transition-all"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Reading progress */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-themed-muted text-[10px] font-bold uppercase tracking-wider">Progress</span>
                <span className="text-themed-sub text-xs font-mono">{Math.round(scrollProgress)}%</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        {/* Chapter header */}
        <header className="mb-16 sm:mb-20 text-center animate-fadeIn">
          <div className="ornament-divider mb-6">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-themed-muted">{book.title}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-themed mb-4 font-medium leading-tight">{chapter.title}</h1>
          <p className="text-xl sm:text-2xl text-themed-muted font-serif italic mb-6">{chapter.subtitle}</p>
          <div className="flex items-center justify-center gap-4 text-themed-muted text-xs">
            <span>Chapter {chapter.id}</span>
            <span>&#x2022;</span>
            <span>{readingTime} min read</span>
            {isPartial && !isTeaser && (
              <>
                <span>&#x2022;</span>
                <span className="text-amber-500 font-bold">Preview</span>
              </>
            )}
            {isTeaser && (
              <>
                <span>&#x2022;</span>
                <span className="text-orange-500 font-bold">Teaser</span>
              </>
            )}
          </div>
        </header>

        {/* Hero image */}
        <div className="relative mb-16 sm:mb-20 animate-slideUp">
          <div className="rounded-2xl overflow-hidden shadow-2xl relative">
            <img src={chapter.image} className="w-full aspect-[16/9] object-cover" alt={chapter.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Insight button */}
          <button
            onClick={handleInsight}
            disabled={isGenerating}
            className="absolute -bottom-5 right-6 sm:right-8 bg-themed-card text-themed w-12 h-12 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all border border-themed flex items-center justify-center"
            title="Generate AI Insight"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-themed-muted border-t-rose-500 rounded-full animate-spin" />
            ) : (
              <span className="text-lg">&#x2726;</span>
            )}
          </button>
        </div>

        {/* AI Insight */}
        {insight && (
          <div className="mb-16 p-6 sm:p-8 bg-stone-900 text-stone-100 rounded-2xl shadow-xl animate-slideUp">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                <span className="text-sm">&#x2726;</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">AI Meditation</p>
                <p className="font-serif italic text-lg sm:text-xl leading-relaxed text-stone-200">"{insight}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Chapter content */}
        <div className={`mb-20 sm:mb-28 ${isPartial ? 'relative' : ''}`}>
          {paragraphs.map((para, index) => (
            <p
              key={index}
              className={`leading-relaxed text-themed-sub mb-8 sm:mb-10 font-serif ${index === 0 ? 'drop-cap' : ''}`}
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
            >
              {para}
            </p>
          ))}

          {/* Content fade + unlock CTA for partial/teaser chapters */}
          {isPartial && (
            <div className="relative">
              <div className="content-fade" />
              <div className="mt-8 bg-themed-card rounded-3xl border border-themed p-8 sm:p-10 text-center relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[-50%] left-[50%] -translate-x-1/2 w-[80%] h-[80%] bg-amber-50/20 rounded-full blur-[80px]" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl text-themed font-medium mb-2">
                    {isTeaser ? 'The journey continues...' : 'Unlock the full chapter'}
                  </h3>
                  <p className="text-themed-sub font-serif italic text-base mb-2 max-w-md mx-auto">
                    {accessMessage}
                  </p>
                  <p className="text-themed-muted text-xs mb-6">
                    Join 2,847+ readers who are transforming their lives through this wisdom.
                  </p>
                  <button
                    onClick={onUnlock}
                    className="cta-premium text-white px-10 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all hover:shadow-2xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Unlock Full Book &mdash; ${PRICE_PER_BOOK}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-6 text-themed-muted text-[10px] uppercase tracking-wider font-bold">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      All {book.chapters.length} chapters
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      7-day refund
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Lifetime access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Only show reflection, summary, share, and nav for full-access chapters */}
        {!isPartial && (
          <>
            {/* Chapter summary */}
            <div className="mb-20 p-6 sm:p-8 bg-themed-muted rounded-2xl border border-themed">
              <p className="text-[10px] uppercase tracking-widest text-themed-muted font-bold mb-3">Chapter Summary</p>
              <p className="font-serif italic text-lg text-themed-sub leading-relaxed">{chapter.summary}</p>
            </div>

            {/* Reflection section */}
            <section className="p-8 sm:p-10 bg-themed-card border border-themed rounded-3xl shadow-xl relative animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-medium text-themed">Sacred Reflection</h3>
              </div>
              <p className="text-themed-muted text-xs mb-6">Take a moment to reflect on what you've read</p>

              <div className={`p-5 sm:p-6 rounded-xl border mb-6 ${colors.reflectionBg}`}>
                <p className="text-stone-700 text-lg sm:text-xl italic font-serif leading-relaxed">{chapter.reflectionPrompt}</p>
              </div>

              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full h-48 sm:h-56 p-5 sm:p-6 bg-themed-muted border border-themed rounded-xl outline-none font-serif text-lg text-themed focus:ring-2 focus:ring-stone-300 transition-all resize-none"
                placeholder="Write your thoughts here..."
              />
              <button
                onClick={handleSave}
                className={`mt-4 w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-800 text-white hover:bg-stone-700 active:scale-[0.99]'
                }`}
              >
                {saved ? 'Saved to Journal' : 'Commit to Journal'}
              </button>
            </section>

            {/* Share section */}
            <div className="mt-16 mb-16 text-center">
              <p className="text-themed-muted text-[10px] font-bold uppercase tracking-widest mb-4">Share this chapter</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading "${chapter.title}" from "${book.title}" by ${book.author} — a powerful chapter on ${chapter.summary.toLowerCase()}`)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-themed-muted hover:bg-stone-800 hover:text-white text-themed-muted flex items-center justify-center transition-all"
                  title="Share on X/Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(`"${chapter.title}" — ${book.title} by ${book.author}`)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-themed-muted hover:bg-blue-600 hover:text-white text-themed-muted flex items-center justify-center transition-all"
                  title="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`I'm reading "${chapter.title}" from "${book.title}" by ${book.author}. Check it out!`)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-themed-muted hover:bg-green-500 hover:text-white text-themed-muted flex items-center justify-center transition-all"
                  title="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button
                  onClick={() => {
                    const text = `"${chapter.title}" — ${book.title} by ${book.author}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="w-10 h-10 rounded-full bg-themed-muted hover:bg-stone-800 hover:text-white text-themed-muted flex items-center justify-center transition-all"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Motivational closing */}
        {!isPartial && (
          <div className="mb-12 text-center">
            <div className="ornament-divider mb-4">
              <span className="text-themed-muted text-lg">&#x2726;</span>
            </div>
            <p className="text-themed-muted font-serif italic text-sm max-w-md mx-auto">
              "Every chapter you complete is a step closer to the person you were meant to become."
            </p>
          </div>
        )}

        {/* Navigation between chapters */}
        <div className="flex items-center justify-between py-6 border-t border-themed">
          <button
            onClick={() => onNext(chapter.id - 1)}
            disabled={chapter.id <= 1}
            className="flex items-center gap-2 text-themed-muted hover:text-themed disabled:opacity-20 transition-all text-sm group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-bold uppercase tracking-wider text-xs">Previous</span>
          </button>
          <span className="text-themed-muted text-xs">{chapter.id} / {book.chapters.length}</span>
          <button
            onClick={() => onNext(chapter.id + 1)}
            disabled={chapter.id >= book.chapters.length}
            className="flex items-center gap-2 text-themed-muted hover:text-themed disabled:opacity-20 transition-all text-sm group"
          >
            <span className="font-bold uppercase tracking-wider text-xs">Next Chapter</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </main>
    </article>
  );
};

export default ReaderView;
