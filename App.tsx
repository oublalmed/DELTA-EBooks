
import React, { useState, useEffect } from 'react';
import { ViewState, Chapter, UserProgress, Book } from './types';
import { BOOKS } from './constants';
import LandingView from './components/LandingView';
import ShelfView from './components/ShelfView';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';
import ChatView from './components/ChatView';

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

  useEffect(() => {
    localStorage.setItem('ebook_collection_progress', JSON.stringify(progress));
  }, [progress]);

  const selectBook = (book: Book) => {
    setCurrentBook(book);
    setView('library');
    window.scrollTo(0, 0);
  };

  const handleEnterLibrary = () => {
    localStorage.setItem('ebook_has_visited', 'true');
    setView('shelf');
  };

  const toggleComplete = (bookId: string, chapterId: number) => {
    setProgress(prev => {
      const bookProgress = prev.books[bookId] || { completedIds: [], reflections: {} };
      const newCompleted = bookProgress.completedIds.includes(chapterId)
        ? bookProgress.completedIds.filter(id => id !== chapterId)
        : [...bookProgress.completedIds, chapterId];

      return {
        ...prev,
        books: {
          ...prev.books,
          [bookId]: { ...bookProgress, completedIds: newCompleted }
        }
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
          [bookId]: {
            ...bookProgress,
            reflections: { ...bookProgress.reflections, [chapterId]: text }
          }
        }
      };
    });
  };

  const currentBookProgress = currentBook ? (progress.books[currentBook.id] || { completedIds: [], reflections: {} }) : { completedIds: [], reflections: {} };

  const totalChapters = BOOKS.reduce((sum, b) => sum + b.chapters.length, 0);
  const totalCompleted = BOOKS.reduce((sum, b) => {
    const bp = progress.books[b.id];
    return sum + (bp ? bp.completedIds.length : 0);
  }, 0);

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingView onEnter={handleEnterLibrary} totalBooks={BOOKS.length} totalChapters={totalChapters} />;
      case 'shelf':
        return <ShelfView books={BOOKS} progress={progress} onSelect={selectBook} />;
      case 'library':
        return (
          <LibraryView
            book={currentBook!}
            completedIds={currentBookProgress.completedIds}
            onSelect={(c) => { setCurrentChapter(c); setView('reader'); window.scrollTo(0,0); }}
            onChat={() => setView('chat')}
            onBack={() => setView('shelf')}
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
              if (next) setCurrentChapter(next);
            }}
          />
        );
      case 'chat':
        return <ChatView book={currentBook!} onBack={() => setView('library')} />;
      default:
        return <ShelfView books={BOOKS} progress={progress} onSelect={selectBook} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] selection:bg-rose-100 selection:text-rose-900 transition-colors duration-1000">
      <div className="page-transition" key={view}>
        {renderView()}
      </div>
    </div>
  );
};

export default App;
