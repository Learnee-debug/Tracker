import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';

interface TileProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  progress?: number;
  progressColor?: string;
  className?: string;
  size?: 'default' | 'large';
}

export function Tile({
  label,
  value,
  sub,
  color,
  progress,
  progressColor,
  className,
  size = 'default',
}: TileProps) {
  return (
    <div
      className={cn(
        'bg-bg-3 rounded-lg p-4 border border-border flex flex-col gap-1',
        'hover:border-border-2 transition-colors duration-150',
        className
      )}
    >
      <div className="font-mono text-[9px] text-text-sub uppercase tracking-[0.09em] font-medium">
        {label}
      </div>
      <div
        className={cn(
          'font-mono font-semibold leading-none mt-1',
          size === 'large' ? 'text-[32px]' : 'text-[24px]'
        )}
        style={{ color: color ?? 'var(--text)' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-text-sub mt-[2px]">{sub}</div>
      )}
      {progress !== undefined && (
        <ProgressBar
          value={progress}
          color={progressColor ?? color}
          height="xs"
          className="mt-2"
        />
      )}
    </div>
  );
}
