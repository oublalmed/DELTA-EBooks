
import React, { useState, useEffect, useCallback } from 'react';
import { ExpressionEntry } from '../types';

interface ExpressionSpaceViewProps {
  onBack: () => void;
  onOpenJourney: () => void;
}

const CATEGORIES: { key: ExpressionEntry['category']; label: string; icon: string; prompt: string }[] = [
  { key: 'feeling', label: 'Feelings', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', prompt: 'What are you feeling right now? Let your emotions flow freely onto the page...' },
  { key: 'experience', label: 'Experiences', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', prompt: 'Describe an experience that shaped who you are today...' },
  { key: 'adventure', label: 'Adventures', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', prompt: 'What adventure, big or small, has taught you the most about yourself?' },
  { key: 'success', label: 'Successes', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', prompt: 'Celebrate a success. What did you achieve, and what did it mean to you?' },
  { key: 'failure', label: 'Lessons', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', prompt: 'What failure or setback taught you the most? How did it transform you?' },
  { key: 'emotion', label: 'Emotions', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', prompt: 'Explore an emotion deeply. Where do you feel it? What triggered it?' },
  { key: 'insight', label: 'Insights', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', prompt: 'Share a realization or insight that changed your perspective on life...' },
];

const PHILOSOPHICAL_PROMPTS = [
  "What does it mean to truly know yourself?",
  "If you could write a letter to your past self, what would you say?",
  "What is the most courageous thing you've ever done?",
  "Describe a moment when time seemed to stand still.",
  "What does home mean to you beyond a physical place?",
  "When did you last feel truly free?",
  "What truth are you avoiding right now?",
  "If your life were a book, what chapter are you in?",
  "What legacy do you wish to leave behind?",
  "When have you felt most alive?",
  "What does silence teach you?",
  "Describe a person who changed the way you see the world.",
  "What are you grateful for that you rarely acknowledge?",
  "What would you do if you knew you could not fail?",
  "How has suffering shaped your understanding of joy?",
];

const MOODS = [
  { emoji: '\u2728', label: 'Inspired' },
  { emoji: '\u{1F33F}', label: 'Peaceful' },
  { emoji: '\u{1F525}', label: 'Passionate' },
  { emoji: '\u{1F30A}', label: 'Reflective' },
  { emoji: '\u2600\uFE0F', label: 'Hopeful' },
  { emoji: '\u{1F319}', label: 'Contemplative' },
  { emoji: '\u{1F338}', label: 'Grateful' },
  { emoji: '\u26A1', label: 'Determined' },
];

const STORAGE_KEY = 'delta_expressions';

const ExpressionSpaceView: React.FC<ExpressionSpaceViewProps> = ({ onBack, onOpenJourney }) => {
  const [entries, setEntries] = useState<ExpressionEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<ExpressionEntry['category']>('feeling');
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [currentPromptIdx, setCurrentPromptIdx] = useState(() => Math.floor(Math.random() * PHILOSOPHICAL_PROMPTS.length));
  const [showEntries, setShowEntries] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ExpressionEntry['category'] | 'all'>('all');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSave = useCallback(() => {
    if (!text.trim()) return;
    const newEntry: ExpressionEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      category: selectedCategory,
      createdAt: new Date().toISOString(),
      mood: selectedMood || undefined,
    };
    setEntries(prev => [newEntry, ...prev]);
    setText('');
    setSelectedMood('');
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  }, [text, selectedCategory, selectedMood]);

  const handleDelete = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const nextPrompt = useCallback(() => {
    setCurrentPromptIdx(prev => (prev + 1) % PHILOSOPHICAL_PROMPTS.length);
  }, []);

  const usePrompt = useCallback(() => {
    setText(PHILOSOPHICAL_PROMPTS[currentPromptIdx]);
  }, [currentPromptIdx]);

  const categoryInfo = CATEGORIES.find(c => c.key === selectedCategory)!;
  const filteredEntries = filterCategory === 'all' ? entries : entries.filter(e => e.category === filterCategory);

  const getCategoryLabel = (key: string) => CATEGORIES.find(c => c.key === key)?.label || key;

  return (
    <div className="min-h-screen bg-themed">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1920"
            alt="Writing"
            className="w-full h-full object-cover opacity-12"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[80%] bg-indigo-50/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-amber-50/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10 animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-themed-sub text-sm font-medium hover:text-themed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Library
            </button>
            <button onClick={onOpenJourney} className="flex items-center gap-2 bg-themed-card border border-themed px-4 py-2.5 rounded-full text-themed text-xs font-bold hover:bg-themed-muted transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Journey Calendar
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="ornament-divider mb-6">
              <span className="text-xs tracking-[0.5em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Philosophical Space</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-themed mb-4 font-medium">Express Your Inner World</h1>
            <p className="text-themed-muted font-serif text-lg italic max-w-xl mx-auto leading-relaxed">
              "The unexamined life is not worth living." — Socrates
            </p>
          </div>
        </div>
      </div>

      {/* Philosophical prompt card */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="expression-prompt-card rounded-2xl p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-themed-muted text-[10px] uppercase tracking-[0.3em] font-bold">Today's Reflection</p>
                <p className="text-themed text-sm font-medium">A prompt to guide your thoughts</p>
              </div>
            </div>
            <button onClick={nextPrompt} className="p-2 rounded-full bg-themed-muted text-themed-sub hover:text-themed transition-colors" title="Next prompt">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-themed italic leading-relaxed mb-4 quote-block">
            {PHILOSOPHICAL_PROMPTS[currentPromptIdx]}
          </p>
          <button onClick={usePrompt} className="text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
            Use this prompt as a starting point &rarr;
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <p className="text-themed-muted text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Choose Your Expression</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat.key
                  ? 'bg-stone-800 text-white shadow-lg'
                  : 'bg-themed-card border border-themed text-themed-sub hover:bg-themed-muted'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon} />
              </svg>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Writing area */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="expression-writing-area bg-themed-card border border-themed rounded-3xl p-6 sm:p-8 animate-fadeIn">
          {/* Category prompt */}
          <p className="font-serif text-themed-sub italic mb-4 text-base">{categoryInfo.prompt}</p>

          {/* Mood selector */}
          <div className="mb-4">
            <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-3">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(selectedMood === mood.label ? '' : mood.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedMood === mood.label
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'bg-themed-muted border border-transparent text-themed-sub hover:border-themed'
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span className="font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Begin writing... Let your thoughts flow like a river of consciousness. There is no right or wrong here, only your truth."
            className="expression-textarea w-full h-48 sm:h-64 bg-transparent text-themed font-serif text-lg leading-relaxed resize-none focus:outline-none placeholder:text-themed-muted/50 placeholder:italic mb-4"
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-4 border-t border-themed">
            <div className="flex items-center gap-4">
              <span className="text-themed-muted text-xs">{text.length} characters</span>
              {text.length > 0 && (
                <span className="text-themed-muted text-xs">{text.split(/\s+/).filter(Boolean).length} words</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {savedMessage && (
                <span className="text-emerald-600 text-xs font-bold animate-fadeIn flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Saved to your journal
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  text.trim()
                    ? 'bg-stone-800 text-white hover:bg-stone-700 shadow-lg hover:shadow-xl'
                    : 'bg-themed-muted text-themed-muted cursor-not-allowed'
                }`}
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: entries.length, label: 'Reflections', icon: '\u{1F4DD}' },
              { value: new Set(entries.map(e => e.createdAt.split('T')[0])).size, label: 'Days Active', icon: '\u{1F4C5}' },
              { value: entries.reduce((sum, e) => sum + e.text.split(/\s+/).length, 0), label: 'Words Written', icon: '\u270F\uFE0F' },
              { value: new Set(entries.map(e => e.category)).size, label: 'Categories', icon: '\u{1F3AF}' },
            ].map((stat, i) => (
              <div key={i} className="bg-themed-card border border-themed rounded-2xl p-4 text-center hover-lift">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="font-display text-themed font-bold text-2xl">{stat.value.toLocaleString()}</div>
                <div className="text-themed-muted text-[10px] uppercase tracking-wider font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle past entries */}
      <div className="max-w-4xl mx-auto px-6 pb-4">
        <button
          onClick={() => setShowEntries(!showEntries)}
          className="flex items-center gap-2 text-themed-sub text-sm font-bold hover:text-themed transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${showEntries ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
          {showEntries ? 'Hide' : 'View'} Past Reflections ({entries.length})
        </button>
      </div>

      {/* Past entries */}
      {showEntries && (
        <div className="max-w-4xl mx-auto px-6 pb-12 animate-fadeIn">
          {/* Filter */}
          {entries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filterCategory === 'all' ? 'bg-stone-800 text-white' : 'bg-themed-muted text-themed-sub'
                }`}
              >
                All ({entries.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = entries.filter(e => e.category === cat.key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFilterCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      filterCategory === cat.key ? 'bg-stone-800 text-white' : 'bg-themed-muted text-themed-sub'
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Entry list */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{'\u{1F4D6}'}</div>
              <p className="font-display text-themed text-xl mb-2">Your journal awaits</p>
              <p className="text-themed-muted font-serif italic">Begin writing to see your reflections appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, i) => (
                <div key={entry.id} className="expression-entry bg-themed-card border border-themed rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-themed-muted text-themed-sub text-[10px] font-bold uppercase tracking-wider">
                        {getCategoryLabel(entry.category)}
                      </span>
                      {entry.mood && (
                        <span className="text-xs text-themed-muted">{entry.mood}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-themed-muted text-xs">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button onClick={() => handleDelete(entry.id)} className="p-1 text-themed-muted hover:text-red-500 transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="font-serif text-themed leading-relaxed text-base whitespace-pre-wrap">{entry.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspirational footer */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1920"
            alt="Mountain reflection"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <div className="text-center max-w-2xl">
              <svg className="w-8 h-8 text-amber-400/60 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white font-serif text-xl sm:text-2xl italic leading-relaxed mb-3">
                Knowing yourself is the beginning of all wisdom.
              </p>
              <p className="text-amber-400/80 text-xs font-bold uppercase tracking-[0.3em]">— Aristotle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-8 text-center">
        <div className="ornament-divider mb-4">
          <span className="text-themed-muted text-lg">&#x2726;</span>
        </div>
        <p className="text-themed-muted text-xs tracking-[0.2em] uppercase font-medium">Your Philosophical Expression Space</p>
        <p className="text-themed-muted text-xs font-serif italic mt-2">A sacred place for your innermost thoughts</p>
      </footer>
    </div>
  );
};

export default ExpressionSpaceView;
