
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, ThemeMode, Chapter, UserProgress, Book, User, ReadingStreak, Language, FREE_CHAPTERS } from './types';
import { BOOKS } from './constants';
import * as api from './services/api';

import LandingView from './components/LandingView';
import ShelfView from './components/ShelfView';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';
import ChatView from './components/ChatView';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import AdUnlockModal from './components/AdUnlockModal';
import ExpressionSpaceView from './components/ExpressionSpaceView';
import JourneyCalendarView from './components/JourneyCalendarView';
import ProfileView from './components/ProfileView';

const App: React.FC = () => {
  // ── View state ──
  const [view, setView] = useState<ViewState>(() => {
    const hasVisited = localStorage.getItem('delta_visited');
    return hasVisited ? 'shelf' : 'landing';
  });
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // ── Auth state ──
  const [user, setUser] = useState<User | null>(null);
  const [adUnlockedBookIds, setAdUnlockedBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('delta_ad_unlocks');
    return saved ? JSON.parse(saved) : [];
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Theme & Reader ──
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('delta_theme') as ThemeMode) || 'light';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('delta_fontsize') || '18');
  });

  // ── Language ──
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('delta_language') as Language) || 'en';
  });

  // ── Progress ──
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('delta_progress');
    return saved ? JSON.parse(saved) : { books: {} };
  });

  // ── Ad unlock modal ──
  const [showAdUnlock, setShowAdUnlock] = useState(false);
  const [adTargetBook, setAdTargetBook] = useState<Book | null>(null);

  // ── Reading streak ──
  const [streak, setStreak] = useState<ReadingStreak>(() => {
    const saved = localStorage.getItem('delta_streak');
    return saved ? JSON.parse(saved) : { currentStreak: 0, longestStreak: 0, lastReadDate: '', totalDaysRead: 0, badges: [] };
  });

  // ── Theme application ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('delta_theme', theme);
  }, [theme]);

  // ── Font size persistence ──
  useEffect(() => {
    localStorage.setItem('delta_fontsize', String(fontSize));
  }, [fontSize]);

  // ── Language persistence ──
  useEffect(() => {
    localStorage.setItem('delta_language', language);
  }, [language]);

  // ── Progress persistence ──
  useEffect(() => {
    localStorage.setItem('delta_progress', JSON.stringify(progress));
  }, [progress]);

  // ── Streak persistence ──
  useEffect(() => {
    localStorage.setItem('delta_streak', JSON.stringify(streak));
  }, [streak]);

  // ── Ad unlock persistence ──
  useEffect(() => {
    localStorage.setItem('delta_ad_unlocks', JSON.stringify(adUnlockedBookIds));
  }, [adUnlockedBookIds]);

  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setStreak(prev => {
      if (prev.lastReadDate === today) return prev; // Already counted today
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = prev.lastReadDate === yesterday;
      const newCurrent = isConsecutive ? prev.currentStreak + 1 : 1;
      const newLongest = Math.max(prev.longestStreak, newCurrent);
      const newTotal = prev.totalDaysRead + 1;

      // Check for new badges
      const badgeThresholds = [
        { min: 3, label: 'Curious Mind' }, { min: 7, label: 'Week Warrior' },
        { min: 14, label: 'Deep Thinker' }, { min: 30, label: 'Philosopher' },
        { min: 60, label: 'Wisdom Seeker' }, { min: 100, label: 'Enlightened' },
      ];
      const newBadges = [...prev.badges];
      badgeThresholds.forEach(b => {
        if (newCurrent >= b.min && !newBadges.includes(b.label)) newBadges.push(b.label);
      });

      return { currentStreak: newCurrent, longestStreak: newLongest, lastReadDate: today, totalDaysRead: newTotal, badges: newBadges };
    });
  }, []);

  // ── Load user session on mount ──
  useEffect(() => {
    const token = localStorage.getItem('delta_token');
    if (token) {
      api.getProfile()
        .then(data => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('delta_token');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // ── Auth handlers ──
  const handleLogin = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const data = await api.login(email, password);
    localStorage.setItem('delta_token', data.token);
    setUser(data.user);
    setView('shelf');
  }, []);

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    setAuthError(null);
    const data = await api.register(email, password, name);
    localStorage.setItem('delta_token', data.token);
    setUser(data.user);
    setView('shelf');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('delta_token');
    setUser(null);
    setView('shelf');
  }, []);

  // ── Content access ──
  const isBookUnlocked = useCallback((bookId: string) => {
    return adUnlockedBookIds.includes(bookId);
  }, [adUnlockedBookIds]);

  const isChapterAccessible = useCallback((bookId: string, chapterId: number) => {
    if (isBookUnlocked(bookId)) return true;
    return chapterId <= FREE_CHAPTERS;
  }, [isBookUnlocked]);

  const isChapterPartial = useCallback((bookId: string, chapterId: number) => {
    if (isBookUnlocked(bookId)) return false;
    return chapterId === 3; // Chapter 3 is partially visible
  }, [isBookUnlocked]);

  const isChapterTeaser = useCallback((bookId: string, chapterId: number) => {
    if (isBookUnlocked(bookId)) return false;
    return chapterId === 4; // Chapter 4 is a teaser
  }, [isBookUnlocked]);

  // ── Navigation handlers ──
  const selectBook = useCallback((book: Book) => {
    setCurrentBook(book);
    setView('library');
    window.scrollTo(0, 0);
  }, []);

  const handleEnterLibrary = useCallback(() => {
    localStorage.setItem('delta_visited', 'true');
    setView('shelf');
  }, []);

  const handleSelectChapter = useCallback((chapter: Chapter) => {
    if (!currentBook) return;

    if (!isChapterAccessible(currentBook.id, chapter.id)) {
      // Locked chapter — show ad unlock
      setAdTargetBook(currentBook);
      setShowAdUnlock(true);
      return;
    }

    // Apply partial/teaser content rules client-side
    let processedChapter = { ...chapter };
    if (isChapterPartial(currentBook.id, chapter.id)) {
      const words = chapter.content.split(' ');
      const cutPoint = Math.floor(words.length * 0.6);
      processedChapter = {
        ...chapter,
        content: words.slice(0, cutPoint).join(' '),
        isPartial: true,
        accessMessage: 'This chapter continues... Watch a short ad to unlock the full content.',
      };
    } else if (isChapterTeaser(currentBook.id, chapter.id)) {
      const words = chapter.content.split(' ');
      const cutPoint = Math.floor(words.length * 0.3);
      processedChapter = {
        ...chapter,
        content: words.slice(0, cutPoint).join(' '),
        isTeaser: true,
        isPartial: true,
        accessMessage: 'The story continues with a powerful revelation... Watch a short ad to discover what comes next.',
      };
    }

    setCurrentChapter(processedChapter);
    setView('reader');
    window.scrollTo(0, 0);
    updateStreak(); // Track reading streak
  }, [currentBook, isChapterAccessible, isChapterPartial, isChapterTeaser, updateStreak]);

  const handleOpenAdUnlock = useCallback((book?: Book) => {
    const target = book || currentBook;
    if (!target || isBookUnlocked(target.id)) return;
    setAdTargetBook(target);
    setShowAdUnlock(true);
  }, [currentBook, isBookUnlocked]);

  const handleAdUnlockComplete = useCallback((bookId: string) => {
    setAdUnlockedBookIds(prev => [...new Set([...prev, bookId])]);
    setShowAdUnlock(false);
    setAdTargetBook(null);
  }, []);

  const handleUpdateUser = useCallback(async (name: string) => {
    if (!user) return;
    const updatedUser = await api.updateProfile({ name });
    setUser(updatedUser);
  }, [user]);

  const handleUpdateLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const handleOpenProfile = useCallback(() => {
    if (!user) {
      setView('auth');
      return;
    }
    setView('profile');
  }, [user]);

  // ── Progress handlers ──
  const toggleComplete = useCallback((bookId: string, chapterId: number) => {
    setProgress(prev => {
      const bookProgress = prev.books[bookId] || { completedIds: [], reflections: {} };
      const newCompleted = bookProgress.completedIds.includes(chapterId)
        ? bookProgress.completedIds.filter(id => id !== chapterId)
        : [...bookProgress.completedIds, chapterId];
      return {
        ...prev,
        books: { ...prev.books, [bookId]: { ...bookProgress, completedIds: newCompleted } }
      };
    });
  }, []);

  const saveReflection = useCallback((bookId: string, chapterId: number, text: string) => {
    setProgress(prev => {
      const bookProgress = prev.books[bookId] || { completedIds: [], reflections: {} };
      return {
        ...prev,
        books: {
          ...prev.books,
          [bookId]: { ...bookProgress, reflections: { ...bookProgress.reflections, [chapterId]: text } }
        }
      };
    });
  }, []);

  // ── Derived data ──
  const currentBookProgress = currentBook
    ? (progress.books[currentBook.id] || { completedIds: [], reflections: {} })
    : { completedIds: [], reflections: {} };

  const totalChapters = BOOKS.reduce((sum, b) => sum + b.chapters.length, 0);

  // ── Theme cycling ──
  const cycleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'sepia';
      return 'light';
    });
  }, []);

  // ── Render ──
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingView onEnter={handleEnterLibrary} totalBooks={BOOKS.length} totalChapters={totalChapters} />;

      case 'auth':
        return (
          <AuthView
            onLogin={handleLogin}
            onRegister={handleRegister}
            onBack={() => setView('shelf')}
            error={authError}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            user={user!}
            books={BOOKS}
            unlockedBookIds={adUnlockedBookIds}
            progress={progress}
            onSelectBook={selectBook}
            onBack={() => setView('shelf')}
            onLogout={handleLogout}
            onOpenProfile={handleOpenProfile}
            onUnlock={handleOpenAdUnlock}
          />
        );

      case 'profile':
        return (
          <ProfileView
            user={user!}
            language={language}
            onUpdateUser={handleUpdateUser}
            onUpdateLanguage={handleUpdateLanguage}
            onBack={() => setView('dashboard')}
          />
        );

      case 'shelf':
        return (
          <ShelfView
            books={BOOKS}
            progress={progress}
            unlockedBookIds={adUnlockedBookIds}
            user={user}
            theme={theme}
            streak={streak}
            onSelect={selectBook}
            onUnlock={handleOpenAdUnlock}
            onToggleTheme={cycleTheme}
            onOpenAuth={() => setView('auth')}
            onOpenDashboard={() => setView('dashboard')}
            onOpenExpression={() => {
              if (!user) {
                setView('auth');
                return;
              }
              setView('expression');
              window.scrollTo(0, 0);
            }}
            onOpenJourney={() => {
              if (!user) {
                setView('auth');
                return;
              }
              setView('journey');
              window.scrollTo(0, 0);
            }}
          />
        );

      case 'library':
        return (
          <LibraryView
            book={currentBook!}
            completedIds={currentBookProgress.completedIds}
            isBookUnlocked={isBookUnlocked(currentBook!.id)}
            freeChapters={FREE_CHAPTERS}
            onSelect={handleSelectChapter}
            onChat={() => setView('chat')}
            onBack={() => setView('shelf')}
            onUnlock={() => handleOpenAdUnlock(currentBook!)}
          />
        );

      case 'reader':
        return (
          <ReaderView
            book={currentBook!}
            chapter={currentChapter!}
            isCompleted={currentBookProgress.completedIds.includes(currentChapter!.id)}
            savedReflection={currentBookProgress.reflections[currentChapter!.id] || ''}
            theme={theme}
            fontSize={fontSize}
            language={language}
            onToggleComplete={() => toggleComplete(currentBook!.id, currentChapter!.id)}
            onSaveReflection={(text) => saveReflection(currentBook!.id, currentChapter!.id, text)}
            onBack={() => setView('library')}
            onToggleTheme={cycleTheme}
            onSetFontSize={setFontSize}
            onUpdateLanguage={handleUpdateLanguage}
            onUnlock={() => handleOpenAdUnlock(currentBook!)}
            onNext={(id) => {
              const next = currentBook!.chapters.find(c => c.id === id);
              if (next) {
                if (!isChapterAccessible(currentBook!.id, next.id)) {
                  setAdTargetBook(currentBook);
                  setShowAdUnlock(true);
                  return;
                }
                handleSelectChapter(next);
              }
            }}
          />
        );

      case 'chat':
        return <ChatView book={currentBook!} onBack={() => setView('library')} />;

      case 'expression':
        return (
          <ExpressionSpaceView
            onBack={() => setView('shelf')}
            onOpenJourney={() => { setView('journey'); window.scrollTo(0, 0); }}
          />
        );

      case 'journey':
        return (
          <JourneyCalendarView
            onBack={() => setView('shelf')}
            onOpenExpression={() => { setView('expression'); window.scrollTo(0, 0); }}
          />
        );

      default:
        return <ShelfView books={BOOKS} progress={progress} unlockedBookIds={adUnlockedBookIds} user={user} theme={theme} streak={streak} onSelect={selectBook} onUnlock={handleOpenAdUnlock} onToggleTheme={cycleTheme} onOpenAuth={() => setView('auth')} onOpenDashboard={() => setView('dashboard')} onOpenExpression={() => {
          if (!user) {
            setView('auth');
            return;
          }
          setView('expression');
          window.scrollTo(0, 0);
        }} onOpenJourney={() => {
          if (!user) {
            setView('auth');
            return;
          }
          setView('journey');
          window.scrollTo(0, 0);
        }} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-themed flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 border-3 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-themed-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-themed transition-colors duration-300">
      <div className="page-transition" key={view}>
        {renderView()}
      </div>

      {showAdUnlock && adTargetBook && (
        <AdUnlockModal
          isOpen={showAdUnlock}
          bookTitle={adTargetBook.title}
          onClose={() => { setShowAdUnlock(false); setAdTargetBook(null); }}
          onUnlock={() => handleAdUnlockComplete(adTargetBook.id)}
        />
      )}
    </div>
  );
};

export default App;
