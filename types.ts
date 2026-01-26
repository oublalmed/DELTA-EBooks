
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

export type ViewState = 'shelf' | 'library' | 'reader' | 'chat';

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
