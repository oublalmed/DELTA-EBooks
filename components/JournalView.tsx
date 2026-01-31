/**
 * Enhanced Journal View Component
 * 
 * Features:
 * - Monthly calendar view with mood-coded days
 * - Full CRUD for journal entries
 * - Title, category, content, mood, tags support
 * - Image attachment (URL)
 * - Public/private toggle
 * - Timeline view of past entries
 * - Mood analytics dashboard
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';
import {
  JournalEntryFull,
  JournalEntryInput,
  JournalCalendarDay,
  JournalAnalytics,
  JournalCategory,
  JournalMood,
  MOOD_COLORS,
  MOOD_EMOJIS,
  CATEGORY_ICONS,
} from '../types';

interface JournalViewProps {
  onBack: () => void;
  onOpenCommunity?: () => void;
}

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════

const CATEGORIES: { key: JournalCategory; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'feeling', label: 'Feelings' },
  { key: 'experience', label: 'Experiences' },
  { key: 'adventure', label: 'Adventures' },
  { key: 'success', label: 'Successes' },
  { key: 'failure', label: 'Lessons' },
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'goal', label: 'Goals' },
  { key: 'reflection', label: 'Reflections' },
  { key: 'dream', label: 'Dreams' },
  { key: 'learning', label: 'Learning' },
];

const MOODS: { key: JournalMood; label: string }[] = [
  { key: 'happy', label: 'Happy' },
  { key: 'peaceful', label: 'Peaceful' },
  { key: 'grateful', label: 'Grateful' },
  { key: 'excited', label: 'Excited' },
  { key: 'motivated', label: 'Motivated' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'thoughtful', label: 'Thoughtful' },
  { key: 'sad', label: 'Sad' },
  { key: 'stressed', label: 'Stressed' },
  { key: 'anxious', label: 'Anxious' },
  { key: 'confused', label: 'Confused' },
  { key: 'angry', label: 'Angry' },
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

const JournalView: React.FC<JournalViewProps> = ({ onBack, onOpenCommunity }) => {
  // State
  const [entries, setEntries] = useState<JournalEntryFull[]>([]);
  const [calendarData, setCalendarData] = useState<Record<string, JournalCalendarDay[]>>({});
  const [analytics, setAnalytics] = useState<JournalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
  
  // View state
  const [activeTab, setActiveTab] = useState<'calendar' | 'timeline' | 'analytics'>('calendar');
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryFull | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<JournalCategory>('general');
  const [formMood, setFormMood] = useState<JournalMood | ''>('');
  const [formMoodRating, setFormMoodRating] = useState(3);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  
  // ── Load data ──
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    loadCalendarData();
  }, [currentMonth, currentYear]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesData, analyticsData] = await Promise.all([
        api.getJournalEntries(),
        api.getJournalAnalytics('month'),
      ]);
      setEntries(entriesData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load journal data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCalendarData = async () => {
    try {
      const data = await api.getJournalCalendar(currentYear, currentMonth + 1);
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  };
  
  // ── Calendar navigation ──
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
  
  // ── Entry form handlers ──
  const openNewEntry = useCallback((date?: string) => {
    setEditingEntry(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('general');
    setFormMood('');
    setFormMoodRating(3);
    setFormTags([]);
    setFormImageUrl('');
    setFormIsPublic(false);
    if (date) setSelectedDate(date);
    setShowEditor(true);
  }, []);
  
  const openEditEntry = useCallback((entry: JournalEntryFull) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormCategory(entry.category);
    setFormMood(entry.mood || '');
    setFormMoodRating(entry.mood_rating);
    setFormTags(entry.tags);
    setFormImageUrl(entry.image_url || '');
    setFormIsPublic(entry.is_public);
    setSelectedDate(entry.date);
    setShowEditor(true);
  }, []);
  
  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    
    setSaving(true);
    try {
      const entryData: JournalEntryInput = {
        date: selectedDate,
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        mood: formMood || undefined,
        mood_rating: formMoodRating,
        tags: formTags,
        image_url: formImageUrl || undefined,
        is_public: formIsPublic,
      };
      
      if (editingEntry) {
        const updated = await api.updateJournalEntry(editingEntry.id, entryData);
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const created = await api.createJournalEntry(entryData);
        setEntries(prev => [created, ...prev]);
      }
      
      setShowEditor(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
      loadCalendarData();
      loadData();
    } catch (err) {
      console.error('Failed to save entry:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await api.deleteJournalEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setShowEditor(false);
      loadCalendarData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };
  
  const addTag = useCallback(() => {
    const tag = formTagInput.trim().toLowerCase();
    if (tag && !formTags.includes(tag) && formTags.length < 10) {
      setFormTags(prev => [...prev, tag]);
      setFormTagInput('');
    }
  }, [formTagInput, formTags]);
  
  const removeTag = useCallback((tag: string) => {
    setFormTags(prev => prev.filter(t => t !== tag));
  }, []);
  
  // ── Derived data ──
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(today);
  
  const entriesForSelectedDate = useMemo(() => 
    entries.filter(e => e.date === selectedDate).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    [entries, selectedDate]
  );
  
  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  
  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  
  if (loading) {
    return (
      <div className="min-h-screen bg-themed flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 border-3 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-themed-muted text-sm">Loading your journal...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-themed">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1920"
            alt="Journal"
            className="w-full h-full object-cover opacity-12"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8 animate-fadeIn">
            <button onClick={onBack} className="flex items-center gap-2 text-themed-sub text-sm font-medium hover:text-themed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              {onOpenCommunity && (
                <button onClick={onOpenCommunity} className="flex items-center gap-2 bg-themed-card border border-themed px-4 py-2.5 rounded-full text-themed text-xs font-bold hover:bg-themed-muted transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Community
                </button>
              )}
              <button 
                onClick={() => openNewEntry()} 
                className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-stone-700 transition-all shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Entry
              </button>
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center mb-6 animate-fadeIn">
            <div className="ornament-divider mb-4">
              <span className="text-xs tracking-[0.5em] uppercase font-bold" style={{ color: 'var(--accent)' }}>Personal Journal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display text-themed mb-3 font-medium">My Journal</h1>
            <p className="text-themed-muted font-serif text-base italic max-w-lg mx-auto">
              Record your feelings, experiences, adventures, and growth
            </p>
          </div>
          
          {/* Tab navigation */}
          <div className="flex justify-center gap-2 mb-4">
            {(['calendar', 'timeline', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-stone-800 text-white shadow-lg'
                    : 'bg-themed-card border border-themed text-themed-sub hover:bg-themed-muted'
                }`}
              >
                {tab === 'calendar' ? '📅 Calendar' : tab === 'timeline' ? '📜 Timeline' : '📊 Analytics'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Saved message toast */}
      {savedMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-fadeIn flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
          Entry saved!
        </div>
      )}
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fadeIn">
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
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEntries = calendarData[dateStr] || [];
                    const hasEntry = dayEntries.length > 0;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const primaryMood = dayEntries[0]?.mood as JournalMood | undefined;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative ${
                          isSelected
                            ? 'bg-stone-800 text-white shadow-lg scale-105'
                            : isToday
                              ? 'bg-amber-50 border-2 border-amber-300 text-amber-700'
                              : hasEntry
                                ? primaryMood ? MOOD_COLORS[primaryMood] : 'bg-themed-muted text-themed'
                                : 'text-themed-sub hover:bg-themed-muted'
                        }`}
                      >
                        <span className={`text-xs ${isSelected ? 'font-bold' : ''}`}>{day}</span>
                        {hasEntry && (
                          <span className="text-[10px] mt-0.5">
                            {primaryMood ? MOOD_EMOJIS[primaryMood] : '📝'}
                          </span>
                        )}
                        {dayEntries.length > 1 && (
                          <span className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[8px] flex items-center justify-center ${
                            isSelected ? 'bg-white/30 text-white' : 'bg-stone-600 text-white'
                          }`}>
                            {dayEntries.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-themed">
                  <span className="text-themed-muted text-[10px] font-bold uppercase">Mood colors:</span>
                  {['happy', 'peaceful', 'sad', 'stressed'].map(mood => (
                    <div key={mood} className="flex items-center gap-1">
                      <span>{MOOD_EMOJIS[mood as JournalMood]}</span>
                      <span className="text-themed-muted text-[9px] capitalize">{mood}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Selected date panel */}
            <div className="lg:col-span-2">
              <div className="bg-themed-card border border-themed rounded-3xl p-6 sm:p-8 sticky top-6">
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
                  <button
                    onClick={() => openNewEntry(selectedDate)}
                    className="p-2 rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-colors"
                    title="Add entry for this day"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                {/* Entries for selected date */}
                {entriesForSelectedDate.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-themed-muted font-serif italic text-sm">No entries for this day yet.</p>
                    <button
                      onClick={() => openNewEntry(selectedDate)}
                      className="mt-4 text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    >
                      Write your first entry →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {entriesForSelectedDate.map(entry => (
                      <div
                        key={entry.id}
                        onClick={() => openEditEntry(entry)}
                        className="p-4 bg-themed-muted rounded-xl cursor-pointer hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg">{entry.mood ? MOOD_EMOJIS[entry.mood] : CATEGORY_ICONS[entry.category]}</span>
                          <span className="text-themed-muted text-[10px]">
                            {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-medium text-themed text-sm mb-1">{entry.title}</h4>
                        <p className="text-themed-sub text-xs line-clamp-2">{entry.content}</p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-themed-card text-themed-muted">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="animate-fadeIn">
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="font-display text-themed text-2xl mb-2">Your journal is empty</h3>
                <p className="text-themed-muted font-serif italic mb-6">Start documenting your journey today.</p>
                <button
                  onClick={() => openNewEntry()}
                  className="px-6 py-3 bg-stone-800 text-white rounded-full text-sm font-bold hover:bg-stone-700 transition-all shadow-lg"
                >
                  Write Your First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, i) => (
                  <div
                    key={entry.id}
                    onClick={() => openEditEntry(entry)}
                    className="flex gap-4 bg-themed-card border border-themed rounded-2xl p-5 cursor-pointer hover-lift animate-fadeIn"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    {/* Date column */}
                    <div className="shrink-0 w-16 text-center">
                      <div className="font-display text-themed font-bold text-2xl">{new Date(entry.date).getDate()}</div>
                      <div className="text-themed-muted text-[10px] uppercase tracking-wider font-bold">
                        {MONTH_NAMES[new Date(entry.date).getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    
                    <div className="w-px bg-themed self-stretch" />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{entry.mood ? MOOD_EMOJIS[entry.mood] : CATEGORY_ICONS[entry.category]}</span>
                        <h4 className="font-medium text-themed">{entry.title}</h4>
                        {entry.is_public && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Public</span>
                        )}
                      </div>
                      <p className="text-themed-sub text-sm line-clamp-2 mb-2">{entry.content}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-themed-muted text-[10px] uppercase tracking-wider font-bold">{entry.category}</span>
                        {entry.tags.length > 0 && (
                          <div className="flex gap-1">
                            {entry.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-themed-muted text-themed-sub">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Mood rating */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: entry.mood_rating }, (_, j) => (
                        <span key={j} className="text-amber-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: analytics.totalEntries, label: 'Total Entries', icon: '📝' },
                { value: analytics.currentStreak, label: 'Day Streak', icon: '🔥' },
                { value: analytics.averageMoodRating.toFixed(1), label: 'Avg. Mood', icon: '⭐' },
                { value: analytics.moodDistribution.length, label: 'Moods Used', icon: '🎭' },
              ].map((stat, i) => (
                <div key={i} className="bg-themed-card border border-themed rounded-2xl p-5 text-center hover-lift">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="font-display text-themed font-bold text-3xl">{stat.value}</div>
                  <div className="text-themed-muted text-[10px] uppercase tracking-wider font-bold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Mood distribution */}
            <div className="bg-themed-card border border-themed rounded-2xl p-6">
              <h3 className="font-display text-themed text-lg mb-4">Mood Distribution</h3>
              <div className="space-y-2">
                {analytics.moodDistribution.slice(0, 6).map((item) => {
                  const total = analytics.moodDistribution.reduce((sum, m) => sum + m.count, 0);
                  const percent = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.mood} className="flex items-center gap-3">
                      <span className="text-lg w-6">{MOOD_EMOJIS[item.mood as JournalMood] || '😐'}</span>
                      <span className="text-themed text-sm capitalize w-20">{item.mood}</span>
                      <div className="flex-1 h-2 bg-themed-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-themed-muted text-xs w-8">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Category distribution */}
            <div className="bg-themed-card border border-themed rounded-2xl p-6 md:col-span-2">
              <h3 className="font-display text-themed text-lg mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {analytics.categoryDistribution.map((item) => (
                  <div key={item.category} className="flex items-center gap-2 px-3 py-2 bg-themed-muted rounded-full">
                    <span>{CATEGORY_ICONS[item.category as JournalCategory] || '📝'}</span>
                    <span className="text-themed text-sm capitalize">{item.category}</span>
                    <span className="text-themed-muted text-xs font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Entry Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-themed-card w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-themed">
              <div>
                <h2 className="font-display text-themed text-xl">{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
                <p className="text-themed-muted text-xs">{selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setShowEditor(false)} className="p-2 rounded-full hover:bg-themed-muted transition-colors">
                <svg className="w-5 h-5 text-themed-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Title */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  className="w-full bg-themed-muted rounded-xl px-4 py-3 text-themed text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFormCategory(cat.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                        formCategory === cat.key
                          ? 'bg-stone-800 text-white'
                          : 'bg-themed-muted text-themed-sub hover:bg-stone-200'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[cat.key]}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mood */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.key}
                      type="button"
                      onClick={() => setFormMood(formMood === mood.key ? '' : mood.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                        formMood === mood.key
                          ? MOOD_COLORS[mood.key]
                          : 'bg-themed-muted text-themed-sub hover:bg-stone-200'
                      }`}
                    >
                      <span>{MOOD_EMOJIS[mood.key]}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mood rating */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">Day Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormMoodRating(n)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                        n <= formMoodRating ? 'text-amber-400 scale-110' : 'text-themed-muted'
                      }`}
                    >
                      {n <= formMoodRating ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="text-themed-muted text-sm ml-2">{formMoodRating}/5</span>
                </div>
              </div>
              
              {/* Content */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">Your Thoughts *</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your thoughts, feelings, experiences..."
                  className="w-full h-40 bg-themed-muted rounded-xl px-4 py-3 text-themed text-sm font-serif leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formTagInput}
                    onChange={(e) => setFormTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 bg-themed-muted rounded-xl px-4 py-2 text-themed text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-themed-muted rounded-xl text-themed-sub text-sm hover:bg-stone-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formTags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-stone-200 rounded-full text-xs">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-themed-muted hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Image URL */}
              <div>
                <label className="text-themed-muted text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">Image URL (optional)</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-themed-muted rounded-xl px-4 py-3 text-themed text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
              </div>
              
              {/* Public toggle */}
              <div className="flex items-center justify-between p-4 bg-themed-muted rounded-xl">
                <div>
                  <p className="text-themed text-sm font-medium">Make this entry public</p>
                  <p className="text-themed-muted text-xs">Others can see and interact with public entries</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsPublic(!formIsPublic)}
                  className={`w-12 h-6 rounded-full transition-colors ${formIsPublic ? 'bg-emerald-500' : 'bg-stone-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formIsPublic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-themed bg-themed-muted/50">
              {editingEntry ? (
                <button
                  onClick={() => handleDelete(editingEntry.id)}
                  className="px-4 py-2 text-red-500 text-sm font-bold hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Entry
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-themed-sub text-sm font-bold hover:bg-themed-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formTitle.trim() || !formContent.trim()}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    formTitle.trim() && formContent.trim()
                      ? 'bg-stone-800 text-white hover:bg-stone-700 shadow-lg'
                      : 'bg-themed-muted text-themed-muted cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="ornament-divider mb-4">
          <span className="text-themed-muted text-lg">◆</span>
        </div>
        <p className="text-themed-muted text-xs tracking-[0.2em] uppercase font-medium">Your Personal Journal</p>
        <p className="text-themed-muted text-xs font-serif italic mt-2">Document your journey, one day at a time</p>
      </footer>
    </div>
  );
};

export default JournalView;
