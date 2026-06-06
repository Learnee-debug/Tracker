import { useAuth } from '@/hooks/useAuth';
import { useCareerStore } from '@/store/careerStore';
import { getSprintDay } from '@/lib/engine';
import { formatDate } from '@/lib/utils';
import { getActiveCriticalRisks } from '@/lib/engine';
import type { SyncStatus } from '@/hooks/useSyncState';

interface HeaderProps {
  syncStatus: SyncStatus;
}

export function Header({ syncStatus }: HeaderProps) {
  const { user, logout } = useAuth();
  const { state } = useCareerStore();

  const sprintDay = getSprintDay(state.sprintStart);
  const criticals = getActiveCriticalRisks(state.risks);
  const hasCritical = criticals.length > 0;

  const activeRisks = Object.values(state.risks).filter(Boolean).length;

  return (
    <header className="flex items-center justify-between px-5 py-[9px] border-b border-border bg-bg-2 sticky top-0 z-20">
      {/* Left */}
      <div className="font-mono text-[11px] tracking-[.12em] text-text">
        SHUBHAM // CAREER OS v4
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 font-mono text-[10px] text-text-sub">
        {/* Date */}
        <span>{formatDate(new Date())}</span>

        {/* Sprint day */}
        {sprintDay ? (
          <span>
            Sprint Day{' '}
            <span className="text-amber font-medium">{sprintDay}/60</span>
          </span>
        ) : (
          <span className="text-text-sub">No sprint set</span>
        )}

        {/* Risk indicator */}
        {hasCritical ? (
          <span className="px-2 py-[2px] rounded-[3px] bg-red-dim text-[#f5b8b8] text-[10px]">
            CRITICAL
          </span>
        ) : activeRisks > 0 ? (
          <span className="px-2 py-[2px] rounded-[3px] bg-amber-dim text-[#f5d8a0] text-[10px]">
            {activeRisks} RISK{activeRisks > 1 ? 'S' : ''}
          </span>
        ) : (
          <span className="px-2 py-[2px] rounded-[3px] bg-green-dim text-[#b8f5e0] text-[10px]">
            CLEAR
          </span>
        )}

        {/* Sync status */}
        <span className="text-text-sub text-[10px]" title="Sync status">
          {syncStatus === 'syncing' && '↻'}
          {syncStatus === 'saved'   && '✓'}
          {syncStatus === 'error'   && '⚠'}
        </span>

        {/* User + logout */}
        {user && (
          <button
            onClick={logout}
            className="text-text-sub hover:text-text transition-colors cursor-pointer bg-none border-none"
          >
            {user.email.split('@')[0]} ⏻
          </button>
        )}
      </div>
    </header>
  );
}
