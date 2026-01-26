
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

        {/* Navigation between chapters */}
        <div className="mt-16 flex items-center justify-between">
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
