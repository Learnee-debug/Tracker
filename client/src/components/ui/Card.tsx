import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-2 border border-border rounded-md p-[14px_16px] mb-3',
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
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        'font-mono text-[10px] text-text-sub tracking-[.1em] uppercase mb-[10px] pb-[6px] border-b border-border',
        className
      )}
    >
      {children}
    </div>
  );
}
