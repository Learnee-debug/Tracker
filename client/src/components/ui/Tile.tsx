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
}

export function Tile({
  label,
  value,
  sub,
  color = 'var(--text)',
  progress,
  progressColor,
  className,
}: TileProps) {
  return (
    <div className={cn('bg-bg-3 rounded px-3 py-[10px]', className)}>
      <div className="text-[10px] text-text-sub uppercase tracking-[.07em] mb-[3px]">
        {label}
      </div>
      <div
        className="font-mono text-[21px] font-medium leading-none"
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
          className="mt-[6px]"
        />
      )}
    </div>
  );
}
