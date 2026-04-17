import { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext.tsx';

interface NavChild {
  id: string;
  label: string;
}

interface NavSection {
  id: string;
  label: string;
  defaultOpen: boolean;
  children: NavChild[];
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'environments', label: 'Environments', defaultOpen: false, children: [] },
  { id: 'development', label: 'Development', defaultOpen: false, children: [] },
  { id: 'integrations', label: 'Integrations', defaultOpen: false, children: [] },
  {
    id: 'performance',
    label: 'Performance',
    defaultOpen: true,
    children: [
      { id: 'scale-center', label: 'Scale Center' },
      { id: 'scale-insights', label: 'Scale Insights' },
      { id: 'scale-test', label: 'Scale Test' },
    ],
  },
  {
    id: 'code-intelligence',
    label: 'Code Intelligence',
    defaultOpen: true,
    children: [
      { id: 'apex-guru', label: 'ApexGuru' },
      { id: 'code-reusability', label: 'Code Reusability' },
      { id: 'code-modernisation', label: 'Code Modernisation' },
    ],
  },
];

export function LeftNav() {
  const { activePage, setActivePage } = useAppContext();
  const [filter, setFilter] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const s of NAV_SECTIONS) {
        initial[s.id] = s.defaultOpen;
      }
      return initial;
    },
  );

  const filteredSections = useMemo(() => {
    if (!filter.trim()) return NAV_SECTIONS;

    const q = filter.toLowerCase();
    return NAV_SECTIONS.map((section) => {
      const labelMatch = section.label.toLowerCase().includes(q);
      const matchingChildren = section.children.filter((c) =>
        c.label.toLowerCase().includes(q),
      );

      if (labelMatch || matchingChildren.length > 0) {
        return {
          ...section,
          children: labelMatch ? section.children : matchingChildren,
        };
      }
      return null;
    }).filter(Boolean) as NavSection[];
  }, [filter]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav
      style={{
        width: 220,
        minWidth: 220,
        background: 'var(--sf-header-bg)',
        borderRight: '1px solid var(--sf-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--sf-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Quick Find"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              height: 28,
              borderRadius: 4,
              border: '1px solid var(--sf-border)',
              paddingLeft: 28,
              paddingRight: 8,
              fontSize: 12,
              outline: 'none',
              background: '#fafafa',
            }}
          />
        </div>
      </div>

      <div
        style={{
          padding: '6px 16px',
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--sf-text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        PLATFORM TOOLS
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {filteredSections.map((section) => {
          const isOpen =
            filter.trim() ? true : (openSections[section.id] ?? false);
          const hasChildren = section.children.length > 0;

          return (
            <div key={section.id}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleSection(section.id);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '7px 12px 7px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--sf-text)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#f9f9f9')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                {hasChildren ? (
                  isOpen ? (
                    <ChevronDown size={14} color="var(--sf-text-muted)" />
                  ) : (
                    <ChevronRight size={14} color="var(--sf-text-muted)" />
                  )
                ) : (
                  <ChevronRight size={14} color="var(--sf-text-muted)" />
                )}
                {section.label}
              </button>

              {isOpen &&
                section.children.map((child) => {
                  const isActive = activePage === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setActivePage(child.id)}
                      style={{
                        width: '100%',
                        display: 'block',
                        padding: '6px 12px 6px 36px',
                        fontSize: 13,
                        color: isActive
                          ? 'var(--sf-blue)'
                          : 'var(--sf-text)',
                        fontWeight: isActive ? 600 : 400,
                        textAlign: 'left',
                        background: isActive
                          ? 'var(--sf-nav-active-bg)'
                          : 'transparent',
                        borderLeft: isActive
                          ? '3px solid var(--sf-blue)'
                          : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = '#f9f9f9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {child.label}
                    </button>
                  );
                })}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--sf-border)',
          fontSize: 9,
          color: '#b0b0b0',
          lineHeight: 1.5,
          marginTop: 'auto',
          flexShrink: 0,
        }}
      >
        Created by Mayuresh Verma
        <br />
        Sr. Product Manager — Scale
        <br />
        Mar 2026
      </div>
    </nav>
  );
}
