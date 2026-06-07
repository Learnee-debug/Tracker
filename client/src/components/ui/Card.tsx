import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a colored left border accent */
  accent?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'teal';
}

const ACCENT_BORDER: Record<string, string> = {
  green:  'border-l-[2px] border-l-green',
  amber:  'border-l-[2px] border-l-amber',
  red:    'border-l-[2px] border-l-red',
  blue:   'border-l-[2px] border-l-blue',
  purple: 'border-l-[2px] border-l-purple',
  teal:   'border-l-[2px] border-l-teal',
};

export function Card({ children, className, accent }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-2 border border-border rounded-lg p-5',
        'transition-colors duration-150',
        accent && ACCENT_BORDER[accent],
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function SectionTitle({ children, className, action }: SectionTitleProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <span className="font-mono text-[10px] text-text-sub uppercase tracking-[0.09em] font-medium">
        {children}
      </span>
      {action && <div>{action}</div>}
    </div>
  );
}

/** Horizontal divider with optional label */
export function Divider({ label, className }: { label?: string; className?: string }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10px] text-text-faint uppercase tracking-[0.08em]">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }
  return <div className={cn('h-px bg-border my-4', className)} />;
}
