import { cn } from '@/lib/utils';

export type TabId = 'now' | 'build' | 'review';

interface Tab {
  id: TabId;
  label: string;
  activeColor: string;
}

const TABS: Tab[] = [
  { id: 'now',    label: 'NOW',    activeColor: 'var(--green)'  },
  { id: 'build',  label: 'BUILD',  activeColor: 'var(--amber)'  },
  { id: 'review', label: 'REVIEW', activeColor: 'var(--purple)' },
];

interface TabsProps { active: TabId; onChange: (id: TabId) => void; }

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="flex border-b border-border bg-bg-2 px-2 shrink-0">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-5 py-[11px] font-mono text-[10px] uppercase tracking-[.08em] font-medium whitespace-nowrap cursor-pointer',
              'bg-transparent border-0 transition-colors duration-100',
              isActive ? 'text-text' : 'text-text-sub hover:text-text-muted'
            )}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                style={{ background: tab.activeColor }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
