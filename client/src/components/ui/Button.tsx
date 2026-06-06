import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-mono cursor-pointer border rounded transition-colors',
        // Size
        size === 'sm' && 'text-[10px] px-[9px] py-[3px]',
        size === 'md' && 'text-[11px] px-[14px] py-[6px]',
        // Variant
        variant === 'default' && 'bg-bg-3 border-border text-text-muted hover:bg-bg-4 hover:text-text',
        variant === 'ghost'   && 'bg-transparent border-transparent text-text-muted hover:bg-bg-3 hover:text-text',
        variant === 'danger'  && 'bg-red-dim border-red/30 text-red hover:opacity-90',
        // Disabled
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
