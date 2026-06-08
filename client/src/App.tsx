import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCareerStore, useCareerActions, CareerStoreProvider } from '@/store/careerStore';
import { useSyncState } from '@/hooks/useSyncState';
import { stateApi } from '@/api/state';
import { Header } from '@/components/layout/Header';
import { Tabs, type TabId } from '@/components/layout/Tabs';
import { AuthPage } from '@/features/auth/AuthPage';
import { Now }    from '@/features/now/Now';
import { Build }  from '@/features/build/Build';
import { Review } from '@/features/review/Review';

// ─── Inner app — rendered only when authenticated ─────────────────────────────

const VALID_TABS: TabId[] = ['now', 'build', 'review'];

function readStoredTab(): TabId {
  try {
    const stored = localStorage.getItem('career-os-tab') as TabId | null;
    return stored && VALID_TABS.includes(stored) ? stored : 'now';
  } catch {
    return 'now';
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

  const { data: serverState, isLoading: stateLoading } = useQuery({
    queryKey:  ['career-state'],
    queryFn:   stateApi.get,
    staleTime: Infinity,
    gcTime:    Infinity,
  });

  useEffect(() => {
    if (serverState) {
      loadState(serverState);
      resetNNIfNewDay();
    }
  }, [serverState, loadState, resetNNIfNewDay]);

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
      <main className="flex-1 max-w-[1120px] mx-auto w-full px-5 md:px-8 py-6 pb-28">
        {tab === 'now'    && <Now />}
        {tab === 'build'  && <Build />}
        {tab === 'review' && <Review />}
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
