// ─────────────────────────────────────────────────────────────────────────────
// Auth context — manages access token, user identity, and session lifecycle.
//
// On mount: attempts a silent refresh to restore session from httpOnly cookie.
// On login/register: stores access token in memory, sets user.
// On logout: clears everything.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth';
import { setAccessToken } from '@/api/client';
import type { User } from 'shared/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;  // true only during initial session restore
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  // ── Silent session restore on mount ────────────────────────────────────────
  // Attempts to get a new access token using the httpOnly refresh cookie.
  // If it succeeds, the user is logged in without seeing a login screen.
  // If it fails (no cookie, expired), they see the login form.

  useEffect(() => {
    let cancelled = false;
    authApi.refresh()
      .then((data) => {
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        if (cancelled) return;
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const data = await authApi.register(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
