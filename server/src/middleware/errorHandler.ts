import { Request, Response, NextFunction } from 'express';

// Centralized error handler. Must be registered last in Express middleware chain.
// Any route/middleware that calls next(err) lands here.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = (err as { status?: number }).status ?? 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error('[error]', err);
  }

  res.status(status).json({ ok: false, error: message });
}
