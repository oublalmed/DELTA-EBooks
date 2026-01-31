/**
 * Admin API client for DELTA EBooks admin dashboard.
 * All admin routes require admin authentication.
 */

import type {
  Ad,
  AdminUser,
  InternalEbook,
  ClientMessage,
  BookIdea,
  DashboardStats,
  AIGeneration,
} from '../types';

const API_BASE = '/api/admin';

function getToken(): string | null {
  return localStorage.getItem('delta_token');
}

async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    if (res.status === 403) {
      throw new Error('Admin access required');
    }
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════

export async function getDashboardData() {
  return adminRequest<{
    stats: DashboardStats;
    recentUsers: AdminUser[];
    recentMessages: ClientMessage[];
    recentIdeas: BookIdea[];
  }>('/dashboard');
}

// ══════════════════════════════════════════════════════════════════
// ADS MANAGEMENT
// ══════════════════════════════════════════════════════════════════

export async function getAds(filters?: { status?: string; type?: string; placement?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.placement) params.set('placement', filters.placement);
  const query = params.toString();
  return adminRequest<Ad[]>(`/ads${query ? `?${query}` : ''}`);
}

export async function getAd(id: number) {
  return adminRequest<Ad & { impressionStats: any[]; clickStats: any[] }>(`/ads/${id}`);
}

export async function createAd(ad: Partial<Ad>) {
  return adminRequest<Ad>('/ads', {
    method: 'POST',
    body: JSON.stringify(ad),
  });
}

export async function updateAd(id: number, ad: Partial<Ad>) {
  return adminRequest<Ad>(`/ads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ad),
  });
}

export async function deleteAd(id: number) {
  return adminRequest<{ success: boolean }>(`/ads/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleAdStatus(id: number) {
  return adminRequest<{ id: number; status: string }>(`/ads/${id}/toggle`, {
    method: 'POST',
  });
}

// ══════════════════════════════════════════════════════════════════
// CLIENT MANAGEMENT
// ══════════════════════════════════════════════════════════════════

export async function getClients(filters?: { status?: string; search?: string; sort?: string; order?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.order) params.set('order', filters.order);
  const query = params.toString();
  return adminRequest<AdminUser[]>(`/clients${query ? `?${query}` : ''}`);
}

export async function getClient(id: number) {
  return adminRequest<AdminUser & {
    readingProgress: any[];
    sessions: any[];
    activity: any[];
    messages: ClientMessage[];
    ideas: BookIdea[];
  }>(`/clients/${id}`);
}

export async function updateClientStatus(id: number, status: string) {
  return adminRequest<{ success: boolean; status: string }>(`/clients/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ══════════════════════════════════════════════════════════════════
// EBOOK MANAGEMENT
// ══════════════════════════════════════════════════════════════════

export async function getEbooks() {
  return adminRequest<any[]>('/ebooks');
}

// ══════════════════════════════════════════════════════════════════
// INTERNAL EBOOKS (Admin-Only)
// ══════════════════════════════════════════════════════════════════

export async function getInternalEbooks(filters?: { category?: string; status?: string; linked?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.linked) params.set('linked', filters.linked);
  const query = params.toString();
  return adminRequest<InternalEbook[]>(`/internal-ebooks${query ? `?${query}` : ''}`);
}

export async function getInternalEbook(id: number) {
  return adminRequest<InternalEbook>(`/internal-ebooks/${id}`);
}

export async function createInternalEbook(ebook: Partial<InternalEbook>) {
  return adminRequest<InternalEbook>('/internal-ebooks', {
    method: 'POST',
    body: JSON.stringify(ebook),
  });
}

export async function updateInternalEbook(id: number, ebook: Partial<InternalEbook>) {
  return adminRequest<InternalEbook>(`/internal-ebooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ebook),
  });
}

export async function deleteInternalEbook(id: number) {
  return adminRequest<{ success: boolean }>(`/internal-ebooks/${id}`, {
    method: 'DELETE',
  });
}

export async function addInternalEbookChapter(ebookId: number, chapter: any) {
  return adminRequest<any>(`/internal-ebooks/${ebookId}/chapters`, {
    method: 'POST',
    body: JSON.stringify(chapter),
  });
}

// ══════════════════════════════════════════════════════════════════
// MESSAGES & IDEAS
// ══════════════════════════════════════════════════════════════════

export async function getMessages(filters?: { status?: string; type?: string; priority?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.priority) params.set('priority', filters.priority);
  const query = params.toString();
  return adminRequest<ClientMessage[]>(`/messages${query ? `?${query}` : ''}`);
}

export async function getMessage(id: number) {
  return adminRequest<ClientMessage>(`/messages/${id}`);
}

export async function replyToMessage(id: number, reply: string) {
  return adminRequest<ClientMessage>(`/messages/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  });
}

export async function updateMessage(id: number, data: { status?: string; priority?: string }) {
  return adminRequest<ClientMessage>(`/messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMessage(id: number) {
  return adminRequest<{ success: boolean }>(`/messages/${id}`, {
    method: 'DELETE',
  });
}

export async function getIdeas(filters?: { status?: string; priority?: number }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', String(filters.priority));
  const query = params.toString();
  return adminRequest<BookIdea[]>(`/ideas${query ? `?${query}` : ''}`);
}

export async function updateIdea(id: number, data: { status?: string; priority?: number; admin_notes?: string }) {
  return adminRequest<BookIdea>(`/ideas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteIdea(id: number) {
  return adminRequest<{ success: boolean }>(`/ideas/${id}`, {
    method: 'DELETE',
  });
}

// ══════════════════════════════════════════════════════════════════
// AI GENERATION
// ══════════════════════════════════════════════════════════════════

export async function getAIGenerations() {
  return adminRequest<AIGeneration[]>('/ai-generations');
}

export async function generateEbook(data: {
  title: string;
  topic: string;
  chapters?: number;
  style?: string;
  target_audience?: string;
  linked_book_id?: string;
}) {
  return adminRequest<{
    success: boolean;
    generation_id: number;
    internal_ebook_id: number;
    title: string;
    chapters_generated: number;
  }>('/ai/ebook', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function generateChapter(data: {
  internal_ebook_id?: number;
  chapter_number?: number;
  topic: string;
  style?: string;
  word_count?: number;
}) {
  return adminRequest<{
    success: boolean;
    content: string;
    word_count: number;
  }>('/ai/chapter', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function improveContent(data: { content: string; instruction?: string }) {
  return adminRequest<{
    success: boolean;
    original: string;
    improved: string;
    word_count: number;
  }>('/ai/improve', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function generateOutline(data: {
  title?: string;
  topic: string;
  chapters?: number;
  style?: string;
}) {
  return adminRequest<{
    success: boolean;
    outline: any;
  }>('/ai/outline', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ══════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════

export async function getAnalytics(days = 30) {
  return adminRequest<{
    userStats: { date: string; new_users: number }[];
    readingStats: { date: string; sessions: number; total_time: number }[];
    adStats: { date: string; impressions: number }[];
    topBooks: { id: string; title: string; reads: number }[];
  }>(`/analytics?days=${days}`);
}
