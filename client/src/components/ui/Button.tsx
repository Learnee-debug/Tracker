import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md';
}

const VARIANT: Record<string, string> = {
  default: 'bg-bg-3 border border-border text-text-muted hover:bg-bg-4 hover:text-text hover:border-border-2',
  primary: 'bg-green text-bg border border-green hover:opacity-90',
  ghost:   'bg-transparent border border-transparent text-text-sub hover:bg-bg-3 hover:text-text-muted',
  danger:  'bg-red-dim border border-red/20 text-red hover:opacity-90',
  success: 'bg-green-dim border border-green/20 text-green hover:opacity-90',
};

const SIZE: Record<string, string> = {
  xs: 'text-[10px] px-2 py-1 font-mono tracking-[0.04em]',
  sm: 'text-[11px] px-3 py-[5px] font-mono tracking-[0.03em]',
  md: 'text-[12px] px-4 py-[7px] font-mono tracking-[0.03em]',
};

export function Button({
  children,
  className,
  variant = 'default',
  size = 'sm',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md cursor-pointer transition-all duration-100 font-medium',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/40',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
