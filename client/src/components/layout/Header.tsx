import { useAuth } from '@/hooks/useAuth';
import { useCareerStore } from '@/store/careerStore';
import { getSprintDay, getActiveCriticalRisks } from '@/lib/engine';
import type { SyncStatus } from '@/hooks/useSyncState';

interface HeaderProps { syncStatus: SyncStatus; }

const SYNC_ICON: Record<SyncStatus, string> = {
  idle:    '',
  syncing: '↻',
  saved:   '✓',
  error:   '!',
};

const SYNC_COLOR: Record<SyncStatus, string> = {
  idle:    'text-text-faint',
  syncing: 'text-text-sub animate-spin',
  saved:   'text-green',
  error:   'text-red',
};

export function Header({ syncStatus }: HeaderProps) {
  const { user, logout } = useAuth();
  const { state } = useCareerStore();

  const sprintDay   = getSprintDay(state.sprintStart);
  const criticals   = getActiveCriticalRisks(state.risks);
  const totalRisks  = Object.values(state.risks).filter(Boolean).length;

  return (
    <header className="h-11 flex items-center justify-between px-5 border-b border-border bg-bg-2 sticky top-0 z-20">
      {/* Left — wordmark */}
      <div className="font-mono text-[11px] text-text font-medium tracking-[0.1em] select-none">
        CAREER OS
      </div>

      {/* Right — contextual info */}
      <div className="flex items-center gap-4">
        {/* Sprint day */}
        {sprintDay ? (
          <span className="font-mono text-[11px] text-text-sub">
            Day <span className="text-amber font-medium">{sprintDay}</span>/60
          </span>
        ) : (
          <span className="font-mono text-[11px] text-text-faint">No sprint</span>
        )}

        {/* Risk pill */}
        {criticals.length > 0 ? (
          <span className="font-mono text-[9px] px-2 py-[3px] rounded bg-[var(--rbg)] text-red border border-[var(--rborder)] uppercase tracking-[0.06em]">
            {criticals.length} critical
          </span>
        ) : totalRisks > 0 ? (
          <span className="font-mono text-[9px] px-2 py-[3px] rounded bg-[var(--abg)] text-amber border border-[var(--aborder)] uppercase tracking-[0.06em]">
            {totalRisks} risk{totalRisks > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="font-mono text-[9px] px-2 py-[3px] rounded bg-[var(--gbg)] text-green border border-[var(--gborder)] uppercase tracking-[0.06em]">
            clear
          </span>
        )}

        {/* Sync dot */}
        {syncStatus !== 'idle' && (
          <span className={`font-mono text-[11px] ${SYNC_COLOR[syncStatus]}`} title={syncStatus}>
            {SYNC_ICON[syncStatus]}
          </span>
        )}

        {/* User */}
        {user && (
          <button
            onClick={logout}
            className="font-mono text-[11px] text-text-sub hover:text-text transition-colors cursor-pointer bg-transparent border-0"
            title="Sign out"
          >
            {user.email.split('@')[0]}
          </button>
        )}
      </div>
    </header>
  );
}
