// ─── cn ───────────────────────────────────────────────────────────────────────
// Lightweight className combiner — no external dependency needed.
// Only handles strings and conditionals; that's all we need.

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── generateId ───────────────────────────────────────────────────────────────
// Simple unique ID for pipeline entries. Not cryptographically secure —
// we just need uniqueness within a single user's session.

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
