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
  size?: 'sm' | 'lg';
  glow?: boolean;
}

export function Tile({
  label,
  value,
  sub,
  color = 'var(--text)',
  progress,
  progressColor,
  className,
  size = 'sm',
  glow = false,
}: TileProps) {
  return (
    <div
      className={cn(
        'bg-bg-3 rounded',
        size === 'sm' && 'px-3 py-[10px]',
        size === 'lg' && 'px-4 py-[14px]',
        className
      )}
      style={glow ? { boxShadow: 'var(--glow-green)' } : undefined}
    >
      <div className="text-[10px] text-text-sub uppercase tracking-[.07em] mb-[3px]">
        {label}
      </div>
      <div
        className={cn(
          'font-mono font-medium leading-none',
          size === 'sm' && 'text-[21px]',
          size === 'lg' && 'text-[26px]'
        )}
        style={{ color }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-text-sub mt-[2px]">{sub}</div>
      )}
      {progress !== undefined && (
        <ProgressBar
          value={progress}
          color={progressColor ?? color}
          height="thin"
          animated
          className="mt-[6px]"
        />
      )}
    </div>
  );
}
