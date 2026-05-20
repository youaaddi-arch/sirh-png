/* Client HTTP avec fallback automatique sur mock API si le back n'est pas joignable */
import { mockApi } from './mock/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK = !BASE_URL || BASE_URL.includes('placeholder');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sirh.token');
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
  // Mock direct si on est en mode démo
  if (USE_MOCK) {
    try {
      return mockApi(method, path, body) as T;
    } catch (e: any) {
      throw new Error(e.message || 'Erreur mock API');
    }
  }

  try {
    const res = await fetch(BASE_URL + path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    });
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sirh.token');
        localStorage.removeItem('sirh.user');
        window.location.href = '/login';
      }
      throw new Error('Non authentifié');
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = data?.message || res.statusText;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
    return data as T;
  } catch (e: any) {
    // Fallback automatique sur mock si le réseau échoue
    if (e.message?.includes('fetch') || e.message?.includes('Failed') || e.name === 'TypeError') {
      try { return mockApi(method, path, body) as T; } catch {}
    }
    throw e;
  }
}

export const api = {
  get:  <T = any>(p: string) => request<T>('GET', p),
  post: <T = any>(p: string, body?: any) => request<T>('POST', p, body),
  patch:<T = any>(p: string, body?: any) => request<T>('PATCH', p, body),
  del:  <T = any>(p: string) => request<T>('DELETE', p),
};
