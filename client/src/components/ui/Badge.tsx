import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'teal' | 'muted' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green:   'bg-[rgba(34,201,141,.15)] text-green',
  amber:   'bg-[rgba(240,160,48,.15)] text-amber',
  red:     'bg-[rgba(229,85,85,.15)] text-red',
  blue:    'bg-[rgba(74,158,222,.15)] text-blue',
  purple:  'bg-[rgba(144,136,224,.15)] text-purple',
  teal:    'bg-[rgba(59,189,173,.15)] text-teal',
  muted:   'bg-[rgba(136,136,128,.12)] text-text-muted',
  default: 'bg-bg-4 text-text-muted',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'font-mono rounded-[3px] inline-flex items-center whitespace-nowrap tracking-[.05em]',
        size === 'sm' && 'text-[10px] px-[6px] py-[2px]',
        size === 'md' && 'text-[11px] px-[8px] py-[3px]',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
