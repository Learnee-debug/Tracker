import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'hero' | 'success' | 'inset';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  noPad?: boolean;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-bg-2 border border-border rounded-md p-[14px_16px] mb-3',
  hero:    'bg-bg-2 border border-border rounded-lg p-5',
  success: 'bg-[rgba(34,201,141,.06)] border border-[rgba(34,201,141,.3)] rounded-md p-[14px_16px] mb-3',
  inset:   'bg-bg-3 border border-border rounded-md p-4',
};

export function Card({ children, className, variant = 'default', noPad = false }: CardProps) {
  return (
    <div
      className={cn(
        VARIANT_CLASSES[variant],
        noPad && '!p-0',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}

export function SectionTitle({ children, className, right }: SectionTitleProps) {
  return (
    <div
      className={cn(
        'font-mono text-[11px] text-text-sub tracking-[.1em] uppercase mb-[10px] pb-[6px] border-b border-border',
        right != null && 'flex items-center justify-between',
        className
      )}
    >
      <span>{children}</span>
      {right && <span>{right}</span>}
    </div>
  );
}
