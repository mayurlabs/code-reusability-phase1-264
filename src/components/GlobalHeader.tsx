import { Search, Star, Plus, Home, HelpCircle, Settings, Bell, Grid3X3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function SalesforceLogo() {
  return (
    <svg width="42" height="30" viewBox="0 0 50 34" fill="none">
      <path
        d="M20.8 3.6c2.1-2.2 5-3.6 8.2-3.6 4.2 0 7.9 2.3 9.9 5.7 1.7-.8 3.6-1.2 5.5-1.2 7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2c-1.3 0-2.6-.2-3.8-.6-1.8 2.5-4.7 4.1-8 4.1-1.8 0-3.5-.5-5-1.3-1.8 3.2-5.3 5.4-9.2 5.4-4.1 0-7.7-2.3-9.4-5.8C4 33.4-.5 28.5-.5 22.6c0-4.7 2.5-8.8 6.2-11.1-.4-1.2-.6-2.5-.6-3.9C5.1 3.4 8.5 0 12.7 0c3.2 0 6 2 7.1 4.8l1-1.2z"
        fill="#00A1E0"
      />
    </svg>
  );
}

function AgentforceIcon({ size = 24 }: { size?: number }) {
  const basePath = import.meta.env.BASE_URL || '/';
  return (
    <img
      src={`${basePath}agentforce-icon.png`}
      alt="Agentforce"
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

export { AgentforceIcon };

export function GlobalHeader() {
  const { toggleAgentPanel, agentPanelOpen } = useAppContext();

  return (
    <header
      style={{
        height: 44,
        background: 'var(--sf-header-bg)',
        borderBottom: '1px solid var(--sf-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 12,
        flexShrink: 0,
      }}
    >
      <SalesforceLogo />

      <div
        style={{
          flex: 1,
          maxWidth: 480,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sf-text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Search Setup..."
          style={{
            width: '100%',
            height: 32,
            borderRadius: 4,
            border: '1px solid var(--sf-border)',
            background: '#f3f3f3',
            paddingLeft: 32,
            paddingRight: 12,
            fontSize: 13,
            color: 'var(--sf-text)',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[Star, Plus, Home, HelpCircle, Settings, Bell].map((Icon, i) => (
          <button
            key={i}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              color: 'var(--sf-text-secondary)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = '#f3f3f3')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <Icon size={16} />
          </button>
        ))}

        <button
          onClick={toggleAgentPanel}
          title="Open Agentforce"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: 'none',
            background: agentPanelOpen ? '#e1f0ff' : 'transparent',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!agentPanelOpen) e.currentTarget.style.background = '#f3f3f3';
          }}
          onMouseLeave={(e) => {
            if (!agentPanelOpen) e.currentTarget.style.background = 'transparent';
          }}
        >
          <AgentforceIcon size={22} />
        </button>

        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--sf-blue)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            marginLeft: 6,
            cursor: 'pointer',
          }}
        >
          PR
        </div>
      </div>
    </header>
  );
}

export function SetupHeader() {
  return (
    <div
      style={{
        height: 40,
        background: 'var(--sf-header-bg)',
        borderBottom: '1px solid var(--sf-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: 'var(--sf-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Grid3X3 size={14} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Setup</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <button
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--sf-blue)',
            borderBottom: '3px solid var(--sf-blue)',
            marginBottom: -1,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Home
        </button>
        <button
          style={{
            padding: '8px 16px',
            fontSize: 13,
            color: 'var(--sf-text-secondary)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Object Manager
        </button>
      </div>
    </div>
  );
}
