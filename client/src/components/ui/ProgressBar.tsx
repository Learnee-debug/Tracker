import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;           // 0–100
  color?: string;
  height?: 'xs' | 'sm' | 'md';
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

const HEIGHT = { xs: 'h-[2px]', sm: 'h-[3px]', md: 'h-[5px]' };

export function ProgressBar({
  value,
  color = 'var(--green)',
  height = 'sm',
  className,
  showLabel = false,
  animated = false,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-bg-4 rounded-full overflow-hidden', HEIGHT[height])}>
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', animated && 'animate-pulse')}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-[10px] text-text-sub w-7 text-right shrink-0">
          {pct}%
        </span>
      )}
    </div>
  );
}
