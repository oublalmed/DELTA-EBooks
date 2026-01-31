/**
 * API client for DELTA EBooks backend.
 * All server-side communication goes through this module.
 */

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('delta_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    const error = new Error(body.error || `HTTP ${res.status}`);
    (error as Error & { code?: string }).code = body.code;
    throw error;
  }

  return res.json();
}

// ── Auth ──

export async function register(email: string, password: string, name: string) {
  return request<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string) {
  return request<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function requestPasswordReset(email: string) {
  return request<{ success: boolean; devResetToken?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  return request<{ success: boolean; token?: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword }),
  });
}

export async function googleSignIn(credential: string) {
  return request<{ user: any; token: string; refreshToken?: string }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function getProfile() {
  return request<{ user: any; purchases: string[]; isAdmin: boolean; downloadCount: number }>('/auth/me');
}

export async function updateProfile(data: { name?: string; language?: string }) {
  return request<any>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Expression Space ──

export async function getExpressionEntries() {
  return request<any[]>('/expression');
}

export async function addExpressionEntry(entry: { text: string; category: string; mood?: string }) {
  return request<any>('/expression', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function deleteExpressionEntry(id: string) {
  return request<any>(`/expression/${id}`, {
    method: 'DELETE',
  });
}

// ── Journey Calendar ──

export async function getJourneyEntries() {
  return request<any[]>('/journey');
}

export async function addOrUpdateJourneyEntry(entry: any) {
  return request<any>('/journey', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function deleteJourneyEntry(date: string) {
  return request<any>(`/journey/${date}`, {
    method: 'DELETE',
  });
}

// ── Books ──

export async function getBooks() {
  return request<any[]>('/books');
}

export async function getBook(bookId: string) {
  return request<any>(`/books/${bookId}`);
}

// ── Email ──

export async function subscribe(email: string) {
  return request<{ success: boolean; message: string }>('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ══════════════════════════════════════════════════════════════════
// NEW: Enhanced Journal API
// ══════════════════════════════════════════════════════════════════

import type {
  JournalEntryInput,
  JournalEntryFull,
  JournalCalendarDay,
  JournalAnalytics,
  JournalComment,
  PremiumStatus,
  PremiumGrantRequest,
  PremiumGrantResponse,
  PremiumHistoryItem,
} from '../types';

// Get all journal entries (with optional filters)
export async function getJournalEntries(params?: {
  month?: number;
  year?: number;
  category?: string;
  mood?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.month) searchParams.set('month', String(params.month));
  if (params?.year) searchParams.set('year', String(params.year));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.mood) searchParams.set('mood', params.mood);
  
  const query = searchParams.toString();
  return request<JournalEntryFull[]>(`/journal${query ? `?${query}` : ''}`);
}

// Get calendar data for a month
export async function getJournalCalendar(year: number, month: number) {
  return request<Record<string, JournalCalendarDay[]>>(`/journal/calendar/${year}/${month}`);
}

// Get mood analytics
export async function getJournalAnalytics(period?: 'week' | 'month' | 'year') {
  const query = period ? `?period=${period}` : '';
  return request<JournalAnalytics>(`/journal/analytics${query}`);
}

// Get a specific journal entry
export async function getJournalEntry(id: number) {
  return request<JournalEntryFull>(`/journal/${id}`);
}

// Create a new journal entry
export async function createJournalEntry(entry: JournalEntryInput) {
  return request<JournalEntryFull>('/journal', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

// Update a journal entry
export async function updateJournalEntry(id: number, entry: Partial<JournalEntryInput>) {
  return request<JournalEntryFull>(`/journal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  });
}

// Delete a journal entry
export async function deleteJournalEntry(id: number) {
  return request<void>(`/journal/${id}`, {
    method: 'DELETE',
  });
}

// Get public journal feed
export async function getPublicJournalFeed(page = 1, limit = 20) {
  return request<JournalEntryFull[]>(`/journal/public/feed?page=${page}&limit=${limit}`);
}

// Toggle like on a public entry
export async function toggleJournalLike(entryId: number) {
  return request<{ liked: boolean }>(`/journal/${entryId}/like`, {
    method: 'POST',
  });
}

// Get comments for a public entry
export async function getJournalComments(entryId: number) {
  return request<JournalComment[]>(`/journal/${entryId}/comments`);
}

// Add comment to a public entry
export async function addJournalComment(entryId: number, content: string) {
  return request<JournalComment>(`/journal/${entryId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// Delete own comment
export async function deleteJournalComment(commentId: number) {
  return request<void>(`/journal/comments/${commentId}`, {
    method: 'DELETE',
  });
}

// ══════════════════════════════════════════════════════════════════
// NEW: Ad-Based Premium API
// ══════════════════════════════════════════════════════════════════

// Check premium status
export async function getPremiumStatus() {
  return request<PremiumStatus>('/premium/status');
}

// Start free trial
export async function startTrial() {
  return request<{ success: boolean; message: string; trialEnds: string }>('/premium/start-trial', {
    method: 'POST',
  });
}

// Grant premium access after watching ad
export async function grantPremiumAccess(data: PremiumGrantRequest) {
  return request<PremiumGrantResponse>('/premium/grant-access', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get premium access history
export async function getPremiumHistory() {
  return request<{ history: PremiumHistoryItem[]; logs: any[] }>('/premium/history');
}

// ══════════════════════════════════════════════════════════════════
// NEW: Unlock API (Chapters, Journal Access, PDF Downloads)
// ══════════════════════════════════════════════════════════════════

import type {
  JournalAccessStatus,
  ChapterUnlockStatus,
  PDFDownloadStatus,
} from '../types';

// ── Chapter Unlocks ──

// Get all unlocked chapters
export async function getUnlockedChapters() {
  return request<{
    freeChapters: number;
    unlocks: Record<string, number[]>;
    raw: { book_id: string; chapter_id: number; unlocked_at: string }[];
  }>('/unlocks/chapters');
}

// Check if a specific chapter is unlocked
export async function checkChapterUnlock(bookId: string, chapterId: number) {
  return request<{
    isUnlocked: boolean;
    isFree: boolean;
    chapterId: number;
    bookId: string;
    unlockedAt: string | null;
  }>(`/unlocks/chapters/${bookId}/${chapterId}`);
}

// Unlock a chapter after watching ad
export async function unlockChapter(bookId: string, chapterId: number) {
  return request<{
    success: boolean;
    message: string;
    isUnlocked: boolean;
    unlockedAt?: string;
  }>(`/unlocks/chapters/${bookId}/${chapterId}/unlock`, {
    method: 'POST',
  });
}

// ── Journal/Calendar Access ──

// Get journal access status
export async function getJournalAccessStatus() {
  return request<JournalAccessStatus>('/unlocks/journal');
}

// Unlock journal access after watching ad
export async function unlockJournalAccess() {
  return request<{
    success: boolean;
    message: string;
    accessUntil: string;
    daysRemaining: number;
  }>('/unlocks/journal/unlock', {
    method: 'POST',
  });
}

// ── PDF Download Unlocks ──

// Get PDF download status for a book
export async function getPDFDownloadStatus(bookId: string) {
  return request<PDFDownloadStatus>(`/unlocks/pdf/${bookId}`);
}

// Record an ad watched for PDF download
export async function recordPDFAdWatch(bookId: string) {
  return request<{
    success: boolean;
    message: string;
    adsWatched: number;
    adsRequired: number;
    adsRemaining: number;
    isUnlocked: boolean;
    canDownload: boolean;
  }>(`/unlocks/pdf/${bookId}/watch-ad`, {
    method: 'POST',
  });
}

// Get all PDF download statuses
export async function getAllPDFDownloadStatuses() {
  return request<{
    adsRequired: number;
    books: Record<string, PDFDownloadStatus>;
  }>('/unlocks/pdf');
}

// ══════════════════════════════════════════════════════════════════
// Legacy stubs (for Dashboard compatibility - ad-based model)
// ══════════════════════════════════════════════════════════════════

// Stub: No payment history in ad-based model
export async function getPaymentHistory() {
  return [];
}

// Stub: No download history in ad-based model
export async function getDownloadHistory() {
  return { downloadInfo: [] };
}

// Stub: Generate download token (ad-based model uses PDF unlock)
export async function generateDownloadToken(_bookId: string) {
  return { downloadUrl: '', expiresAt: '' };
}

// ══════════════════════════════════════════════════════════════════
// User Progress API (Chapter Reflections)
// ══════════════════════════════════════════════════════════════════

export interface UserProgressData {
  books: Record<string, {
    completedIds: number[];
    reflections: Record<number, string>;
  }>;
}

// Get all user progress
export async function getUserProgress() {
  return request<UserProgressData>('/progress');
}

// Get progress for a specific book
export async function getBookProgress(bookId: string) {
  return request<{
    bookId: string;
    completedIds: number[];
    reflections: Record<number, string>;
  }>(`/progress/${bookId}`);
}

// Save a chapter reflection
export async function saveChapterReflection(bookId: string, chapterId: number, reflection: string) {
  return request<{ success: boolean; message: string }>(`/progress/${bookId}/${chapterId}/reflection`, {
    method: 'POST',
    body: JSON.stringify({ reflection }),
  });
}

// Mark chapter as complete/incomplete
export async function markChapterComplete(bookId: string, chapterId: number, completed: boolean) {
  return request<{ success: boolean; message: string }>(`/progress/${bookId}/${chapterId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ completed }),
  });
}

// Export reflections (all books)
export async function exportAllReflections(format: 'json' | 'txt' | 'md' = 'json') {
  return request<{ reflections: any[] }>(`/progress/export/all?format=${format}`);
}

// Export reflections for a specific book
export async function exportBookReflections(bookId: string, format: 'json' | 'txt' | 'md' = 'json') {
  return request<{ bookId: string; reflections: any[] }>(`/progress/export/${bookId}?format=${format}`);
}
