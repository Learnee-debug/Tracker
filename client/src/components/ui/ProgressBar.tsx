import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;          // 0–100
  color?: string;         // CSS color value e.g. 'var(--green)'
  height?: 'thin' | 'normal';
  className?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  color = 'var(--green)',
  height = 'thin',
  className,
  showValue = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'bg-bg-4 rounded-sm overflow-hidden flex-1',
          height === 'thin' ? 'h-[3px]' : 'h-[5px]'
        )}
      >
        <div
          className="h-full rounded-sm transition-[width] duration-400"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {showValue && (
        <span className="font-mono text-[11px] text-text-muted w-8 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
