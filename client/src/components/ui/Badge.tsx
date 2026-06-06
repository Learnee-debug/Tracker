import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'teal' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green:   'bg-[rgba(34,201,141,.12)] text-green',
  amber:   'bg-amber-dim text-[#f5d8a0]',
  red:     'bg-red-dim text-[#f5b8b8]',
  blue:    'bg-[rgba(74,158,222,.2)] text-blue',
  purple:  'bg-[rgba(144,136,224,.12)] text-purple',
  teal:    'bg-[rgba(59,189,173,.12)] text-teal',
  default: 'bg-bg-4 text-text-muted',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'font-mono text-[10px] px-[6px] py-[2px] rounded-[3px] tracking-[.05em]',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
