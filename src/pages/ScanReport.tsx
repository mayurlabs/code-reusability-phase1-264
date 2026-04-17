import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { scanReports, clusters, scoreHistory } from '../data/mockData';
import type { Cluster } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { InfoTooltip, TIP } from '../components/InfoTooltip';
import { ScoreBreakdown } from '../components/ScoreBreakdown';

interface ScanReportProps {
  reportId: string;
  onBack: () => void;
}

const FRIENDLY_NAMES: Record<string, string> = {
  'Pricing Rules Calculator Variants': 'Pricing and Discount Logic',
  'Address Validation Service Family': 'Address Validation',
  'Legacy Lead Scoring Utilities': 'Lead Scoring',
  'Quote Sync REST Wrapper Patterns': 'Quote Sync Wrappers',
  'Renewal Date Normalization Helpers': 'Renewal Date Helpers',
  'Opportunity Territory Assignment Logic': 'Territory Assignment',
  'Invoice Tax Computation Methods': 'Invoice Tax Calculation',
  'Case Escalation Trigger Branches': 'Case Escalation Logic',
  'Sales Forecast Rollup Utilities': 'Sales Forecast Rollups',
  'Discount Approval Threshold Evaluators': 'Discount Approval Logic',
};

const FRIENDLY_RECOMMENDATIONS: Record<string, string> = {
  Standardize: 'Designate as preferred standard',
  Review: 'Review before taking action',
  Consolidate: 'Consolidate after caller review',
  'Retire Variant': 'Review for retirement after migration',
  Monitor: 'Monitor — no action needed yet',
};

const PRIORITY_COLORS: Record<string, string> = {
  High: '#ea001e',
  Medium: '#fe9339',
  Low: '#2e844a',
};

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2, 'N/A': 3 };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function extractLinesNumber(reduction: string): string {
  const match = reduction.match(/~?(\d[\d,]*)\s*lines/);
  return match ? match[1] : reduction;
}

