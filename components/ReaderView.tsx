
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
  
  const paragraphs = chapter.content.split('\n\n');

  useEffect(() => {
    setReflection(savedReflection);
    setInsight(null);
  }, [chapter, savedReflection]);

  const handleInsight = async () => {
    setIsGenerating(true);
    const text = await getChapterInsight(chapter.title);
    setInsight(text);
    setIsGenerating(false);
  };

  return (
    <article className="min-h-screen bg-[#fdfcf9]">
      <div className="fixed top-0 left-0 w-full h-1 bg-stone-100 z-50">
        <div 
          className={`h-full bg-${book.accentColor}-500 transition-all duration-500`} 
          style={{ width: `${(chapter.id / book.chapters.length) * 100}%` }}
        />
      </div>

      <nav className="sticky top-0 bg-[#fdfcf9]/90 backdrop-blur-md z-40 border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-800 flex items-center gap-2 transition-all">
            <span className="text-sm font-bold uppercase tracking-widest">Index</span>
          </button>
          
          <button 
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-6 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
              isCompleted 
              ? 'bg-rose-500 border-rose-500 text-white' 
              : 'bg-white border-stone-200 text-stone-400 hover:border-stone-800 hover:text-stone-800'
            }`}
          >
            {isCompleted ? 'Traversed' : 'Mark Progress'}
          </button>

          <button 
            onClick={() => onNext(chapter.id + 1)}
            disabled={chapter.id >= book.chapters.length}
            className="text-stone-400 hover:text-stone-800 flex items-center gap-2 disabled:opacity-30"
          >
            <span className="text-sm font-bold uppercase tracking-widest">Next</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-20 text-center">
          <h2 className={`text-${book.accentColor}-600 font-bold text-xs tracking-[0.5em] uppercase mb-6`}>{book.title}</h2>
          <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-8 italic">{chapter.title}</h1>
          <p className="text-2xl text-stone-400 font-serif italic">{chapter.subtitle}</p>
        </header>

        <div className="relative group mb-20">
          <img src={chapter.image} className="w-full aspect-[16/10] object-cover rounded-2xl shadow-2xl" alt={chapter.title} />
          <button 
            onClick={handleInsight}
            disabled={isGenerating}
            className="absolute -bottom-6 right-8 bg-white text-stone-800 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border border-stone-100"
          >
            {isGenerating ? <div className="w-6 h-6 border-2 border-stone-200 border-t-rose-500 rounded-full animate-spin" /> : "✧"}
          </button>
        </div>

        {insight && (
          <div className="mb-16 p-8 bg-stone-900 text-stone-100 rounded-2xl font-serif italic text-xl shadow-xl animate-slideUp">
            "{insight}"
          </div>
        )}

        <div className="prose-container">
          {paragraphs.map((para, index) => (
            <p key={index} className="text-2xl leading-relaxed text-stone-800 mb-10 font-serif first-letter:text-8xl first-letter:font-serif first-letter:mr-4 first-letter:float-left first-letter:text-rose-800 first-letter:leading-[0.7] first-letter:mt-2">
              {para}
            </p>
          ))}
        </div>

        <section className="mt-32 p-12 bg-white border border-stone-100 rounded-[2rem] shadow-2xl relative">
          <h3 className="text-2xl font-serif font-bold text-stone-800 mb-6 italic">Sacred Reflection</h3>
          <p className="text-stone-800 text-2xl mb-10 italic pr-12">{chapter.reflectionPrompt}</p>
          <textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full h-64 p-8 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-serif text-xl"
            placeholder="Record your truth here..."
          />
          <button onClick={() => onSaveReflection(reflection)} className="mt-6 w-full py-4 bg-stone-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs">
            Commit to Journal
          </button>
        </section>
      </main>
    </article>
  );
};

export default ReaderView;
