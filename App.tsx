
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, ThemeMode, Chapter, UserProgress, Book, User, ReadingStreak, FREE_CHAPTERS, PRICE_PER_BOOK, BUNDLE_PRICE } from './types';
import { BOOKS } from './constants';
import * as api from './services/api';

import LandingView from './components/LandingView';
import ShelfView from './components/ShelfView';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';
import ChatView from './components/ChatView';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import PricingModal from './components/PricingModal';
import ExpressionSpaceView from './components/ExpressionSpaceView';
import JourneyCalendarView from './components/JourneyCalendarView';

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
  const [purchasedBookIds, setPurchasedBookIds] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Theme & Reader ──
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('delta_theme') as ThemeMode) || 'light';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('delta_fontsize') || '18');
  });

  // ── Progress ──
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('delta_progress');
    return saved ? JSON.parse(saved) : { books: {} };
  });

  // ── Pricing modal ──
  const [showPricing, setShowPricing] = useState(false);
  const [pricingTargetBook, setPricingTargetBook] = useState<Book | null>(null);
  const [isBundleMode, setIsBundleMode] = useState(false);

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

  // ── Progress persistence ──
  useEffect(() => {
    localStorage.setItem('delta_progress', JSON.stringify(progress));
  }, [progress]);

  // ── Streak persistence ──
  useEffect(() => {
    localStorage.setItem('delta_streak', JSON.stringify(streak));
  }, [streak]);

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
          setPurchasedBookIds(data.purchases);
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
    // Load purchases
    const profile = await api.getProfile();
    setPurchasedBookIds(profile.purchases);
    setView('shelf');
  }, []);

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    setAuthError(null);
    const data = await api.register(email, password, name);
    localStorage.setItem('delta_token', data.token);
    setUser(data.user);
    setPurchasedBookIds([]);
    setView('shelf');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('delta_token');
    setUser(null);
    setPurchasedBookIds([]);
    setView('shelf');
  }, []);

  // ── Content access ──
  const isBookPurchased = useCallback((bookId: string) => {
    return purchasedBookIds.includes(bookId);
  }, [purchasedBookIds]);

  const isChapterAccessible = useCallback((bookId: string, chapterId: number) => {
    if (isBookPurchased(bookId)) return true;
    return chapterId <= FREE_CHAPTERS;
  }, [isBookPurchased]);

  const isChapterPartial = useCallback((bookId: string, chapterId: number) => {
    if (isBookPurchased(bookId)) return false;
    return chapterId === 3; // Chapter 3 is partially visible
  }, [isBookPurchased]);

  const isChapterTeaser = useCallback((bookId: string, chapterId: number) => {
    if (isBookPurchased(bookId)) return false;
    return chapterId === 4; // Chapter 4 is a teaser
  }, [isBookPurchased]);

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
      // Locked chapter — show pricing
      setPricingTargetBook(currentBook);
      setShowPricing(true);
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
        accessMessage: 'This chapter continues... Purchase the book to read the full content.',
      };
    } else if (isChapterTeaser(currentBook.id, chapter.id)) {
      const words = chapter.content.split(' ');
      const cutPoint = Math.floor(words.length * 0.3);
      processedChapter = {
        ...chapter,
        content: words.slice(0, cutPoint).join(' '),
        isTeaser: true,
        isPartial: true,
        accessMessage: 'The story continues with a powerful revelation... Purchase the book to discover what comes next.',
      };
    }

    setCurrentChapter(processedChapter);
    setView('reader');
    window.scrollTo(0, 0);
    updateStreak(); // Track reading streak
  }, [currentBook, isChapterAccessible, isChapterPartial, isChapterTeaser, updateStreak]);

  const handleOpenPricing = useCallback((book?: Book) => {
    if (!user) {
      setView('auth');
      return;
    }
    setIsBundleMode(false);
    setPricingTargetBook(book || currentBook);
    setShowPricing(true);
  }, [user, currentBook]);

  const handleOpenBundle = useCallback(() => {
    if (!user) {
      setView('auth');
      return;
    }
    setIsBundleMode(true);
    setPricingTargetBook(null);
    setShowPricing(true);
  }, [user]);

  const handlePurchaseComplete = useCallback((bookId: string) => {
    setPurchasedBookIds(prev => [...new Set([...prev, bookId])]);
    setShowPricing(false);
  }, []);

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
            purchasedBookIds={purchasedBookIds}
            onSelectBook={selectBook}
            onBack={() => setView('shelf')}
            onLogout={handleLogout}
          />
        );

      case 'shelf':
        return (
          <ShelfView
            books={BOOKS}
            progress={progress}
            purchasedBookIds={purchasedBookIds}
            user={user}
            theme={theme}
            streak={streak}
            onSelect={selectBook}
            onOpenPricing={handleOpenPricing}
            onOpenBundle={handleOpenBundle}
            onToggleTheme={cycleTheme}
            onOpenAuth={() => setView('auth')}
            onOpenDashboard={() => setView('dashboard')}
            onOpenExpression={() => { setView('expression'); window.scrollTo(0, 0); }}
            onOpenJourney={() => { setView('journey'); window.scrollTo(0, 0); }}
          />
        );

      case 'library':
        return (
          <LibraryView
            book={currentBook!}
            completedIds={currentBookProgress.completedIds}
            isBookPurchased={isBookPurchased(currentBook!.id)}
            freeChapters={FREE_CHAPTERS}
            onSelect={handleSelectChapter}
            onChat={() => setView('chat')}
            onBack={() => setView('shelf')}
            onUnlock={() => handleOpenPricing(currentBook!)}
          />
        );

      case 'reader':
        return (
          <ReaderView
            book={currentBook!}
            chapter={currentChapter!}
            isCompleted={currentBookProgress.completedIds.includes(currentChapter!.id)}
            savedReflection={currentBookProgress.reflections[currentChapter!.id] || ''}
            isBookPurchased={isBookPurchased(currentBook!.id)}
            theme={theme}
            fontSize={fontSize}
            onToggleComplete={() => toggleComplete(currentBook!.id, currentChapter!.id)}
            onSaveReflection={(text) => saveReflection(currentBook!.id, currentChapter!.id, text)}
            onBack={() => setView('library')}
            onToggleTheme={cycleTheme}
            onSetFontSize={setFontSize}
            onUnlock={() => handleOpenPricing(currentBook!)}
            onNext={(id) => {
              const next = currentBook!.chapters.find(c => c.id === id);
              if (next) {
                if (!isChapterAccessible(currentBook!.id, next.id)) {
                  setPricingTargetBook(currentBook);
                  setShowPricing(true);
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
        return <ShelfView books={BOOKS} progress={progress} purchasedBookIds={purchasedBookIds} user={user} theme={theme} streak={streak} onSelect={selectBook} onOpenPricing={handleOpenPricing} onOpenBundle={handleOpenBundle} onToggleTheme={cycleTheme} onOpenAuth={() => setView('auth')} onOpenDashboard={() => setView('dashboard')} onOpenExpression={() => { setView('expression'); window.scrollTo(0, 0); }} onOpenJourney={() => { setView('journey'); window.scrollTo(0, 0); }} />;
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

      {showPricing && (pricingTargetBook || isBundleMode) && (
        <PricingModal
          isOpen={showPricing}
          onClose={() => { setShowPricing(false); setIsBundleMode(false); }}
          targetBook={pricingTargetBook}
          user={user}
          isBundleMode={isBundleMode}
          allBooks={BOOKS}
          purchasedBookIds={purchasedBookIds}
          onPurchaseComplete={handlePurchaseComplete}
          onOpenAuth={() => { setShowPricing(false); setView('auth'); }}
        />
      )}
    </div>
  );
};

export default App;
