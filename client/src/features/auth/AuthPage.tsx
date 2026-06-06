import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode]       = useState<Mode>('login');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email    = emailRef.current?.value.trim() ?? '';
    const password = passwordRef.current?.value ?? '';
    if (!email || !password) return;

    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="font-mono text-[11px] tracking-[.12em] text-text mb-8 text-center">
          SHUBHAM // CAREER OS v4
        </div>

        {/* Card */}
        <div className="bg-bg-2 border border-border rounded-md p-7">
          <div className="font-mono text-[10px] text-text-sub uppercase tracking-[.1em] mb-5">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-[10px] text-text-muted mb-1 tracking-[.06em]">
                EMAIL
              </label>
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                required
                className="w-full bg-bg-3 border border-border rounded px-3 py-[10px] text-text font-mono text-[11px] outline-none focus:border-border-2"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-text-muted mb-1 tracking-[.06em]">
                PASSWORD
              </label>
              <input
                ref={passwordRef}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                className="w-full bg-bg-3 border border-border rounded px-3 py-[10px] text-text font-mono text-[11px] outline-none focus:border-border-2"
              />
              {mode === 'register' && (
                <div className="text-[10px] text-text-sub mt-1 font-mono">
                  Minimum 8 characters
                </div>
              )}
            </div>

            {error && (
              <div className="text-[11px] text-red font-mono border-l-4 border-red pl-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
              className="mt-1"
            >
              {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-4 text-center font-mono text-[10px] text-text-sub">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-green hover:underline bg-none border-none cursor-pointer"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-green hover:underline bg-none border-none cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
