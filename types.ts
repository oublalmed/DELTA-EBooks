
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

export type ViewState = 'landing' | 'shelf' | 'library' | 'reader' | 'chat' | 'auth' | 'dashboard' | 'expression' | 'journey' | 'profile' | 'journal' | 'community' | 'admin' | 'contact';

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

// ══════════════════════════════════════════════════════════════════
// NEW: Enhanced Journal Types
// ══════════════════════════════════════════════════════════════════

export type JournalCategory = 
  | 'general'
  | 'feeling'
  | 'experience'
  | 'adventure'
  | 'success'
  | 'failure'
  | 'gratitude'
  | 'goal'
  | 'reflection'
  | 'dream'
  | 'learning';

export type JournalMood = 
  | 'happy'
  | 'peaceful'
  | 'grateful'
  | 'excited'
  | 'motivated'
  | 'neutral'
  | 'thoughtful'
  | 'sad'
  | 'stressed'
  | 'anxious'
  | 'confused'
  | 'angry';

export interface JournalEntryInput {
  date: string;
  title: string;
  category?: JournalCategory;
  content: string;
  mood?: JournalMood;
  mood_rating?: number;
  tags?: string[];
  image_url?: string;
  is_public?: boolean;
  book_id?: string;
}

export interface JournalEntryFull {
  id: number;
  user_id: number;
  book_id: string | null;
  date: string;
  title: string;
  category: JournalCategory;
  content: string;
  mood: JournalMood | null;
  mood_rating: number;
  tags: string[];
  image_url: string | null;
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Public feed extras
  author_name?: string;
  comments_count?: number;
  is_liked?: boolean;
  book_title?: string;
}

