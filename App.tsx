
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, ThemeMode, Chapter, UserProgress, Book, User, ReadingStreak, Language } from './types';
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

type FeatureKey = 'expression' | 'journey';

type FeatureAccessState = {
  trialUsed: number;
  unlockUntil: string | null;
};

type AdUnlockContext =
  | { type: 'chapter'; book: Book; chapter: Chapter }
  | { type: 'feature'; feature: FeatureKey };

const FEATURE_TRIAL_LIMIT = 5;
const FEATURE_UNLOCK_DAYS = 7;

const App: React.FC = () => {
  // ── View state ──
  const [view, setView] = useState<ViewState>(() => {
    const hasVisited = localStorage.getItem('delta_visited');
    return hasVisited ? 'shelf' : 'landing';
  });
  const [books, setBooks] = useState<Book[]>(BOOKS);
  const [booksLoading, setBooksLoading] = useState(true);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // ── Auth state ──
  const [user, setUser] = useState<User | null>(null);
  const [unlockedChapters, setUnlockedChapters] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('delta_unlocked_chapters');
    return saved ? JSON.parse(saved) : {};
  });
  const [featureAccess, setFeatureAccess] = useState<Record<FeatureKey, FeatureAccessState>>(() => {
    const saved = localStorage.getItem('delta_feature_access');
    return saved ? JSON.parse(saved) : {
      expression: { trialUsed: 0, unlockUntil: null },
      journey: { trialUsed: 0, unlockUntil: null },
    };
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
  const [adUnlockContext, setAdUnlockContext] = useState<AdUnlockContext | null>(null);

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
    localStorage.setItem('delta_unlocked_chapters', JSON.stringify(unlockedChapters));
  }, [unlockedChapters]);

  // ── Feature access persistence ──
  useEffect(() => {
    localStorage.setItem('delta_feature_access', JSON.stringify(featureAccess));
  }, [featureAccess]);

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

  // ── Load books dynamically ──
  useEffect(() => {
    let isMounted = true;
    setBooksLoading(true);
    api.getBooks()
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const systemPromptMap = BOOKS.reduce<Record<string, string>>((acc, book) => {
            acc[book.id] = book.systemPrompt;
            return acc;
          }, {});
          const normalized = data.map(book => ({
            ...book,
            systemPrompt: book.systemPrompt || systemPromptMap[book.id] || '',
            chapters: book.chapters || [],
          }));
          setBooks(normalized);
        }
      })
      .catch(() => {
        // Fallback to bundled books
      })
      .finally(() => {
        if (isMounted) setBooksLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!currentBook) return;
    const updatedBook = books.find(b => b.id === currentBook.id);
    if (!updatedBook) return;
    if (updatedBook !== currentBook) {
      setCurrentBook(updatedBook);
      if (currentChapter) {
        const updatedChapter = updatedBook.chapters.find(ch => ch.id === currentChapter.id);
        if (updatedChapter) setCurrentChapter(updatedChapter);
      }
    }
  }, [books, currentBook, currentChapter]);

  // ── Auth handlers ──
  const handleLogin = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const data = await api.login(email, password);
    localStorage.setItem('delta_token', data.token);
    setUser(data.user);
    setView('shelf');
    return data;
  }, []);

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    setAuthError(null);
    return api.register(email, password, name);
  }, []);

  const handleVerifyEmail = useCallback(async (email: string, code: string) => {
    setAuthError(null);
    return api.verifyEmail(email, code);
  }, []);

  const handleResendVerification = useCallback(async (email: string) => {
    setAuthError(null);
    return api.resendVerification(email);
  }, []);

  const handleForgotPassword = useCallback(async (email: string) => {
    setAuthError(null);
    return api.requestPasswordReset(email);
  }, []);

  const handleResetPassword = useCallback(async (email: string, token: string, password: string) => {
    setAuthError(null);
    return api.resetPassword(email, token, password);
  }, []);

  const handleGoogleSignIn = useCallback(async (credential: string) => {
    setAuthError(null);
    const data = await api.googleSignIn(credential);
    localStorage.setItem('delta_token', data.token);
    setUser(data.user);
    setView('shelf');
    return data;
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('delta_token');
    setUser(null);
    setView('shelf');
  }, []);

  // ── Content access ──
  const isChapterUnlocked = useCallback((bookId: string, chapterId: number) => {
    const unlocked = unlockedChapters[bookId] || [];
    return unlocked.includes(chapterId);
  }, [unlockedChapters]);

  const isChapterAccessible = useCallback((bookId: string, chapterId: number) => {
    return isChapterUnlocked(bookId, chapterId);
  }, [isChapterUnlocked]);

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

  const openChapter = useCallback((book: Book, chapter: Chapter) => {
    if (!currentBook || currentBook.id !== book.id) {
      setCurrentBook(book);
    }
    setCurrentChapter(chapter);
    setView('reader');
    window.scrollTo(0, 0);
    updateStreak();
  }, [currentBook, updateStreak]);

  const handleSelectChapter = useCallback((chapter: Chapter, bookOverride?: Book) => {
    const book = bookOverride || currentBook;
    if (!book) return;

    if (!isChapterAccessible(book.id, chapter.id)) {
      setAdUnlockContext({ type: 'chapter', book, chapter });
      setShowAdUnlock(true);
      return;
    }

    openChapter(book, chapter);
  }, [currentBook, isChapterAccessible, openChapter]);

  const handleOpenAdUnlockForFeature = useCallback((feature: FeatureKey) => {
    setAdUnlockContext({ type: 'feature', feature });
    setShowAdUnlock(true);
  }, []);

  const handleAdUnlockComplete = useCallback(() => {
    if (!adUnlockContext) return;

    if (adUnlockContext.type === 'chapter') {
      const { book, chapter } = adUnlockContext;
      setUnlockedChapters(prev => {
        const existing = prev[book.id] || [];
        if (existing.includes(chapter.id)) return prev;
        return { ...prev, [book.id]: [...existing, chapter.id] };
      });
      setShowAdUnlock(false);
      setAdUnlockContext(null);
      openChapter(book, chapter);
      return;
    }

    const unlockUntil = new Date(Date.now() + FEATURE_UNLOCK_DAYS * 24 * 60 * 60 * 1000).toISOString();
    setFeatureAccess(prev => ({
      ...prev,
      [adUnlockContext.feature]: { ...prev[adUnlockContext.feature], unlockUntil },
    }));
    setShowAdUnlock(false);
    const feature = adUnlockContext.feature;
    setAdUnlockContext(null);
    setView(feature === 'expression' ? 'expression' : 'journey');
    window.scrollTo(0, 0);
  }, [adUnlockContext, openChapter]);

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

  // ── Feature access ──
  const isFeatureUnlocked = useCallback((feature: FeatureKey) => {
    const unlockUntil = featureAccess[feature]?.unlockUntil;
    if (!unlockUntil) return false;
    return new Date(unlockUntil).getTime() > Date.now();
  }, [featureAccess]);

  const consumeFeatureTrial = useCallback((feature: FeatureKey) => {
    setFeatureAccess(prev => {
      const current = prev[feature];
      if (current.trialUsed >= FEATURE_TRIAL_LIMIT) return prev;
      return {
        ...prev,
        [feature]: { ...current, trialUsed: current.trialUsed + 1 }
      };
    });
  }, []);

  const handleOpenFeature = useCallback((feature: FeatureKey) => {
    if (!user) {
      setView('auth');
      return;
    }

    const unlockUntil = featureAccess[feature]?.unlockUntil;
    if (unlockUntil && new Date(unlockUntil).getTime() <= Date.now()) {
      setFeatureAccess(prev => ({
        ...prev,
        [feature]: { ...prev[feature], unlockUntil: null }
      }));
    }

    if (isFeatureUnlocked(feature)) {
      setView(feature === 'expression' ? 'expression' : 'journey');
      window.scrollTo(0, 0);
      return;
    }

    const trialUsed = featureAccess[feature]?.trialUsed || 0;
    if (trialUsed < FEATURE_TRIAL_LIMIT) {
      consumeFeatureTrial(feature);
      setView(feature === 'expression' ? 'expression' : 'journey');
      window.scrollTo(0, 0);
      return;
    }

    handleOpenAdUnlockForFeature(feature);
  }, [consumeFeatureTrial, featureAccess, handleOpenAdUnlockForFeature, isFeatureUnlocked, user]);

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

  const totalChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);

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
        return <LandingView onEnter={handleEnterLibrary} totalBooks={books.length} totalChapters={totalChapters} />;

      case 'auth':
        return (
          <AuthView
            onLogin={handleLogin}
            onRegister={handleRegister}
            onVerifyEmail={handleVerifyEmail}
            onResendVerification={handleResendVerification}
            onForgotPassword={handleForgotPassword}
            onResetPassword={handleResetPassword}
            onGoogleSignIn={handleGoogleSignIn}
            onBack={() => setView('shelf')}
            error={authError}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            user={user!}
            books={books}
            unlockedChapters={unlockedChapters}
            progress={progress}
            onSelectBook={selectBook}
            onBack={() => setView('shelf')}
            onLogout={handleLogout}
            onOpenProfile={handleOpenProfile}
            onUnlockChapter={(book, chapter) => {
              setAdUnlockContext({ type: 'chapter', book, chapter });
              setShowAdUnlock(true);
            }}
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
            books={books}
            progress={progress}
            unlockedChapters={unlockedChapters}
            user={user}
            theme={theme}
            streak={streak}
            onSelect={selectBook}
            onUnlockChapter={(book, chapter) => {
              setAdUnlockContext({ type: 'chapter', book, chapter });
              setShowAdUnlock(true);
            }}
            onToggleTheme={cycleTheme}
            onOpenAuth={() => setView('auth')}
            onOpenDashboard={() => setView('dashboard')}
            onOpenExpression={() => handleOpenFeature('expression')}
            onOpenJourney={() => handleOpenFeature('journey')}
          />
        );

      case 'library':
        return (
          <LibraryView
            book={currentBook!}
            completedIds={currentBookProgress.completedIds}
            unlockedChapterIds={unlockedChapters[currentBook!.id] || []}
            onSelect={handleSelectChapter}
            onChat={() => setView('chat')}
            onBack={() => setView('shelf')}
            onUnlockChapter={(chapter) => {
              setAdUnlockContext({ type: 'chapter', book: currentBook!, chapter });
              setShowAdUnlock(true);
            }}
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
            onNext={(id) => {
              const next = currentBook!.chapters.find(c => c.id === id);
              if (next) {
                if (!isChapterAccessible(currentBook!.id, next.id)) {
                  setAdUnlockContext({ type: 'chapter', book: currentBook!, chapter: next });
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
            onOpenJourney={() => handleOpenFeature('journey')}
          />
        );

      case 'journey':
        return (
          <JourneyCalendarView
            onBack={() => setView('shelf')}
            onOpenExpression={() => handleOpenFeature('expression')}
          />
        );

      default:
        return <ShelfView books={books} progress={progress} unlockedChapters={unlockedChapters} user={user} theme={theme} streak={streak} onSelect={selectBook} onUnlockChapter={(book, chapter) => {
          setAdUnlockContext({ type: 'chapter', book, chapter });
          setShowAdUnlock(true);
        }} onToggleTheme={cycleTheme} onOpenAuth={() => setView('auth')} onOpenDashboard={() => setView('dashboard')} onOpenExpression={() => handleOpenFeature('expression')} onOpenJourney={() => handleOpenFeature('journey')} />;
    }
  };

  if (authLoading || booksLoading) {
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

      {showAdUnlock && adUnlockContext && (
        <AdUnlockModal
          isOpen={showAdUnlock}
          title={adUnlockContext.type === 'chapter' ? `Unlock "${adUnlockContext.chapter.title}"` : 'Unlock Weekly Access'}
          description={
            adUnlockContext.type === 'chapter'
              ? `Watch a rewarded ad to unlock this chapter in "${adUnlockContext.book.title}".`
              : `Watch a rewarded ad to unlock ${adUnlockContext.feature === 'expression' ? 'Expressive Journal' : 'Personal Calendar'} for 7 days.`
          }
          confirmLabel={adUnlockContext.type === 'chapter' ? 'Unlock Chapter' : 'Unlock for 7 Days'}
          placement={adUnlockContext.type === 'chapter' ? 'rewarded-chapter' : `rewarded-${adUnlockContext.feature}`}
          onClose={() => { setShowAdUnlock(false); setAdUnlockContext(null); }}
          onUnlock={handleAdUnlockComplete}
        />
      )}
    </div>
  );
};

export default App;
