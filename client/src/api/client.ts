// ─────────────────────────────────────────────────────────────────────────────
// API client — base fetch wrapper.
//
// Design decisions:
//   - Access token stored in memory (this module's closure), never localStorage.
//     localStorage is readable by any script; memory is not.
//   - On 401, attempt one token refresh before failing.
//   - Throws ApiError objects so callers can handle them uniformly.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Token store — in-memory, not persisted ────────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  skipAuth?: boolean;
  _isRetry?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, skipAuth = false, _isRetry = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // send httpOnly refresh cookie
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401: attempt token refresh once ─────────────────────────────────────────
  if (response.status === 401 && !skipAuth && !_isRetry) {
    try {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return apiFetch<T>(path, { ...options, _isRetry: true });
      }
    } catch {
      // Refresh failed — fall through to throw below
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Request failed', response.status);
  }

  // Our envelope: { ok: true, data: T }
  return (data as { data: T }).data;
}

// ─── Token refresh ────────────────────────────────────────────────────────────

async function tryRefresh(): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    setAccessToken(null);
    return false;
  }

  const data = await response.json();
  const newToken = data?.data?.accessToken;
  if (newToken) {
    setAccessToken(newToken);
    return true;
  }
  return false;
}

export { tryRefresh };
