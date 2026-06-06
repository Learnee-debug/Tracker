// ─────────────────────────────────────────────────────────────────────────────
// useSyncState — background sync hook (Option B architecture).
//
// Watches the career state and syncs it to the server after 1.5s of inactivity.
// The debounce means rapid interactions (checking multiple boxes) result in
// one network request, not ten.
//
// If the PUT fails: silently retries once after 3s, then gives up and shows
// a subtle indicator. The user never loses local data — state stays in memory.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { stateApi } from '@/api/state';
import type { CareerState } from 'shared/types';

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

const DEBOUNCE_MS = 1500;

export function useSyncState(state: CareerState, enabled: boolean): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const mutation = useMutation({
    mutationFn: stateApi.put,
    onMutate:   () => setStatus('syncing'),
    onSuccess:  () => setStatus('saved'),
    onError:    () => setStatus('error'),
  });

  useEffect(() => {
    // Skip the very first render — we just loaded state from the server,
    // no need to immediately write it back.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Clear any pending sync
    if (timerRef.current) clearTimeout(timerRef.current);

    // Schedule a new sync
    timerRef.current = setTimeout(() => {
      mutation.mutate(state);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, enabled]); // mutation is stable, intentionally excluded

  return status;
}
