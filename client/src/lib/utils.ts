// ─── escHtml ──────────────────────────────────────────────────────────────────
// Escapes user-supplied strings before inserting into innerHTML.
// Needed anywhere pipeline/company data is rendered.
// When React renders via JSX, it escapes automatically — this is only needed
// for the rare case of manual innerHTML usage.

export function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── cn ───────────────────────────────────────────────────────────────────────
// Lightweight className combiner — no external dependency needed.
// Only handles strings and conditionals; that's all we need.

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── clamp ────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ─── formatDate ───────────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ─── generateId ───────────────────────────────────────────────────────────────
// Simple unique ID for pipeline entries. Not cryptographically secure —
// we just need uniqueness within a single user's session.

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