function formatInvocations(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function SkeletonBlock({ height, width }: { height: number; width?: string }) {
  return (
    <div
      style={{
        height,
        width: width || '100%',
        borderRadius: 6,
        background:
          'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--sf-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  marginBottom: 4,
};

const metaValueStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--sf-text)',
};

function DependencyGraph({ cluster }: { cluster: Cluster }) {
  const membersWithDeps = cluster.members.filter(m => m.dependencies?.details?.length);
  if (membersWithDeps.length === 0) return null;

  const allInbound = new Map<string, { type: string; status: string }>();
  const allOutbound = new Map<string, { type: string; status: string }>();

  membersWithDeps.forEach(m => {
    m.dependencies.details?.forEach(dep => {
      if (dep.direction === 'Inbound') {
        allInbound.set(dep.name, { type: dep.type, status: dep.status });
      } else {
        allOutbound.set(dep.name, { type: dep.type, status: dep.status });
      }
    });
  });

  const preferred = cluster.members.find(m => m.badge === 'Preferred');
  const others = cluster.members.filter(m => m.badge !== 'Preferred');

  const statusDotColor = (status: string) => {
    switch (status) {
      case 'Active': return '#2e844a';
      case 'Low Usage': return '#fe9339';
      case 'Legacy': return '#ea001e';
      default: return '#969492';
    }
  };

  return (
    <div style={{ border: '1px solid #e0e6ed', borderRadius: 8, padding: 20, marginBottom: 16 }}>
      <div style={{ ...labelStyle, marginBottom: 14, display: 'flex', alignItems: 'center' }}>
        Dependency Overview <InfoTooltip text="Visual map of how callers flow into the preferred implementation and what it depends on. Helps assess migration safety at a glance." width={300} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, minHeight: 120 }}>
        {/* Left — Inbound Callers */}
        <div style={{ paddingRight: 20, borderRight: '2px dashed #c9d7e8' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0176d3', marginBottom: 10 }}>
            Inbound Callers
          </div>
          {allInbound.size === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--sf-text-muted)', fontStyle: 'italic' }}>None detected</div>
          ) : (
            [...allInbound.entries()].map(([name, info]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusDotColor(info.status), flexShrink: 0 }} />
                <code style={{ fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,monospace', fontSize: 11, color: 'var(--sf-text)', wordBreak: 'break-all' }}>{name}</code>
                <span style={{ color: 'var(--sf-text-muted)', fontSize: 10 }}>({info.type})</span>
                <span style={{ color: '#0176d3', fontSize: 12, marginLeft: 'auto' }}>→</span>
              </div>
            ))
          )}
        </div>

        {/* Center — Preferred + Others */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 200 }}>
          {preferred && (
            <div style={{ border: '2px solid #2e844a', borderRadius: 8, padding: '12px 16px', background: '#f0faf4', textAlign: 'center', marginBottom: others.length > 0 ? 10 : 0, width: '100%' }}>
              <code style={{ fontSize: 12, fontWeight: 700, color: '#2e844a', wordBreak: 'break-all', lineHeight: 1.3 }}>{preferred.name}</code>
              <div style={{ fontSize: 10, color: 'var(--sf-text-secondary)', marginTop: 4 }}>{preferred.owner}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#2e844a', marginTop: 6, background: '#e6f9ed', padding: '2px 8px', borderRadius: 10 }}>✓ Preferred Standard</div>
            </div>
          )}
          {others.map(m => {
            const badgeColor = m.badge === 'Legacy' ? '#ea001e' : m.badge === 'Candidate' ? '#b86e00' : '#706e6b';
            const badgeBg = m.badge === 'Legacy' ? '#fde8ea' : m.badge === 'Candidate' ? '#fef4e8' : '#f0f0f0';
            return (
              <div key={m.id} style={{ border: '1px solid #e0e4ea', borderRadius: 6, padding: '6px 12px', background: '#fafbfc', textAlign: 'center', marginBottom: 4, width: '100%' }}>
                <code style={{ fontSize: 10, color: 'var(--sf-text)', wordBreak: 'break-all' }}>{m.name}</code>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 8, background: badgeBg, color: badgeColor, marginLeft: 6 }}>{m.badge}</span>
              </div>
            );
          })}
        </div>

        {/* Right — Outbound Dependencies */}
        <div style={{ paddingLeft: 20, borderLeft: '2px dashed #c9d7e8' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#2e844a', marginBottom: 10 }}>
            Outbound Dependencies
          </div>
          {allOutbound.size === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--sf-text-muted)', fontStyle: 'italic' }}>None detected</div>
          ) : (
            [...allOutbound.entries()].map(([name, info]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: '#2e844a', fontSize: 12 }}>←</span>
                <code style={{ fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,monospace', fontSize: 11, color: 'var(--sf-text)', wordBreak: 'break-all' }}>{name}</code>
                <span style={{ color: 'var(--sf-text-muted)', fontSize: 10 }}>({info.type})</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusDotColor(info.status), flexShrink: 0, marginLeft: 'auto' }} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScanReport({ reportId, onBack }: ScanReportProps) {
  const { showToast } = useAppContext();
  const [loaded, setLoaded] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());

  const report = scanReports.find((r) => r.id === reportId) || scanReports[0];

  const sortedClusters = [...clusters].sort(
    (a, b) => (PRIORITY_ORDER[a.runtimePriority] ?? 3) - (PRIORITY_ORDER[b.runtimePriority] ?? 3)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      const topIds = sortedClusters.slice(0, 3).map((c) => c.id);
      setExpandedFindings(new Set(topIds));
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = () => {
    showToast('Preparing PDF export…', 'info');
    setTimeout(() => showToast('PDF downloaded successfully', 'success'), 1500);
  };

  if (!loaded) {
    return (
      <div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div style={{ marginBottom: 16 }}>
          <SkeletonBlock height={14} width="320px" />
        </div>
        <div className="sf-card" style={{ marginBottom: 20, padding: 24 }}>
          <SkeletonBlock height={24} width="420px" />
          <div style={{ marginTop: 16 }}>
            <SkeletonBlock height={64} />
          </div>
        </div>
        <div className="sf-card" style={{ marginBottom: 20, padding: 24 }}>
          <SkeletonBlock height={18} width="200px" />
          <div style={{ marginTop: 14, display: 'flex', gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} height={72} width="25%" />
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <SkeletonBlock height={60} />
          </div>
        </div>
        <div className="sf-card" style={{ marginBottom: 20, padding: 24 }}>
          <SkeletonBlock height={16} width="160px" />
          <div style={{ marginTop: 12 }}>
            <SkeletonBlock height={80} />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="sf-card" style={{ marginBottom: 14, padding: 20 }}>
            <SkeletonBlock height={44} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div className="sf-breadcrumb" style={{ marginBottom: 8 }}>
        <a href="#" onClick={(e) => e.preventDefault()}>SETUP</a>
        <span className="sep">›</span>
        <a href="#" onClick={(e) => e.preventDefault()}>CODE INTELLIGENCE</a>
        <span className="sep">›</span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          CODE REUSABILITY
        </a>
        <span className="sep">›</span>
        <span>{report.name}</span>
      </div>

      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--sf-blue)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        Back to Code Reusability
      </button>

      {/* ── Report Header ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: 'var(--sf-text)' }}>
              {report.name}
            </h1>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 28,
                fontSize: 13,
              }}
            >
              <div>
                <div style={labelStyle}>Requested By</div>
                <div style={metaValueStyle}>{report.requestedBy}</div>
              </div>
              <div>
                <div style={labelStyle}>Generated On</div>
                <div style={metaValueStyle}>{formatDate(report.requestedDate)}</div>
              </div>
              <div>
                <div style={labelStyle}>Environment</div>
                <div style={metaValueStyle}>{report.environment}</div>
              </div>
              <div>
                <div style={labelStyle}>Org ID</div>
                <div style={metaValueStyle}>{report.orgId}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--sf-text)', lineHeight: 1 }}>
              {report.score}
            </div>
            {report.scoreDelta !== null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: '#e6f9ed',
                  color: '#2e844a',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                +{report.scoreDelta} vs previous
              </span>
            )}
            <button
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--sf-blue)',
                background: '#f0f7ff',
                border: '1px solid #d0e2f4',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Org Scan Summary ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 className="sf-section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} style={{ color: 'var(--sf-blue)' }} />
          Org Scan Summary
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            { label: 'Total Code Assets Analyzed', value: '1,842' },
            { label: 'Groups of Similar Code Found', value: '12' },
            { label: 'Estimated Lines Reducible', value: '2,830' },
            { label: 'Code Reuse Health Score', value: '78 / 100' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#f7f9fb',
                border: '1px solid #e5e8ed',
                borderRadius: 8,
                padding: '16px 14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: 'var(--sf-text)',
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.label}
                {stat.label === 'Code Reuse Health Score' && <InfoTooltip text={TIP['health-score']} />}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            color: 'var(--sf-text)',
            marginBottom: 20,
          }}
        >
          Your org has significant reuse opportunities across Apex classes, trigger handlers, LWC
          utilities, and SOQL patterns. The scan identified 12 groups of similar code spanning 53
          individual implementations. Addressing the top 10 high-impact findings below could reduce
          approximately 2,830 lines of duplicate logic and improve long-term maintainability.
        </p>

        <div style={{ ...labelStyle, marginBottom: 10 }}>Breakdown by Code Type</div>
        {[
          { name: 'Apex', count: 34, pct: 65 },
          { name: 'Triggers', count: 8, pct: 15 },
          { name: 'LWC JS/TS', count: 6, pct: 12 },
          { name: 'SOQL Patterns', count: 5, pct: 8 },
        ].map((row) => (
          <div
            key={row.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <span style={{ width: 100, fontWeight: 500, color: 'var(--sf-text)' }}>
              {row.name}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                background: '#eef1f5',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${row.pct}%`,
                  height: '100%',
                  background: '#0176d3',
                  borderRadius: 4,
                }}
              />
            </div>
            <span style={{ width: 90, textAlign: 'right', color: 'var(--sf-text-secondary)', fontSize: 12 }}>
              {row.count} patterns ({row.pct}%)
            </span>
          </div>
        ))}

        <div style={{ marginTop: 20 }}>
          <ScoreBreakdown />
        </div>
      </div>

      {/* ── What Changed ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 className="sf-section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>What Changed <InfoTooltip text={TIP['score-delta']} /></h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: 14,
                color: '#2e844a',
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={16} />
              Improved
            </div>
            {[
              '3 pricing variants consolidated into a shared engine',
              'Address validation standardized across checkout and account creation',
              '4 trigger helpers cleaned up and merged',
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--sf-text)',
                }}
              >
                <span style={{ color: '#2e844a', fontWeight: 700, flexShrink: 0 }}>+</span>
                {item}
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: 14,
                color: '#fe9339',
                marginBottom: 12,
              }}
            >
              <AlertTriangle size={16} />
              Needs Attention
            </div>
            {[
              'Quote sync wrappers still repeated across 5 integration points',
              'Renewal helpers still duplicated with fiscal year drift',
              'New discount approval group detected in recent sprint',
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--sf-text)',
                }}
              >
                <span style={{ color: '#fe9339', fontWeight: 700, flexShrink: 0 }}>!</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top 10 Code Reuse Findings ── */}
      <div style={{ marginBottom: 8, marginTop: 8 }}>
        <h2 className="sf-section-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
          Top 10 Code Reuse Findings <InfoTooltip text={TIP['high-priority']} />
        </h2>
        <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 16 }}>
          Ranked by impact — highest priority first
        </p>
      </div>

      {sortedClusters.map((cluster, idx) => {
        const rank = idx + 1;
        const isExpanded = expandedFindings.has(cluster.id);
        const friendlyName = FRIENDLY_NAMES[cluster.name] || cluster.name;
        const friendlyAction =
          FRIENDLY_RECOMMENDATIONS[cluster.recommendation] || cluster.recommendation;
        const priorityColor = PRIORITY_COLORS[cluster.runtimePriority] || '#969492';
        const hasMembers = cluster.members.length > 0;
        const hasDependencyData = cluster.members.some((m) => m.dependencies);

        return (
          <div
            key={cluster.id}
            className="sf-card"
            style={{
              padding: 0,
              marginBottom: 14,
              borderLeft: `4px solid ${priorityColor}`,
              overflow: 'hidden',
            }}
          >
            {/* Header — always visible */}
            <button
              onClick={() => toggleFinding(cluster.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 12,
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--sf-text-muted)',
                  minWidth: 28,
                }}
              >
                #{rank}
              </span>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: priorityColor,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--sf-text)',
                }}
              >
                {friendlyName}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background: '#f0f0f0',
                  color: 'var(--sf-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cluster.memberCount} implementations
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background:
                    cluster.recommendation === 'Standardize'
                      ? '#e6f9ed'
                      : cluster.recommendation === 'Consolidate'
                        ? '#e6f0ff'
                        : cluster.recommendation === 'Retire Variant'
                          ? '#fde8e8'
                          : '#f5f5f5',
                  color:
                    cluster.recommendation === 'Standardize'
                      ? '#2e844a'
                      : cluster.recommendation === 'Consolidate'
                        ? '#0176d3'
                        : cluster.recommendation === 'Retire Variant'
                          ? '#ea001e'
                          : 'var(--sf-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {friendlyAction}
              </span>
              {isExpanded ? (
                <ChevronUp size={18} style={{ color: 'var(--sf-text-muted)', flexShrink: 0 }} />
              ) : (
                <ChevronDown size={18} style={{ color: 'var(--sf-text-muted)', flexShrink: 0 }} />
              )}
            </button>

            {/* Body — when expanded */}
            {isExpanded && (
              <div style={{ padding: '0 24px 24px', borderTop: '1px solid #eef1f5' }}>
                {/* Best version to keep */}
                <div
                  style={{
                    marginTop: 16,
                    background: '#f9fbfd',
                    border: '1px solid #e0e6ed',
                    borderRadius: 6,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>Best version to keep <InfoTooltip text={TIP['preferred']} /></div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      marginBottom: 4,
                      color: 'var(--sf-text)',
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                    }}
                  >
                    {cluster.preferredCandidate}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--sf-text-secondary)' }}>
                    Owner: {cluster.owner}
                    {hasMembers && cluster.members[0]?.invocations30d != null && (
                      <>
                        {' · '}
                        {formatInvocations(cluster.members[0].invocations30d)} calls / 30 days
                        {' · '}
                        {formatInvocations(cluster.members[0].invocations90d)} calls / 90 days
                      </>
                    )}
                  </div>
                </div>

                {/* Dependency Overview Graph */}
                <DependencyGraph cluster={cluster} />

                {/* Dependency Analysis — detailed per member */}
                {hasDependencyData && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      Dependency Analysis <InfoTooltip text={TIP['dep-graph']} />
                    </div>
                    {cluster.members
                      .filter((m) => m.dependencies)
                      .map((m) => {
                        const riskColor = m.dependencies.riskLevel === 'High' ? '#ea001e' : m.dependencies.riskLevel === 'Moderate' ? '#fe9339' : '#2e844a';
                        const badgeBg = m.badge === 'Preferred' ? '#e6f9ed' : m.badge === 'Legacy' ? '#fde8ea' : '#f0f4f8';
                        const badgeColor = m.badge === 'Preferred' ? '#2e844a' : m.badge === 'Legacy' ? '#ea001e' : '#444';
                        return (
                          <div key={m.id} style={{ border: '1px solid var(--sf-border)', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
                            {/* Member header with summary stats */}
                            <div style={{ padding: '12px 16px', background: '#fafbfc', borderBottom: '1px solid var(--sf-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--sf-blue)', wordBreak: 'break-all', lineHeight: 1.3 }}>{m.name}</code>
                                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 10, background: badgeBg, color: badgeColor, flexShrink: 0 }}>{m.badge}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                                <span>Inbound: <strong>{m.dependencies.inboundCount}</strong></span>
                                <span>Outbound: <strong>{m.dependencies.outboundCount}</strong></span>
                                <span>Risk: <strong style={{ color: riskColor }}>{m.dependencies.riskLevel}</strong></span>
                                <span>Migration: <strong style={{ color: m.dependencies.migrationReady ? '#2e844a' : '#ea001e' }}>{m.dependencies.migrationReady ? 'Ready' : 'Not Ready'}</strong></span>
                              </div>
                            </div>

                            {/* Detailed dependency table */}
                            {m.dependencies.details && m.dependencies.details.length > 0 && (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                  <thead>
                                    <tr style={{ borderBottom: '2px solid #e5e8ed', textAlign: 'left' }}>
                                      <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Caller / Dependency</th>
                                      <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Direction</th>
                                      <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Type</th>
                                      <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Status</th>
                                      <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Action Needed</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {m.dependencies.details.map((dep, di) => {
                                      const statusColor = dep.status === 'Active' ? '#2e844a' : dep.status === 'Legacy' ? '#ea001e' : dep.status === 'Low Usage' ? '#fe9339' : '#706e6b';
                                      const dirBg = dep.direction === 'Inbound' ? '#e8f0fe' : '#f0f4f0';
                                      const dirColor = dep.direction === 'Inbound' ? '#0176d3' : '#2e844a';
                                      return (
                                        <tr key={di} style={{ borderBottom: '1px solid #f0f2f5' }}>
                                          <td style={{ padding: '7px 12px', fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,monospace', fontSize: 11, fontWeight: 500, color: 'var(--sf-text)' }}>{dep.name}</td>
                                          <td style={{ padding: '7px 12px' }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: dirBg, color: dirColor }}>{dep.direction}</span>
                                          </td>
                                          <td style={{ padding: '7px 12px', color: 'var(--sf-text-secondary)', fontSize: 11 }}>{dep.type}</td>
                                          <td style={{ padding: '7px 12px' }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, color: statusColor }}>{dep.status}</span>
                                          </td>
                                          <td style={{ padding: '7px 12px', color: 'var(--sf-text-secondary)', fontSize: 11, maxWidth: 240 }}>{dep.action}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Action rationale */}
                            {m.dependencies.actionRationale && (
                              <div style={{
                                padding: '10px 16px',
                                background: m.badge === 'Preferred' ? '#f0faf4' : m.badge === 'Legacy' ? '#fef5f5' : '#f8f9fb',
                                borderTop: '1px solid var(--sf-border)',
                                fontSize: 12,
                                lineHeight: 1.6,
                                color: 'var(--sf-text)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                              }}>
                                <span style={{ fontWeight: 700, color: m.badge === 'Preferred' ? '#2e844a' : m.badge === 'Legacy' ? '#ea001e' : '#0176d3', flexShrink: 0, fontSize: 11, marginTop: 1 }}>
                                  {m.badge === 'Preferred' ? '✓ SAFE' : m.badge === 'Legacy' ? '⚠ MIGRATE FIRST' : '→ ACTION NEEDED'}
                                </span>
                                <span>{m.dependencies.actionRationale}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Impact Summary */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    Impact Summary <InfoTooltip text="Shows the full business impact of this repeated code — not just lines saved, but workflows affected, change risk, test efficiency, and dependency complexity." width={300} />
                  </div>
                  <div style={{
                    border: '1px solid #d0dbe8',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                    {[
                      { icon: '📐', label: 'Code', value: cluster.impact.codeLines, bg: '#f8f9fb' },
                      { icon: '⚡', label: 'Workflows Affected', value: cluster.impact.workflows, bg: '#fff' },
                      { icon: '🔄', label: 'Change Risk', value: cluster.impact.changeRisk, bg: '#f8f9fb' },
                      { icon: '🧪', label: 'Test Surface', value: cluster.impact.testSurface, bg: '#fff' },
                      { icon: '🔗', label: 'Dependencies', value: cluster.impact.dependencies, bg: '#f8f9fb' },
                      ...(cluster.impact.governorLimits ? [{ icon: '⚠️', label: 'Governor Limits', value: cluster.impact.governorLimits, bg: '#fff8f0' }] : []),
                    ].map((row, ri) => (
                      <div key={ri} style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 150px 1fr',
                        alignItems: 'center',
                        padding: '10px 16px',
                        background: row.bg,
                        borderBottom: '1px solid #eef1f5',
                        fontSize: 13,
                        gap: 8,
                      }}>
                        <span style={{ fontSize: 15, textAlign: 'center' }}>{row.icon}</span>
                        <span style={{ fontWeight: 600, color: 'var(--sf-text)', fontSize: 12 }}>{row.label}</span>
                        <span style={{ color: 'var(--sf-text-secondary)', lineHeight: 1.5 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended next steps */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>Recommended next steps <InfoTooltip text={TIP['recommendation']} /></div>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {cluster.nextSteps.map((step, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: 'var(--sf-text)',
                          marginBottom: 4,
                        }}
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Why these belong together */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 6, display: 'flex', alignItems: 'center' }}>
                    Why these implementations were grouped <InfoTooltip text={TIP['why-grouped']} />
                  </div>
                  <div style={{
                    background: '#f8f9fb',
                    border: '1px solid #e0e4ea',
                    borderRadius: 6,
                    padding: 14,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--sf-text)',
                  }}>
                    These {cluster.memberCount} implementations share a common business purpose: {cluster.sharedIntent.toLowerCase()} They were grouped because they contain overlapping logic blocks ({cluster.commonBlocks.slice(0, 3).join(', ')}) and appear across related business flows ({cluster.whereItAppears.slice(0, 3).join(', ')}).
                  </div>
                </div>

                {/* Where it's used */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 8 }}>Where it's used</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cluster.whereItAppears.map((loc, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: '#f0f4f8',
                          color: 'var(--sf-text)',
                        }}
                      >
                        <ArrowUpRight size={11} style={{ color: 'var(--sf-text-muted)' }} />
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Why it matters */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 6 }}>Why it matters</div>
                  {cluster.whyItMatters.map((reason, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--sf-text)',
                        margin: '0 0 4px',
                      }}
                    >
                      {reason}
                    </p>
                  ))}
                </div>

                {/* e. What's the same across versions */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    What's the same across versions <InfoTooltip text={TIP['code-identical']} />
                  </div>
                  <div
                    style={{
                      background: '#f6faf6',
                      border: '1px solid #d4edda',
                      borderRadius: 6,
                      padding: 14,
                    }}
                  >
                    {cluster.commonBlocks.map((block, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: '#1b5e20',
                          marginBottom: i < cluster.commonBlocks.length - 1 ? 4 : 0,
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          style={{ marginTop: 3, flexShrink: 0, color: '#2e844a' }}
                        />
                        {block}
                      </div>
                    ))}
                  </div>
                </div>

                {/* f. What's different */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>What's different <InfoTooltip text={TIP['code-different']} /></div>
                  <div
                    style={{
                      background: '#fff8f0',
                      border: '1px solid #fde2c8',
                      borderRadius: 6,
                      padding: 14,
                    }}
                  >
                    {cluster.differences.map((diff, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: '#7c4a03',
                          marginBottom: i < cluster.differences.length - 1 ? 4 : 0,
                        }}
                      >
                        <AlertTriangle
                          size={14}
                          style={{ marginTop: 3, flexShrink: 0, color: '#fe9339' }}
                        />
                        {diff}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code view for each member */}
                {hasMembers && cluster.members.some(m => m.codeLines && m.codeLines.length > 0) && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ ...labelStyle, marginBottom: 8 }}>Code — highlighted by similarity</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11, flexWrap: 'wrap' }}>
                      {[
                        { bg: '#dcf5e7', border: '#2e844a', label: 'Duplicate (safe to reuse)', tip: 'code-identical' as const },
                        { bg: '#fef9e7', border: '#d4a017', label: 'Similar (minor variant)', tip: 'code-similar' as const },
                        { bg: '#fef0e8', border: '#e8590c', label: 'Different (needs attention)', tip: 'code-different' as const },
                        { bg: '#e8f0fe', border: '#0176d3', label: 'Unique to this version', tip: 'code-unique' as const },
                      ].map(l => (
                        <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: l.bg, border: `1px solid ${l.border}` }} />
                          {l.label}
                          <InfoTooltip text={TIP[l.tip]} />
                        </span>
                      ))}
                    </div>
                    {cluster.members.filter(m => m.codeLines && m.codeLines.length > 0).map(member => {
                      const bcMap: Record<string, {bg:string, color:string}> = {
                        Preferred: { bg: '#e6f9ed', color: '#2e844a' },
                        Candidate: { bg: '#fef4e8', color: '#b86e00' },
                        Legacy: { bg: '#fde8ea', color: '#ea001e' },
                      };
                      const bc = bcMap[member.badge] || { bg: '#f0f0f0', color: '#706e6b' };
                      const lineBg: Record<string, string> = { identical: '#f0faf4', similar: '#fefcf0', different: '#fef5f0', unique: '#f0f5ff' };
                      const lineBorder: Record<string, string> = { identical: '#2e844a', similar: '#d4a017', different: '#e8590c', unique: '#0176d3' };
                      const lineLabel: Record<string, string> = { identical: 'DUPLICATE', similar: 'SIMILAR', different: 'DIFFERENT', unique: 'UNIQUE' };
                      return (
                        <div key={member.id} style={{ border: '1px solid var(--sf-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                          <div style={{ padding: '10px 14px', background: '#fafbfc', borderBottom: '1px solid var(--sf-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--sf-blue)', wordBreak: 'break-all', lineHeight: 1.3 }}>{member.name}</code>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 10, background: bc.bg, color: bc.color, flexShrink: 0 }}>{member.badge}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--sf-text-secondary)' }}>{member.owner} &middot; {member.loc} lines &middot; {member.similarity}% similar</div>
                          </div>
                          <div style={{ fontFamily: "'SF Mono','Fira Code',Consolas,monospace", fontSize: 12, lineHeight: '22px' }}>
                            {member.codeLines!.map((line, li) => (
                              <div key={li} style={{ display: 'flex', background: lineBg[line.matchType] || '#fff', borderLeft: `3px solid ${lineBorder[line.matchType] || '#ccc'}`, borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ width: 32, textAlign: 'right', paddingRight: 8, color: '#aaa', fontSize: 10, userSelect: 'none', lineHeight: '22px', flexShrink: 0 }}>{line.lineNum}</span>
                                <span style={{ flex: 1, whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>{line.text}</span>
                                {line.matchType !== 'identical' && (
                                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--sf-font)', color: lineBorder[line.matchType], padding: '0 8px', lineHeight: '22px', whiteSpace: 'nowrap', flexShrink: 0 }}>{lineLabel[line.matchType]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Why we recommend this */}
                <div style={{ marginBottom: hasMembers && cluster.id === 'cl-001' ? 16 : 0 }}>
                  <div style={{ ...labelStyle, marginBottom: 8 }}>Why we recommend this</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {cluster.rationale.map((r, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: 'var(--sf-text)',
                          marginBottom: 4,
                        }}
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* cl-001 bonus: All implementations table */}
                {cluster.id === 'cl-001' && hasMembers && (
                  <div>
                    <div style={{ ...labelStyle, marginBottom: 8 }}>All implementations</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: 12,
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: '2px solid #e5e8ed',
                              textAlign: 'left',
                            }}
                          >
                            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                              Name
                            </th>
                            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                              Owner
                            </th>
                            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                              Usage (30d)
                            </th>
                            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                              Similarity
                            </th>
                            <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cluster.members.map((m) => (
                            <tr
                              key={m.id}
                              style={{ borderBottom: '1px solid #f0f0f0' }}
                            >
                              <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--sf-text)', fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 11, wordBreak: 'break-all', maxWidth: 280, lineHeight: 1.4 }}>
                                {m.name}
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--sf-text-secondary)' }}>
                                {m.owner}
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--sf-text)' }}>
                                {formatInvocations(m.invocations30d)}
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--sf-text)' }}>
                                {m.similarity}%
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                    background:
                                      m.badge === 'Preferred'
                                        ? '#e6f9ed'
                                        : m.badge === 'Legacy'
                                          ? '#fde8e8'
                                          : '#f0f0f0',
                                    color:
                                      m.badge === 'Preferred'
                                        ? '#2e844a'
                                        : m.badge === 'Legacy'
                                          ? '#ea001e'
                                          : 'var(--sf-text-secondary)',
                                  }}
                                >
                                  {m.badge}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Score History ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20, marginTop: 28 }}>
        <h2 className="sf-section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>Score History <InfoTooltip text={TIP['score-delta']} /></h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scoreHistory}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#706e6b' }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 12, fill: '#706e6b' }}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #e5e5e5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0176d3"
                strokeWidth={2}
                dot={{ fill: '#0176d3', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Scan Details ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 40 }}>
        <h2 className="sf-section-title" style={{ marginBottom: 16 }}>Scan Details</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {[
            { label: 'Report Name', value: report.name },
            { label: 'Requested By', value: report.requestedBy },
            { label: 'Date', value: formatDate(report.requestedDate) },
            { label: 'Start Time', value: formatDateTime(report.startTime) },
            { label: 'End Time', value: formatDateTime(report.endTime) },
            { label: 'Environment', value: report.environment },
            { label: 'Org ID', value: report.orgId },
            { label: 'Scope', value: report.scope.join(', ') },
            {
              label: 'Runtime Enrichment',
              value: report.runtimeEnrichment ? 'Enabled' : 'Disabled',
            },
            { label: 'Report Version', value: report.reportVersion },
            { label: 'Status', value: report.status },
          ].map((item) => (
            <div key={item.label}>
              <div style={labelStyle}>{item.label}</div>
              <div style={{ ...metaValueStyle, wordBreak: 'break-all' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
