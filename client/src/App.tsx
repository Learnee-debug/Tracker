import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCareerStore, useCareerActions, CareerStoreProvider } from '@/store/careerStore';
import { useSyncState } from '@/hooks/useSyncState';
import { stateApi } from '@/api/state';
import { Header } from '@/components/layout/Header';
import { Tabs, type TabId } from '@/components/layout/Tabs';
import { AuthPage } from '@/features/auth/AuthPage';
import { Today }    from '@/features/today/Today';
import { Calendar } from '@/features/calendar/Calendar';
import { Risk }     from '@/features/risk/Risk';
import { Verify }   from '@/features/verify/Verify';
import { HireOnyx } from '@/features/hireonyx/HireOnyx';
import { Matrix }   from '@/features/matrix/Matrix';
import { Weekly }   from '@/features/weekly/Weekly';
import { Score }    from '@/features/score/Score';

// ─── Inner app — rendered only when authenticated ─────────────────────────────

const VALID_TABS: TabId[] = ['today', 'calendar', 'risk', 'verify', 'hireonyx', 'matrix', 'weekly', 'score'];

function readStoredTab(): TabId {
  try {
    const stored = localStorage.getItem('career-os-tab') as TabId | null;
    return stored && VALID_TABS.includes(stored) ? stored : 'today';
  } catch {
    return 'today';
  }
}

function AppInner() {
  const { state }      = useCareerStore();
  const { loadState, resetNNIfNewDay } = useCareerActions();
  const [tab, setTab]  = useState<TabId>(readStoredTab);

  function handleTabChange(id: TabId) {
    setTab(id);
    try { localStorage.setItem('career-os-tab', id); } catch {}
  }

  // ── Load state from server on mount ─────────────────────────────────────────
  // React Query v5 removed onSuccess — use useEffect watching the data instead.
  const { data: serverState, isLoading: stateLoading } = useQuery({
    queryKey:  ['career-state'],
    queryFn:   stateApi.get,
    staleTime: Infinity,            // never auto-refetch — we own the state
    gcTime:    Infinity,
  });

  useEffect(() => {
    if (serverState) {
      loadState(serverState);
      resetNNIfNewDay();
    }
  }, [serverState, loadState, resetNNIfNewDay]);

  // ── Background sync ──────────────────────────────────────────────────────────
  const syncStatus = useSyncState(state, !stateLoading);

  if (stateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="font-mono text-[11px] text-text-sub tracking-[.1em]">LOADING...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header syncStatus={syncStatus} />
      <Tabs active={tab} onChange={handleTabChange} />
      <main className="flex-1 px-8 py-6 max-w-[1440px] mx-auto w-full">
        {tab === 'today'    && <Today />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'risk'     && <Risk />}
        {tab === 'verify'   && <Verify />}
        {tab === 'hireonyx' && <HireOnyx />}
        {tab === 'matrix'   && <Matrix />}
        {tab === 'weekly'   && <Weekly />}
        {tab === 'score'    && <Score />}
      </main>
    </div>
  );
}

// ─── Root app — handles auth gate ─────────────────────────────────────────────

export function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="font-mono text-[11px] text-text-sub tracking-[.1em]">CAREER OS</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <CareerStoreProvider>
      <AppInner />
    </CareerStoreProvider>
  );
}