export interface JournalComment {
  id: number;
  entry_id: number;
  user_id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export interface JournalCalendarDay {
  mood: JournalMood | null;
  mood_rating: number;
  title: string;
  category: JournalCategory;
}

export interface JournalAnalytics {
  moodDistribution: { mood: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  averageMoodRating: number;
  currentStreak: number;
  totalEntries: number;
}

// ══════════════════════════════════════════════════════════════════
// NEW: Ad-Based Premium Types
// ══════════════════════════════════════════════════════════════════

export type PremiumAccessType = 'free' | 'trial' | 'ad_reward';

export interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: string | null;
  accessType: PremiumAccessType;
  trialAvailable: boolean;
  trialUsed: boolean;
  adsWatchedToday: number;
  maxAdsPerDay: number;
  canWatchAd: boolean;
  durationDays: number;
  activeAccess: {
    grantedAt: string;
    expiresAt: string;
    durationDays: number;
  } | null;
}

export interface PremiumGrantRequest {
  adNetwork?: string;
  adUnitId?: string;
  rewardAmount?: number;
  deviceId?: string;
  platform?: string;
  verificationToken?: string;
}

export interface PremiumGrantResponse {
  success: boolean;
  message: string;
  premiumUntil: string;
  durationDays: number;
}

export interface PremiumHistoryItem {
  id: number;
  user_id: number;
  access_type: string;
  granted_at: string;
  expires_at: string;
  duration_days: number;
  ad_network: string | null;
  platform: string | null;
}

// ── Constants ──

export const FREE_CHAPTERS = 5;  // First 5 chapters are free for all
export const PRICE_PER_BOOK = 9.99;
export const BUNDLE_PRICE = 29.99;
export const BUNDLE_SAVINGS = +(PRICE_PER_BOOK * 4 - BUNDLE_PRICE).toFixed(2);

// Premium constants
export const PREMIUM_DURATION_DAYS = 7;
export const TRIAL_DURATION_DAYS = 3;

// Journal/Calendar free access period
export const JOURNAL_FREE_DAYS = 7;  // First week free

// PDF Download requirements
export const PDF_ADS_REQUIRED = 5;  // Must watch 5 ads to download PDF

// ══════════════════════════════════════════════════════════════════
// NEW: Feature Access Types
// ══════════════════════════════════════════════════════════════════

export interface JournalAccessStatus {
  hasAccess: boolean;
  freeTrialActive: boolean;
  freeTrialEndsAt: string | null;
  freeTrialExpired: boolean;
  accessUntil: string | null;
  daysRemaining: number;
}

export interface ChapterUnlockStatus {
  chapterId: number;
  bookId: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface PDFDownloadStatus {
  bookId: string;
  adsWatched: number;
  adsRequired: number;
  isUnlocked: boolean;
  canDownload: boolean;
}

// NEW: Journal mood colors for calendar
export const MOOD_COLORS: Record<JournalMood, string> = {
  happy: 'bg-amber-100 border-amber-300 text-amber-700',
  peaceful: 'bg-emerald-100 border-emerald-300 text-emerald-700',
  grateful: 'bg-pink-100 border-pink-300 text-pink-700',
  excited: 'bg-orange-100 border-orange-300 text-orange-700',
  motivated: 'bg-red-100 border-red-300 text-red-700',
  neutral: 'bg-stone-100 border-stone-300 text-stone-700',
  thoughtful: 'bg-indigo-100 border-indigo-300 text-indigo-700',
  sad: 'bg-blue-100 border-blue-300 text-blue-700',
  stressed: 'bg-rose-100 border-rose-300 text-rose-700',
  anxious: 'bg-purple-100 border-purple-300 text-purple-700',
  confused: 'bg-violet-100 border-violet-300 text-violet-700',
  angry: 'bg-red-200 border-red-400 text-red-800',
};

export const MOOD_EMOJIS: Record<JournalMood, string> = {
  happy: '😊',
  peaceful: '😌',
  grateful: '🙏',
  excited: '🎉',
  motivated: '💪',
  neutral: '😐',
  thoughtful: '🤔',
  sad: '😢',
  stressed: '😰',
  anxious: '😟',
  confused: '😕',
  angry: '😠',
};

export const CATEGORY_ICONS: Record<JournalCategory, string> = {
  general: '📝',
  feeling: '❤️',
  experience: '🌍',
  adventure: '🗺️',
  success: '🏆',
  failure: '📚',
  gratitude: '🙏',
  goal: '🎯',
  reflection: '💭',
  dream: '✨',
  learning: '🧠',
};

// ══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD TYPES
// ══════════════════════════════════════════════════════════════════

export type UserRole = 'admin' | 'client';
export type UserStatus = 'active' | 'suspended' | 'restricted';
export type AdStatus = 'active' | 'paused' | 'scheduled' | 'expired';
export type AdType = 'banner' | 'interstitial' | 'rewarded' | 'native';
export type AdPlacement = 'reading' | 'chapter_end' | 'library' | 'home';
export type MessageType = 'general' | 'feedback' | 'support' | 'bug_report' | 'feature_request';
export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';
export type IdeaStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
export type InternalEbookCategory = 'draft' | 'ai_draft' | 'notes' | 'research' | 'future_release';

export interface AdminUser extends User {
  role: UserRole;
  status: UserStatus;
  last_active_at: string | null;
  chapters_read?: number;
  total_sessions?: number;
  total_reading_time?: number;
}

export interface Ad {
  id: number;
  name: string;
  type: AdType;
  placement: AdPlacement;
  content_url: string | null;
  image_url: string | null;
  link_url: string | null;
  cta_text: string;
  status: AdStatus;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  target_books: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface InternalEbook {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  category: InternalEbookCategory;
  status: string;
  linked_book_id: string | null;
  linked_book_title?: string;
  cover_image: string | null;
  notes: string | null;
  tags: string | null;
  version: number;
  ai_generated: number;
  ai_model: string | null;
  ai_prompt: string | null;
  created_at: string;
  updated_at: string;
  chapters?: InternalEbookChapter[];
}

export interface InternalEbookChapter {
  id: number;
  ebook_id: number;
  chapter_number: number;
  title: string;
  content: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMessage {
  id: number;
  user_id: number;
  type: MessageType;
  subject: string;
  message: string;
  status: MessageStatus;
  admin_reply: string | null;
  replied_at: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
  email?: string;
  user_name?: string;
}

export interface BookIdea {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string | null;
  theme: string | null;
  target_audience: string | null;
  additional_notes: string | null;
  status: IdeaStatus;
  admin_notes: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  email?: string;
  user_name?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBooks: number;
  internalEbooks: number;
  totalAds: number;
  activeAds: number;
  unreadMessages: number;
  pendingIdeas: number;
  totalImpressions: number;
  totalClicks: number;
}

export interface AIGeneration {
  id: number;
  type: string;
  prompt: string;
  model: string;
  result: string | null;
  status: string;
  tokens_used: number | null;
  internal_ebook_id: number | null;
  ebook_title?: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// Admin View States
export type AdminViewState = 
  | 'dashboard' 
  | 'ads' 
  | 'clients' 
  | 'ebooks' 
  | 'internal-ebooks' 
  | 'ai-generate' 
  | 'messages' 
  | 'ideas' 
  | 'analytics';
