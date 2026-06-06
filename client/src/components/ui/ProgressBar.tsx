import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: 'thin' | 'normal' | 'lg';
  className?: string;
  showValue?: boolean;
  animated?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  color = 'var(--green)',
  height = 'thin',
  className,
  showValue = false,
  animated = false,
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'bg-bg-4 rounded-sm overflow-hidden flex-1',
          height === 'thin'   && 'h-[3px]',
          height === 'normal' && 'h-[5px]',
          height === 'lg'     && 'h-[8px]'
        )}
      >
        <div
          className={cn(
            'h-full rounded-sm',
            animated ? 'transition-[width] duration-700 ease-out' : 'transition-[width] duration-500'
          )}
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {showValue && (
        <span className="font-mono text-[11px] text-text-muted w-8 text-right">
          {clamped}%
        </span>
      )}
      {label && (
        <span className="font-mono text-[10px] text-text-sub whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
