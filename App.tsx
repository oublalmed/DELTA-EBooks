
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, ThemeMode, Chapter, UserProgress, Book, User, ReadingStreak, Language, FREE_CHAPTERS, PRICE_PER_BOOK, BUNDLE_PRICE, AdminViewState } from './types';
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
import ProfileView from './components/ProfileView';
// NEW: Enhanced journal and premium components
import JournalView from './components/JournalView';
import PremiumManager from './components/PremiumManager';
import JournalAccessGate from './components/JournalAccessGate';
// NEW: Admin Dashboard and Contact View
import AdminDashboard from './components/admin/AdminDashboard';
import ContactView from './components/ContactView';

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

  // ── Language ──
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('delta_language') as Language) || 'en';
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
  
  // ── NEW: Premium modal (ad-based) ──
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  // ── NEW: Chapter unlock state ──
  const [unlockedChapters, setUnlockedChapters] = useState<Record<string, number[]>>({});
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingUnlock, setPendingUnlock] = useState<{ bookId: string; chapterId: number } | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  
  // ── NEW: Admin state ──
  const [isAdmin, setIsAdmin] = useState(false);

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
          setIsAdmin(data.isAdmin || false); // Check if user is admin
          // Load premium status, unlocked chapters, and user progress
          return Promise.all([
            api.getPremiumStatus(),
            api.getUnlockedChapters(),
            api.getUserProgress()
          ]);
        })
        .then(([premiumData, unlockData, progressData]) => {
          setIsPremium(premiumData.isPremium);
          setUnlockedChapters(unlockData.unlocks || {});
          // Merge database progress with local storage (database takes priority)
          if (progressData.books) {
            setProgress(prev => {
              const merged = { ...prev };
              Object.keys(progressData.books).forEach(bookId => {
                const dbProgress = progressData.books[bookId];
                const localProgress = prev.books[bookId] || { completedIds: [], reflections: {} };
                merged.books[bookId] = {
                  completedIds: dbProgress.completedIds.length > 0 ? dbProgress.completedIds : localProgress.completedIds,
                  reflections: { ...localProgress.reflections, ...dbProgress.reflections }
                };
              });
              return merged;
            });
          }
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
    localStorage.removeItem('delta_refresh_token');
    setUser(null);
    setPurchasedBookIds([]);
    setIsAdmin(false);
    setView('shelf');
  }, []);

  // ── Password Reset Handlers ──
  const handleForgotPassword = useCallback(async (email: string) => {
    setAuthError(null);
    const result = await api.requestPasswordReset(email);
    return result;
  }, []);

  const handleResetPassword = useCallback(async (email: string, token: string, newPassword: string) => {
    setAuthError(null);
    const result = await api.resetPassword(email, token, newPassword);
    if (result.token) {
      localStorage.setItem('delta_token', result.token);
    }
  }, []);

  // ── Google Sign-In Handler ──
  const handleGoogleSignIn = useCallback(async (credential: string) => {
    setAuthError(null);
    const data = await api.googleSignIn(credential);
    localStorage.setItem('delta_token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('delta_refresh_token', data.refreshToken);
    }
    setUser(data.user);
    setIsAdmin(data.user?.role === 'admin');
    // Load purchases
    const profile = await api.getProfile();
    setPurchasedBookIds(profile.purchases);
    setView('shelf');
  }, []);

  // ── Content access ──
  const isBookPurchased = useCallback((bookId: string) => {
    return purchasedBookIds.includes(bookId);
  }, [purchasedBookIds]);

  // Check if a chapter is unlocked (via ad watch)
  const isChapterUnlocked = useCallback((bookId: string, chapterId: number) => {
    const bookUnlocks = unlockedChapters[bookId] || [];
    return bookUnlocks.includes(chapterId);
  }, [unlockedChapters]);

  const isChapterAccessible = useCallback((bookId: string, chapterId: number) => {
    // First 5 chapters are always free
    if (chapterId <= FREE_CHAPTERS) return true;
    // Check if book is purchased
    if (isBookPurchased(bookId)) return true;
    // Check if chapter was unlocked via ad
    if (isChapterUnlocked(bookId, chapterId)) return true;
    return false;
  }, [isBookPurchased, isChapterUnlocked]);

  // Chapters 6+ that are not unlocked show as partial (locked preview)
  const isChapterPartial = useCallback((bookId: string, chapterId: number) => {
    if (chapterId <= FREE_CHAPTERS) return false;
    if (isBookPurchased(bookId)) return false;
    if (isChapterUnlocked(bookId, chapterId)) return false;
    return true; // All locked chapters show partial content
  }, [isBookPurchased, isChapterUnlocked]);

  const isChapterTeaser = useCallback((bookId: string, chapterId: number) => {
    // No teaser mode anymore - just partial for locked chapters
    return false;
  }, []);
  
  // Handle unlocking a chapter via ad
  const handleUnlockChapter = useCallback(async (bookId: string, chapterId: number) => {
    if (!user) {
      setView('auth');
      return;
    }
    setPendingUnlock({ bookId, chapterId });
    setShowAdModal(true);
  }, [user]);
  
  // Simulate watching ad and unlock chapter
  const handleAdWatched = useCallback(async () => {
    if (!pendingUnlock) return;
    
    setAdLoading(true);
    try {
      const result = await api.unlockChapter(pendingUnlock.bookId, pendingUnlock.chapterId);
      if (result.success) {
        // Update local state
        setUnlockedChapters(prev => ({
          ...prev,
          [pendingUnlock.bookId]: [...(prev[pendingUnlock.bookId] || []), pendingUnlock.chapterId]
        }));
        setShowAdModal(false);
        // Navigate to the chapter
        if (currentBook && currentBook.id === pendingUnlock.bookId) {
          const chapter = currentBook.chapters.find(c => c.id === pendingUnlock.chapterId);
          if (chapter) {
            setCurrentChapter(chapter);
            setView('reader');
            window.scrollTo(0, 0);
            updateStreak();
          }
        }
      }
    } catch (error) {
      console.error('Failed to unlock chapter:', error);
    } finally {
      setAdLoading(false);
      setPendingUnlock(null);
    }
  }, [pendingUnlock, currentBook, updateStreak]);

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

    // Check if chapter is accessible (free or unlocked)
    if (isChapterAccessible(currentBook.id, chapter.id)) {
      // Full access - show complete chapter
      setCurrentChapter(chapter);
      setView('reader');
      window.scrollTo(0, 0);
      updateStreak();
      return;
    }

    // Chapter is locked (6+) - show preview with unlock prompt
    const words = chapter.content.split(' ');
    const cutPoint = Math.floor(words.length * 0.25); // Show 25% preview
    const processedChapter = {
      ...chapter,
      content: words.slice(0, cutPoint).join(' '),
      isPartial: true,
      isLocked: true,
      accessMessage: 'Watch a short video to unlock this chapter and continue your journey.',
    };

    setCurrentChapter(processedChapter);
    setView('reader');
    window.scrollTo(0, 0);
  }, [currentBook, isChapterAccessible, updateStreak]);

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
      const isCompleted = bookProgress.completedIds.includes(chapterId);
      const newCompleted = isCompleted
        ? bookProgress.completedIds.filter(id => id !== chapterId)
        : [...bookProgress.completedIds, chapterId];
      
      // Save to database if logged in
      if (user) {
        api.markChapterComplete(bookId, chapterId, !isCompleted).catch(console.error);
      }
      
      return {
        ...prev,
        books: { ...prev.books, [bookId]: { ...bookProgress, completedIds: newCompleted } }
      };
    });
  }, [user]);

  const saveReflection = useCallback((bookId: string, chapterId: number, text: string) => {
    setProgress(prev => {
      const bookProgress = prev.books[bookId] || { completedIds: [], reflections: {} };
      
      // Save to database if logged in
      if (user) {
        api.saveChapterReflection(bookId, chapterId, text).catch(console.error);
      }
      
      return {
        ...prev,
        books: {
          ...prev.books,
          [bookId]: { ...bookProgress, reflections: { ...bookProgress.reflections, [chapterId]: text } }
        }
      };
    });
  }, [user]);

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
            books={BOOKS}
            purchasedBookIds={purchasedBookIds}
            onSelectBook={selectBook}
            onBack={() => setView('shelf')}
            onLogout={handleLogout}
            onOpenProfile={handleOpenProfile}
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
            purchasedBookIds={purchasedBookIds}
            user={user}
            theme={theme}
            streak={streak}
            isPremium={isPremium}
            onSelect={selectBook}
            onOpenPricing={handleOpenPricing}
            onOpenBundle={handleOpenBundle}
            onOpenPremium={() => {
              if (!user) {
                setView('auth');
                return;
              }
              setShowPremiumModal(true);
            }}
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
            isBookPurchased={isBookPurchased(currentBook!.id)}
            freeChapters={FREE_CHAPTERS}
            unlockedChapterIds={unlockedChapters[currentBook!.id] || []}
            onSelect={handleSelectChapter}
            onChat={() => setView('chat')}
            onBack={() => setView('shelf')}
            onUnlock={(chapterId) => handleUnlockChapter(currentBook!.id, chapterId)}
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
            language={language}
            onToggleComplete={() => toggleComplete(currentBook!.id, currentChapter!.id)}
            onSaveReflection={(text) => saveReflection(currentBook!.id, currentChapter!.id, text)}
            onBack={() => setView('library')}
            onToggleTheme={cycleTheme}
            onSetFontSize={setFontSize}
            onUpdateLanguage={handleUpdateLanguage}
            onUnlock={() => handleUnlockChapter(currentBook!.id, currentChapter!.id)}
            onNext={(id) => {
              const next = currentBook!.chapters.find(c => c.id === id);
              if (next) {
                handleSelectChapter(next);
              }
            }}
          />
        );

      case 'chat':
        return <ChatView book={currentBook!} onBack={() => setView('library')} />;

      case 'expression':
        return (
          <JournalAccessGate onBack={() => setView('shelf')}>
            <ExpressionSpaceView
              onBack={() => setView('shelf')}
              onOpenJourney={() => { setView('journey'); window.scrollTo(0, 0); }}
            />
          </JournalAccessGate>
        );

      case 'journey':
        return (
          <JournalAccessGate onBack={() => setView('shelf')}>
            <JourneyCalendarView
              onBack={() => setView('shelf')}
              onOpenExpression={() => { setView('expression'); window.scrollTo(0, 0); }}
            />
          </JournalAccessGate>
        );

      case 'journal':
        return (
          <JournalAccessGate onBack={() => setView('shelf')}>
            <JournalView
              onBack={() => setView('shelf')}
              onOpenCommunity={() => {
                // TODO: Implement community view for public entries
                setView('shelf');
              }}
            />
          </JournalAccessGate>
        );

      case 'admin':
        // Admin dashboard - only accessible by admins
        if (!isAdmin) {
          setView('shelf');
          return null;
        }
        return (
          <AdminDashboard
            onLogout={handleLogout}
            onBack={() => setView('shelf')}
          />
        );

      case 'contact':
        // Client messaging and ideas submission
        if (!user) {
          setView('auth');
          return null;
        }
        return (
          <ContactView onBack={() => setView('shelf')} />
        );

      default:
        return <ShelfView 
          books={BOOKS} 
          progress={progress} 
          purchasedBookIds={purchasedBookIds} 
          user={user} 
          theme={theme} 
          streak={streak} 
          isPremium={isPremium}
          isAdmin={isAdmin}
          onSelect={selectBook} 
          onOpenPricing={handleOpenPricing} 
          onOpenBundle={handleOpenBundle} 
          onOpenPremium={() => { if (!user) { setView('auth'); return; } setShowPremiumModal(true); }} 
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
          onOpenAdmin={() => setView('admin')}
          onOpenContact={() => setView('contact')}
        />;
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
      
      {/* NEW: Ad-based Premium Modal */}
      <PremiumManager
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onStatusChange={(premium) => setIsPremium(premium)}
      />
      
      {/* Chapter Unlock Ad Modal */}
      {showAdModal && pendingUnlock && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-themed-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fadeIn">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-display text-themed font-medium mb-3">
              Unlock Chapter {pendingUnlock.chapterId}
            </h3>
            <p className="text-themed-sub mb-6">
              Watch a short video (~30 seconds) to unlock this chapter permanently.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleAdWatched}
                disabled={adLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Watch Ad to Unlock
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowAdModal(false);
                  setPendingUnlock(null);
                }}
                className="w-full py-3 text-themed-muted text-sm font-medium hover:text-themed transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <p className="text-themed-muted text-xs mt-4">
              Once unlocked, this chapter stays accessible forever.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
