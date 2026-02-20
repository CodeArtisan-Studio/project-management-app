'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { tokenStorage } from '@/lib/token';
import { ROUTES } from '@/constants/routes';
import type { User } from '@/types/user.types';
import type {
  AuthContextValue,
  LoginPayload,
  RegisterPayload,
} from '@/features/auth/types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didValidate = useRef(false);

  // ─── Hydrate + validate on mount ──────────────────────
  // 1. Read cached token/user from localStorage for instant UI.
  // 2. Call GET /users/me to validate the token and refresh user data.
  // 3. If the token is expired or invalid, clear everything.
  useEffect(() => {
    if (didValidate.current) return;
    didValidate.current = true;

    const storedToken = tokenStorage.getToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Optimistic: show cached user while we validate
    const cachedUser = tokenStorage.getUser();
    if (cachedUser) {
      setToken(storedToken);
      setUser(cachedUser);
    }

    userService
      .getMe()
      .then((freshUser) => {
        tokenStorage.setUser(freshUser);
        setToken(storedToken);
        setUser(freshUser);
      })
      .catch(() => {
        // Token expired or invalid — clear auth state
        tokenStorage.clear();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      const result = await authService.login(payload);
      tokenStorage.setToken(result.token);
      tokenStorage.setUser(result.user);
      setToken(result.token);
      setUser(result.user);
      router.push(ROUTES.DASHBOARD);
    },
    [router],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      const result = await authService.register(payload);
      tokenStorage.setToken(result.token);
      tokenStorage.setUser(result.user);
      setToken(result.token);
      setUser(result.user);
      router.push(ROUTES.DASHBOARD);
    },
    [router],
  );

  const logout = useCallback((): void => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  const refreshUser = useCallback(async (): Promise<void> => {
    const freshUser = await userService.getMe();
    tokenStorage.setUser(freshUser);
    setUser(freshUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
