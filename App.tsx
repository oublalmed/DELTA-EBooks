
import React, { useState, useEffect } from 'react';
import { ViewState, Chapter, UserProgress, Book, PremiumState, FREE_CHAPTERS_PER_BOOK } from './types';
import { BOOKS } from './constants';
import LandingView from './components/LandingView';
import ShelfView from './components/ShelfView';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';
import ChatView from './components/ChatView';
import PricingModal from './components/PricingModal';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(() => {
    const hasVisited = localStorage.getItem('ebook_has_visited');
    return hasVisited ? 'shelf' : 'landing';
  });
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('ebook_collection_progress');
    return saved ? JSON.parse(saved) : { books: {} };
  });
  const [premium, setPremium] = useState<PremiumState>(() => {
    const saved = localStorage.getItem('ebook_premium');
    return saved ? JSON.parse(saved) : { unlockedBooks: [], allAccess: false };
  });
  const [showPricing, setShowPricing] = useState(false);
  const [pricingTargetBook, setPricingTargetBook] = useState<Book | null>(null);

  useEffect(() => {
    localStorage.setItem('ebook_collection_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('ebook_premium', JSON.stringify(premium));
  }, [premium]);

  const isChapterFree = (chapterId: number) => chapterId <= FREE_CHAPTERS_PER_BOOK;

  const isBookUnlocked = (bookId: string) => premium.allAccess || premium.unlockedBooks.includes(bookId);

  const isChapterAccessible = (bookId: string, chapterId: number) => {
    return isChapterFree(chapterId) || isBookUnlocked(bookId);
  };

  const selectBook = (book: Book) => {
    setCurrentBook(book);
    setView('library');
    window.scrollTo(0, 0);
  };

  const handleEnterLibrary = () => {
    localStorage.setItem('ebook_has_visited', 'true');
    setView('shelf');
  };

  const handleSelectChapter = (chapter: Chapter) => {
    if (!currentBook) return;
    if (!isChapterAccessible(currentBook.id, chapter.id)) {
      setPricingTargetBook(currentBook);
      setShowPricing(true);
      return;
    }
    setCurrentChapter(chapter);
    setView('reader');
    window.scrollTo(0, 0);
  };

  const handleOpenPricing = (book?: Book) => {
    setPricingTargetBook(book || currentBook);
    setShowPricing(true);
  };

  const handleUnlockBook = (bookId: string) => {
    setPremium(prev => ({
      ...prev,
      unlockedBooks: [...new Set([...prev.unlockedBooks, bookId])]
    }));
  };

  const handleUnlockAll = () => {
    setPremium({ unlockedBooks: BOOKS.map(b => b.id), allAccess: true });
  };

  const toggleComplete = (bookId: string, chapterId: number) => {
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
  };

  const saveReflection = (bookId: string, chapterId: number, text: string) => {
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
  };

  const currentBookProgress = currentBook
    ? (progress.books[currentBook.id] || { completedIds: [], reflections: {} })
    : { completedIds: [], reflections: {} };

  const totalChapters = BOOKS.reduce((sum, b) => sum + b.chapters.length, 0);

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingView onEnter={handleEnterLibrary} totalBooks={BOOKS.length} totalChapters={totalChapters} />;
      case 'shelf':
        return (
          <ShelfView
            books={BOOKS}
            progress={progress}
            premium={premium}
            onSelect={selectBook}
            onOpenPricing={handleOpenPricing}
          />
        );
      case 'library':
        return (
          <LibraryView
            book={currentBook!}
            completedIds={currentBookProgress.completedIds}
            isBookUnlocked={isBookUnlocked(currentBook!.id)}
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
            onToggleComplete={() => toggleComplete(currentBook!.id, currentChapter!.id)}
            onSaveReflection={(text) => saveReflection(currentBook!.id, currentChapter!.id, text)}
            onBack={() => setView('library')}
            onNext={(id) => {
              const next = currentBook!.chapters.find(c => c.id === id);
              if (next) {
                if (!isChapterAccessible(currentBook!.id, next.id)) {
                  setPricingTargetBook(currentBook);
                  setShowPricing(true);
                  return;
                }
                setCurrentChapter(next);
              }
            }}
          />
        );
      case 'chat':
        return <ChatView book={currentBook!} onBack={() => setView('library')} />;
      default:
        return <ShelfView books={BOOKS} progress={progress} premium={premium} onSelect={selectBook} onOpenPricing={handleOpenPricing} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] selection:bg-rose-100 selection:text-rose-900 transition-colors duration-1000">
      <div className="page-transition" key={view}>
        {renderView()}
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        targetBook={pricingTargetBook}
        onUnlockBook={handleUnlockBook}
        onUnlockAll={handleUnlockAll}
      />
    </div>
  );
};

export default App;
