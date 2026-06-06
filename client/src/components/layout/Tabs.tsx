import { cn } from '@/lib/utils';

export type TabId = 'today' | 'calendar' | 'risk' | 'verify' | 'hireonyx' | 'matrix' | 'weekly' | 'score';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'today',    label: '▣ Today'    },
  { id: 'calendar', label: '◫ Calendar' },
  { id: 'risk',     label: '⚠ Risk'    },
  { id: 'verify',   label: '✓ Verify'  },
  { id: 'hireonyx', label: '⬡ HireOnyx'},
  { id: 'matrix',   label: '⊞ Matrix'  },
  { id: 'weekly',   label: '↻ Weekly'  },
  { id: 'score',    label: '▲ Score'   },
];

interface TabsProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="flex border-b border-border bg-bg-2 px-5 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'border-none border-b-2 bg-none font-mono text-[10px] tracking-[.05em] px-3 py-[9px] cursor-pointer transition-colors whitespace-nowrap',
            active === tab.id
              ? 'text-text border-b-green'
              : 'text-text-sub border-b-transparent hover:text-text-muted'
          )}
          style={{
            borderBottom: active === tab.id ? '2px solid var(--green)' : '2px solid transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
