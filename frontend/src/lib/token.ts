import type { User } from '@/types/user.types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
// Cookie name read by Next.js middleware for server-side route protection.
// Not httpOnly — the middleware signal only; token is not relayed to the backend from the cookie.
const COOKIE_NAME = 'auth_token';

function setCookie(name: string, value: string, days: number = 1): void {
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
}

// ─── Token Storage ────────────────────────────────────────
// Persists JWT in localStorage (for Axios) and a same-site cookie
// (for Next.js middleware route protection).
// Guards for SSR (window/document are undefined on the server).
export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(COOKIE_NAME, token, 1); // 1 day — matches backend JWT expiry default
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    removeCookie(COOKIE_NAME);
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    removeCookie(COOKIE_NAME);
  },
};
