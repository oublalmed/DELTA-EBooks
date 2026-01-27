
// ── Book & Chapter Types ──

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  reflectionPrompt: string;
  image: string;
  // Access control fields (from API)
  isPartial?: boolean;
  isTeaser?: boolean;
  isLocked?: boolean;
  accessMessage?: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  coverImage: string;
  accentColor: string;
  chapters: Chapter[];
  systemPrompt: string;
  price?: number;
  currency?: string;
}

// ── View State ──

export type ViewState = 'landing' | 'shelf' | 'library' | 'reader' | 'chat' | 'auth' | 'dashboard';
export type ThemeMode = 'light' | 'dark' | 'sepia';

// ── User & Auth ──

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  purchasedBookIds: string[];
  isLoading: boolean;
}

// ── Chat ──

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// ── Progress ──

export interface BookProgress {
  completedIds: number[];
  reflections: Record<number, string>;
}

export interface UserProgress {
  books: Record<string, BookProgress>;
}

// ── Purchases & Downloads ──

export interface PurchaseRecord {
  id: number;
  book_id: string;
  book_title: string;
  cover_image?: string;
  amount: number;
  currency: string;
  status: string;
  purchased_at: string;
}

export interface DownloadInfo {
  bookId: string;
  downloadsUsed: number;
  downloadsRemaining: number;
  maxDownloads: number;
}

// ── Reader Settings ──

export interface ReaderSettings {
  fontSize: number; // 14-24
  theme: ThemeMode;
}

// ── Reading Streak ──

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  totalDaysRead: number;
  badges: string[];
}

// ── Constants ──

export const FREE_CHAPTERS = 4;
export const PRICE_PER_BOOK = 9.99;
export const BUNDLE_PRICE = 29.99;
export const BUNDLE_SAVINGS = +(PRICE_PER_BOOK * 4 - BUNDLE_PRICE).toFixed(2);
