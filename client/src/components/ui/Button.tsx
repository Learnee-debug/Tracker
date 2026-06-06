import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-mono cursor-pointer border rounded transition-colors',
        // Size
        size === 'sm' && 'text-[10px] px-[9px] py-[5px]',
        size === 'md' && 'text-[11px] px-[14px] py-[6px]',
        size === 'lg' && 'text-[13px] px-[18px] py-[10px]',
        // Variant
        variant === 'default' && 'bg-bg-3 border-border text-text-muted hover:bg-bg-4 hover:text-text',
        variant === 'ghost'   && 'bg-transparent border-transparent text-text-muted hover:bg-bg-3 hover:text-text',
        variant === 'danger'  && 'bg-red-dim border-red/30 text-red hover:opacity-90',
        variant === 'primary' && 'bg-green border-green text-bg font-medium hover:opacity-90',
        // Width
        fullWidth && 'w-full justify-center',
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
