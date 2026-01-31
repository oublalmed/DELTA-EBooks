
import React, { useState, useEffect, useCallback } from 'react';
import { JourneyEntry } from '../types';
import * as api from '../services/api';

interface JourneyCalendarViewProps {
  onBack: () => void;
  onOpenExpression: () => void;
}

const EMOTION_OPTIONS = [
  { emoji: '\u{1F60A}', label: 'Happy', color: 'bg-amber-100 border-amber-300 text-amber-700' },
  { emoji: '\u{1F60C}', label: 'Peaceful', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { emoji: '\u{1F914}', label: 'Thoughtful', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
  { emoji: '\u{1F4AA}', label: 'Strong', color: 'bg-rose-100 border-rose-300 text-rose-700' },
  { emoji: '\u{1F622}', label: 'Sad', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { emoji: '\u{1F615}', label: 'Confused', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { emoji: '\u{1F60D}', label: 'Grateful', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { emoji: '\u{1F525}', label: 'Motivated', color: 'bg-orange-100 border-orange-300 text-orange-700' },
];

const STORAGE_KEY = 'delta_journey';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const JourneyCalendarView: React.FC<JourneyCalendarViewProps> = ({ onBack, onOpenExpression }) => {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formEmotion, setFormEmotion] = useState('');
  const [formMilestone, setFormMilestone] = useState('');
  const [formChallenge, setFormChallenge] = useState('');
  const [formReflection, setFormReflection] = useState('');
  const [formRating, setFormRating] = useState(3);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    api.getJourneyEntries().then(setEntries);
  }, []);

  // Load entry data when selected date changes
  useEffect(() => {
    const entry = entries.find(e => e.date === selectedDate);
    if (entry) {
      setFormEmotion(entry.emotion);
      setFormMilestone(entry.milestone);
      setFormChallenge(entry.challenge);
      setFormReflection(entry.reflection);
      setFormRating(entry.rating);
      setEditMode(false);
    } else {
      setFormEmotion('');
      setFormMilestone('');
      setFormChallenge('');
      setFormReflection('');
      setFormRating(3);
      setEditMode(true);
    }
  }, [selectedDate, entries]);

  const handleSave = useCallback(async () => {
    if (!formReflection.trim() && !formMilestone.trim() && !formEmotion) return;

    const newEntryData = {
      date: selectedDate,
      emotion: formEmotion,
      milestone: formMilestone.trim(),
      challenge: formChallenge.trim(),
      reflection: formReflection.trim(),
      rating: formRating,
    };

    const savedEntry = await api.addOrUpdateJourneyEntry(newEntryData);

    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== selectedDate);
      return [...filtered, savedEntry].sort((a, b) => a.date.localeCompare(b.date));
    });
    setEditMode(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  }, [selectedDate, formEmotion, formMilestone, formChallenge, formReflection, formRating]);

  const handleDelete = useCallback(async () => {
    await api.deleteJourneyEntry(selectedDate);
    setEntries(prev => prev.filter(e => e.date !== selectedDate));
    setEditMode(true);
  }, [selectedDate]);

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(formatDate(now));
  }, []);

  // Calendar grid calculations
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(today);

  const entryMap = new Map<string, JourneyEntry>(entries.map(e => [e.date, e]));

  // Streak calculation
  const calculateStreak = (): number => {
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = formatDate(d);
      if (entryMap.has(dateStr)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const journeyStreak = calculateStreak();

  // Average mood rating
  const avgRating = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
    : '0';

  // Most common emotion
  const emotionCounts: Record<string, number> = {};
  entries.forEach(e => {
    if (e.emotion) emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  const selectedEntry = entryMap.get(selectedDate);
  const selectedDateObj = new Date(selectedDate + 'T12:00:00');

  return (
    <div className="min-h-screen bg-themed">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1920"
            alt="Journey"
            className="w-full h-full object-cover opacity-12"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[80%] bg-emerald-50/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-amber-50/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10 animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-themed-sub text-sm font-medium hover:text-themed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Library
            </button>
            <button onClick={onOpenExpression} className="flex items-center gap-2 bg-themed-card border border-themed px-4 py-2.5 rounded-full text-themed text-xs font-bold hover:bg-themed-muted transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Expression Space
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="ornament-divider mb-6">
              <span className="text-xs tracking-[0.5em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Personal Journey</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-themed mb-4 font-medium">Your Journey Calendar</h1>
            <p className="text-themed-muted font-serif text-lg italic max-w-xl mx-auto leading-relaxed">
              "Life can only be understood backwards; but it must be lived forwards." — Kierkegaard
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {entries.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: entries.length, label: 'Days Recorded', icon: '\u{1F4C5}' },
              { value: journeyStreak, label: 'Day Streak', icon: '\u{1F525}' },
              { value: avgRating, label: 'Avg. Rating', icon: '\u2B50' },
              { value: topEmotion ? `${EMOTION_OPTIONS.find(e => e.label === topEmotion[0])?.emoji || ''} ${topEmotion[0]}` : 'None yet', label: 'Top Emotion', icon: '\u{1F4CA}' },
            ].map((stat, i) => (
              <div key={i} className="bg-themed-card border border-themed rounded-2xl p-4 text-center hover-lift">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="font-display text-themed font-bold text-xl">{stat.value}</div>
                <div className="text-themed-muted text-[10px] uppercase tracking-wider font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar + Entry panel */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-themed-card border border-themed rounded-3xl p-6 sm:p-8">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-full bg-themed-muted text-themed-sub hover:text-themed transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="text-center">
                  <h2 className="font-display text-themed text-2xl font-medium">{MONTH_NAMES[currentMonth]}</h2>
                  <p className="text-themed-muted text-xs font-bold">{currentYear}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={goToToday} className="px-3 py-1.5 rounded-full bg-themed-muted text-themed-sub text-[10px] font-bold uppercase tracking-wider hover:text-themed transition-colors">
                    Today
                  </button>
                  <button onClick={nextMonth} className="p-2 rounded-full bg-themed-muted text-themed-sub hover:text-themed transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Day names header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map(day => (
                  <div key={day} className="text-center text-themed-muted text-[10px] font-bold uppercase tracking-wider py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasEntry = entryMap.has(dateStr);
                  const entry = entryMap.get(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const emotionInfo = entry ? EMOTION_OPTIONS.find(e => e.label === entry.emotion) : null;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`journey-calendar-day aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative ${
                        isSelected
                          ? 'bg-stone-800 text-white shadow-lg scale-105'
                          : isToday
                            ? 'bg-amber-50 border-2 border-amber-300 text-amber-700'
                            : hasEntry
                              ? 'bg-themed-muted text-themed hover:bg-stone-200 hover:scale-105'
                              : 'text-themed-sub hover:bg-themed-muted'
                      }`}
                    >
                      <span className={`text-xs ${isSelected ? 'font-bold' : ''}`}>{day}</span>
                      {hasEntry && !isSelected && (
                        <span className="text-[10px] mt-0.5">{emotionInfo?.emoji || '\u{1F4DD}'}</span>
                      )}
                      {hasEntry && isSelected && (
                        <span className="text-[8px] mt-0.5">{emotionInfo?.emoji || '\u2713'}</span>
                      )}
                      {/* Rating dots */}
                      {hasEntry && entry && (
                        <div className="absolute bottom-0.5 flex gap-[2px]">
                          {Array.from({ length: entry.rating }, (_, j) => (
                            <div key={j} className={`w-[3px] h-[3px] rounded-full ${isSelected ? 'bg-white/60' : 'bg-amber-400'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-themed">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-50 border-2 border-amber-300" />
                  <span className="text-themed-muted text-[10px] font-bold uppercase">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-themed-muted" />
                  <span className="text-themed-muted text-[10px] font-bold uppercase">Has Entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-stone-800" />
                  <span className="text-themed-muted text-[10px] font-bold uppercase">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-[2px]">
                    {[1,2,3,4,5].map(n => <div key={n} className="w-[3px] h-[3px] rounded-full bg-amber-400" />)}
                  </div>
                  <span className="text-themed-muted text-[10px] font-bold uppercase">Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Entry panel */}
          <div className="lg:col-span-2">
            <div className="journey-entry-panel bg-themed-card border border-themed rounded-3xl p-6 sm:p-8 sticky top-6">
              {/* Date header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-themed-muted text-[10px] uppercase tracking-[0.3em] font-bold">
                    {selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="font-display text-themed text-2xl font-medium">
                    {selectedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {selectedEntry && !editMode && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditMode(true)} className="p-2 rounded-full bg-themed-muted text-themed-sub hover:text-themed transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={handleDelete} className="p-2 rounded-full bg-themed-muted text-themed-sub hover:text-red-500 transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {editMode || !selectedEntry ? (
                /* Edit form */
                <div className="space-y-5">
                  {/* Emotion picker */}
                  <div>
                    <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-3">How do you feel?</p>
                    <div className="grid grid-cols-4 gap-2">
                      {EMOTION_OPTIONS.map(emo => (
                        <button
                          key={emo.label}
                          onClick={() => setFormEmotion(emo.label)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
                            formEmotion === emo.label ? emo.color : 'border-transparent bg-themed-muted text-themed-sub hover:border-themed'
                          }`}
                        >
                          <span className="text-lg">{emo.emoji}</span>
                          <span className="text-[9px]">{emo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day rating */}
                  <div>
                    <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-3">Rate your day</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setFormRating(n)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                            n <= formRating ? 'text-amber-400 scale-110' : 'text-themed-muted'
                          }`}
                        >
                          {n <= formRating ? '\u2605' : '\u2606'}
                        </button>
                      ))}
                      <span className="text-themed-muted text-xs ml-2">{formRating}/5</span>
                    </div>
                  </div>

                  {/* Milestone */}
                  <div>
                    <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Milestone or Win</p>
                    <input
                      type="text"
                      value={formMilestone}
                      onChange={(e) => setFormMilestone(e.target.value)}
                      placeholder="What did you achieve today?"
                      className="w-full bg-themed-muted rounded-xl px-4 py-3 text-themed text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-300/50 placeholder:text-themed-muted/50"
                    />
                  </div>

                  {/* Challenge */}
                  <div>
                    <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Challenge Faced</p>
                    <input
                      type="text"
                      value={formChallenge}
                      onChange={(e) => setFormChallenge(e.target.value)}
                      placeholder="What was difficult today?"
                      className="w-full bg-themed-muted rounded-xl px-4 py-3 text-themed text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-300/50 placeholder:text-themed-muted/50"
                    />
                  </div>

                  {/* Reflection */}
                  <div>
                    <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Daily Reflection</p>
                    <textarea
                      value={formReflection}
                      onChange={(e) => setFormReflection(e.target.value)}
                      placeholder="Reflect on your day. What did you learn? How did you grow?"
                      className="w-full h-32 bg-themed-muted rounded-xl px-4 py-3 text-themed text-sm font-serif leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-300/50 placeholder:text-themed-muted/50"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={!formReflection.trim() && !formMilestone.trim() && !formEmotion}
                      className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        (formReflection.trim() || formMilestone.trim() || formEmotion)
                          ? 'bg-stone-800 text-white hover:bg-stone-700 shadow-lg'
                          : 'bg-themed-muted text-themed-muted cursor-not-allowed'
                      }`}
                    >
                      Save Entry
                    </button>
                    {selectedEntry && (
                      <button onClick={() => setEditMode(false)} className="px-4 py-3 rounded-full bg-themed-muted text-themed-sub text-xs font-bold uppercase tracking-wider hover:text-themed transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                  {savedMessage && (
                    <p className="text-emerald-600 text-xs font-bold text-center animate-fadeIn flex items-center justify-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                      Entry saved successfully
                    </p>
                  )}
                </div>
              ) : (
                /* View mode */
                <div className="space-y-5">
                  {selectedEntry.emotion && (
                    <div>
                      <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Feeling</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{EMOTION_OPTIONS.find(e => e.label === selectedEntry.emotion)?.emoji}</span>
                        <span className="text-themed font-medium">{selectedEntry.emotion}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Day Rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} className={`text-lg ${n <= selectedEntry.rating ? 'text-amber-400' : 'text-themed-muted'}`}>
                          {n <= selectedEntry.rating ? '\u2605' : '\u2606'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedEntry.milestone && (
                    <div>
                      <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Milestone</p>
                      <p className="text-themed font-serif leading-relaxed">{selectedEntry.milestone}</p>
                    </div>
                  )}

                  {selectedEntry.challenge && (
                    <div>
                      <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Challenge</p>
                      <p className="text-themed font-serif leading-relaxed">{selectedEntry.challenge}</p>
                    </div>
                  )}

                  {selectedEntry.reflection && (
                    <div>
                      <p className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Reflection</p>
                      <p className="text-themed font-serif leading-relaxed whitespace-pre-wrap">{selectedEntry.reflection}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent entries timeline */}
      {entries.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <div className="mb-6">
            <div className="ornament-divider mb-4">
              <span className="text-xs tracking-[0.4em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Your Timeline</span>
            </div>
            <p className="font-display text-2xl text-themed font-medium text-center">Recent Entries</p>
          </div>

          <div className="space-y-4">
            {entries.slice().reverse().slice(0, 7).map((entry, i) => {
              const entryDate = new Date(entry.date + 'T12:00:00');
              const emotionInfo = EMOTION_OPTIONS.find(e => e.label === entry.emotion);
              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    setSelectedDate(entry.date);
                    const entryMonth = parseInt(entry.date.split('-')[1]) - 1;
                    const entryYear = parseInt(entry.date.split('-')[0]);
                    setCurrentMonth(entryMonth);
                    setCurrentYear(entryYear);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="journey-timeline-entry flex gap-4 bg-themed-card border border-themed rounded-2xl p-5 cursor-pointer hover-lift animate-fadeIn"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Date column */}
                  <div className="shrink-0 w-16 text-center">
                    <div className="font-display text-themed font-bold text-2xl">{entryDate.getDate()}</div>
                    <div className="text-themed-muted text-[10px] uppercase tracking-wider font-bold">{MONTH_NAMES[entryDate.getMonth()].slice(0, 3)}</div>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-themed self-stretch" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {emotionInfo && <span className="text-lg">{emotionInfo.emoji}</span>}
                      <span className="text-themed font-medium text-sm">{entry.emotion || 'No emotion'}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: entry.rating }, (_, j) => (
                          <span key={j} className="text-amber-400 text-xs">{'\u2605'}</span>
                        ))}
                      </div>
                    </div>
                    {entry.milestone && (
                      <p className="text-emerald-600 text-xs font-bold mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                        {entry.milestone}
                      </p>
                    )}
                    {entry.reflection && (
                      <p className="text-themed-sub font-serif italic text-sm leading-relaxed line-clamp-2">{entry.reflection}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational section */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1920"
            alt="Nature path"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <div className="text-center max-w-2xl">
              <svg className="w-8 h-8 text-amber-400/60 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white font-serif text-xl sm:text-2xl italic leading-relaxed mb-3">
                Every day is a new page in your story. Write it with intention.
              </p>
              <p className="text-amber-400/80 text-xs font-bold uppercase tracking-[0.3em]">— Your Journey Awaits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="ornament-divider mb-4">
          <span className="text-themed-muted text-lg">&#x2726;</span>
        </div>
        <p className="text-themed-muted text-xs tracking-[0.2em] uppercase font-medium">Your Personal Journey Calendar</p>
        <p className="text-themed-muted text-xs font-serif italic mt-2">Track growth, celebrate progress, reflect on your path</p>
      </footer>
    </div>
  );
};

export default JourneyCalendarView;
