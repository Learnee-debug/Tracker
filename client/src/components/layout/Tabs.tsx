import { cn } from '@/lib/utils';

export type TabId = 'today' | 'calendar' | 'risk' | 'verify' | 'hireonyx' | 'matrix' | 'weekly' | 'score';

interface Tab { id: TabId; label: string; }

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

interface TabsProps { active: TabId; onChange: (id: TabId) => void; }

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="flex border-b border-border bg-bg-2 px-6 overflow-x-auto shrink-0">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-3 text-[13px] font-medium whitespace-nowrap cursor-pointer',
              'bg-transparent border-0 transition-colors duration-100',
              isActive ? 'text-text' : 'text-text-sub hover:text-text-muted'
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green rounded-t-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
