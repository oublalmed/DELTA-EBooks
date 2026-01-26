
export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  reflectionPrompt: string;
  image: string;
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
}

export type ViewState = 'landing' | 'shelf' | 'library' | 'reader' | 'chat';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BookProgress {
  completedIds: number[];
  reflections: Record<number, string>;
}

export interface UserProgress {
  books: Record<string, BookProgress>;
}

export interface PremiumState {
  unlockedBooks: string[];
  allAccess: boolean;
}

export const FREE_CHAPTERS_PER_BOOK = 3;
export const PRICE_PER_BOOK = 9.99;
export const PRICE_ALL_ACCESS = 24.99;
