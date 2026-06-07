import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'teal' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm';
  className?: string;
}

const STYLES: Record<BadgeVariant, string> = {
  green:   'bg-[var(--gbg)] text-green border border-[var(--gborder)]',
  amber:   'bg-[var(--abg)] text-amber border border-[var(--aborder)]',
  red:     'bg-[var(--rbg)] text-red   border border-[var(--rborder)]',
  blue:    'bg-[var(--bbg)] text-blue  border border-[var(--bborder)]',
  purple:  'bg-[var(--pbg)] text-purple border border-[var(--pborder)]',
  teal:    'bg-[var(--tbg)] text-teal  border border-[var(--tborder)]',
  default: 'bg-bg-4 text-text-muted border border-border',
};

const SIZES: Record<string, string> = {
  xs: 'text-[9px] px-[5px] py-[2px]',
  sm: 'text-[10px] px-[7px] py-[2px]',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono rounded tracking-[0.05em] font-medium uppercase',
        STYLES[variant],
        SIZES[size],
        className
      )}
    >
      {children}
    </span>
  );
}
