import { cn } from '@/lib/utils';

export type TabId = 'today' | 'calendar' | 'risk' | 'verify' | 'hireonyx' | 'matrix' | 'weekly' | 'score';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'today',    label: 'Today'    },
  { id: 'calendar', label: 'Calendar' },
  { id: 'risk',     label: 'Risk'     },
  { id: 'verify',   label: 'Verify'   },
  { id: 'hireonyx', label: 'HireOnyx' },
  { id: 'matrix',   label: 'Matrix'   },
  { id: 'weekly',   label: 'Weekly'   },
  { id: 'score',    label: 'Score'    },
];

interface TabsProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="tabs-nav flex border-b border-border bg-bg-2 px-5 overflow-x-auto scrollbar-none">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'border-none bg-none font-mono text-[11px] tracking-[.05em] px-4 py-[11px] cursor-pointer transition-colors whitespace-nowrap flex-shrink-0',
            active === tab.id
              ? 'text-text'
              : 'text-text-sub hover:text-text-muted'
          )}
          style={{
            borderBottom: active === tab.id ? '3px solid var(--green)' : '3px solid transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
