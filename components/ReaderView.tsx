
import React, { useState, useEffect } from 'react';
import { Chapter, Book } from '../types';
import { getChapterInsight } from '../services/geminiService';

interface ReaderViewProps {
  book: Book;
  chapter: Chapter;
  isCompleted: boolean;
  savedReflection: string;
  onToggleComplete: () => void;
  onSaveReflection: (text: string) => void;
  onBack: () => void;
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
  onToggleComplete,
  onSaveReflection,
  onBack,
  onNext
}) => {
  const [reflection, setReflection] = useState(savedReflection);
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const paragraphs = chapter.content.split('\n\n');
  const colors = accentMap[book.accentColor] || accentMap.stone;
  const readingTime = Math.ceil(chapter.content.split(' ').length / 200);

  useEffect(() => {
    setReflection(savedReflection);
    setInsight(null);
    setSaved(false);
  }, [chapter, savedReflection]);

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

  return (
    <article className="min-h-screen bg-[#fdfcf9]">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-stone-100 z-50">
        <div
          className={`h-full ${colors.progress} transition-all duration-500`}
          style={{ width: `${(chapter.id / book.chapters.length) * 100}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 glass z-40 border-b border-stone-100/80">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Chapters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-stone-300 text-xs font-medium">{chapter.id} / {book.chapters.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                isCompleted
                ? `${colors.badge} text-white`
                : `bg-white border-stone-200 text-stone-400 hover:text-stone-800 ${colors.badgeBorder}`
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Complete
                </>
              ) : 'Mark Complete'}
            </button>

            <button
              onClick={() => onNext(chapter.id + 1)}
              disabled={chapter.id >= book.chapters.length}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        {/* Chapter header */}
        <header className="mb-16 sm:mb-20 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-stone-200" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400">{book.title}</span>
            <div className="w-8 h-px bg-stone-200" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-stone-900 mb-4 font-medium leading-tight">{chapter.title}</h1>
          <p className="text-xl sm:text-2xl text-stone-400 font-serif italic mb-6">{chapter.subtitle}</p>
          <div className="flex items-center justify-center gap-4 text-stone-300 text-xs">
            <span>Chapter {chapter.id}</span>
            <span>&#x2022;</span>
            <span>{readingTime} min read</span>
          </div>
        </header>

        {/* Hero image */}
        <div className="relative mb-16 sm:mb-20 animate-slideUp">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src={chapter.image} className="w-full aspect-[16/9] object-cover" alt={chapter.title} />
          </div>

          {/* Insight button */}
          <button
            onClick={handleInsight}
            disabled={isGenerating}
            className="absolute -bottom-5 right-6 sm:right-8 bg-white text-stone-800 w-12 h-12 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all border border-stone-100 flex items-center justify-center"
            title="Generate AI Insight"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-stone-200 border-t-rose-500 rounded-full animate-spin" />
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
        <div className="mb-20 sm:mb-28">
          {paragraphs.map((para, index) => (
            <p
              key={index}
              className={`text-xl sm:text-2xl leading-relaxed text-stone-700 mb-8 sm:mb-10 font-serif ${index === 0 ? 'drop-cap' : ''}`}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Chapter summary */}
        <div className="mb-20 p-6 sm:p-8 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">Chapter Summary</p>
          <p className="font-serif italic text-lg text-stone-600 leading-relaxed">{chapter.summary}</p>
        </div>

        {/* Reflection section */}
        <section className="p-8 sm:p-10 bg-white border border-stone-100 rounded-3xl shadow-xl relative animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-medium text-stone-800">Sacred Reflection</h3>
          </div>
          <p className="text-stone-300 text-xs mb-6">Take a moment to reflect on what you've read</p>

          <div className={`p-5 sm:p-6 rounded-xl border mb-6 ${colors.reflectionBg}`}>
            <p className="text-stone-700 text-lg sm:text-xl italic font-serif leading-relaxed">{chapter.reflectionPrompt}</p>
          </div>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full h-48 sm:h-56 p-5 sm:p-6 bg-stone-50 border border-stone-100 rounded-xl outline-none font-serif text-lg focus:ring-2 focus:ring-stone-200 transition-all resize-none"
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
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-4">Share this chapter</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading "${chapter.title}" from "${book.title}" by ${book.author} — a powerful chapter on ${chapter.summary.toLowerCase()}`)}`, '_blank')}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-800 hover:text-white text-stone-500 flex items-center justify-center transition-all"
              title="Share on X/Twitter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(`"${chapter.title}" — ${book.title} by ${book.author}`)}`, '_blank')}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-blue-600 hover:text-white text-stone-500 flex items-center justify-center transition-all"
              title="Share on Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`I'm reading "${chapter.title}" from "${book.title}" by ${book.author}. It's about ${chapter.summary.toLowerCase()}. Check it out!`)}`, '_blank')}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-green-500 hover:text-white text-stone-500 flex items-center justify-center transition-all"
              title="Share on WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button
              onClick={() => {
                const text = `"${chapter.title}" — ${book.title} by ${book.author}`;
                navigator.clipboard.writeText(text);
              }}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-800 hover:text-white text-stone-500 flex items-center justify-center transition-all"
              title="Copy to clipboard"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation between chapters */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNext(chapter.id - 1)}
            disabled={chapter.id <= 1}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Previous
          </button>
          <button
            onClick={() => onNext(chapter.id + 1)}
            disabled={chapter.id >= book.chapters.length}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-all text-sm"
          >
            Next Chapter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </main>
    </article>
  );
};

export default ReaderView;
