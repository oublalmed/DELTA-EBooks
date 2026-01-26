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
    throw new Error(body.error || `HTTP ${res.status}`);
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

export async function getProfile() {
  return request<{
    user: any;
    purchases: string[];
    purchaseDetails: any[];
    downloadCount: number;
  }>('/auth/me');
}

// ── Books ──

export async function getBooks() {
  return request<any[]>('/books');
}

export async function getBook(bookId: string) {
  return request<any>(`/books/${bookId}`);
}

// ── Payments ──

export async function createPaymentOrder(bookId: string) {
  return request<{ orderId: string; status: string }>('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ bookId }),
  });
}

export async function capturePaymentOrder(orderId: string, bookId: string) {
  return request<{ success: boolean; message: string; bookId: string }>('/payments/capture-order', {
    method: 'POST',
    body: JSON.stringify({ orderId, bookId }),
  });
}

export async function getPaymentHistory() {
  return request<any[]>('/payments/history');
}

// ── Downloads ──

export async function generateDownloadToken(bookId: string) {
  return request<{ downloadUrl: string; expiresAt: string; downloadsRemaining: number }>(
    '/downloads/generate-token',
    {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    }
  );
}

export async function getDownloadHistory() {
  return request<{ history: any[]; downloadInfo: any[] }>('/downloads/user/history');
}

// ── Email ──

export async function subscribe(email: string) {
  return request<{ success: boolean; message: string }>('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
