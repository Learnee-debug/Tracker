import { apiFetch } from './client';
import type { AuthResponse } from '@/types';

export const authApi = {
  register: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),

  refresh: () =>
    apiFetch<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      skipAuth: true,
    }),

  logout: () =>
    apiFetch<null>('/api/auth/logout', { method: 'POST' }),
};
