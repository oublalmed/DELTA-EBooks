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
  return request<{ user: any; token?: string; verificationRequired?: boolean; verificationHint?: string; devVerificationCode?: string }>('/auth/register', {
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

export async function verifyEmail(email: string, code: string) {
  return request<{ success: boolean }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function resendVerification(email: string) {
  return request<{ success: boolean; devVerificationCode?: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset(email: string) {
  return request<{ success: boolean; devResetToken?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  return request<{ success: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, password: newPassword }),
  });
}

export async function googleSignIn(credential: string) {
  return request<{ user: any; token: string }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function getProfile() {
  return request<{ user: any }>('/auth/me');
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
