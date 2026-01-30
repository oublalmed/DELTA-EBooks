
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

export type ViewState = 'landing' | 'shelf' | 'library' | 'reader' | 'chat' | 'auth' | 'dashboard' | 'expression' | 'journey' | 'profile';

// ── Expression Space ──

export interface ExpressionEntry {
  id: string;
  text: string;
  category: 'feeling' | 'experience' | 'adventure' | 'success' | 'failure' | 'emotion' | 'insight';
  createdAt: string;
  mood?: string;
}

// ── Journey Calendar ──

export type JourneyEntry = {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  emotion: string;
  milestone: string;
  challenge: string;
  reflection: string;
  rating: number; // 1-5
}
export type Language = 'en' | 'fr';
export type ThemeMode = 'light' | 'dark' | 'sepia';

// "?"? User & Auth "?"?

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  email_verified?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  unlockedChapters: Record<string, number[]>;
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

