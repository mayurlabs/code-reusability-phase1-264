import { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Shield,
  TrendingUp,
  RefreshCw,
  Calendar,
  Download,
  BellOff,
  CheckCircle2,
} from 'lucide-react';
import { apexGuruInsights } from '../data/mockData';

const SEVERITY_CONFIG: Record<
  string,
  { icon: typeof AlertTriangle; color: string; bg: string; label: string }
> = {
  Critical: { icon: AlertTriangle, color: '#c23934', bg: '#fde8e8', label: 'Critical' },
  Warning: { icon: AlertCircle, color: '#fe9339', bg: '#fff8e1', label: 'Warning' },
  Info: { icon: Info, color: '#0176d3', bg: '#e1f5fe', label: 'Info' },
};

const IMPACT_COLORS: Record<string, { bg: string; color: string }> = {
  High: { bg: '#fde8e8', color: '#c23934' },
  Medium: { bg: '#fff8e1', color: '#b7741a' },
  Low: { bg: '#f0f0f0', color: '#706e6b' },
};

const RECOMMENDATIONS = [
  {
    title: 'Bulkify SOQL Patterns',
    description:
      'Replace inline SOQL queries inside loops with collection-based selector methods to avoid governor limit violations.',
    impact: 'High',
    effort: 'Medium',
    icon: Shield,
    color: '#c23934',
  },
  {
    title: 'Optimize Heap Usage',
    description:
      'Implement chunked processing for large record sets to stay within synchronous heap limits on bulk operations.',
    impact: 'Medium',
    effort: 'Low',
    icon: TrendingUp,
    color: '#fe9339',
  },
  {
    title: 'Consolidate DML Operations',
    description:
      'Collect records in lists and perform bulk DML at transaction boundaries instead of individual record updates.',
    impact: 'Medium',
    effort: 'Low',
    icon: RefreshCw,
    color: '#0176d3',
  },
  {
    title: 'Refactor CPU-Intensive Loops',
    description:
      'Replace nested loop patterns with map-based lookups to reduce CPU time on bulk trigger executions.',
    impact: 'High',
    effort: 'High',
    icon: Zap,
    color: '#9050e9',
  },
];

export default function ApexGuruPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const criticalCount = apexGuruInsights.filter((i) => i.severity === 'Critical').length;

  return (
    <div>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--sf-text-muted)',
          marginBottom: 12,
        }}
      >
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--sf-blue)', textDecoration: 'none' }}>
          SETUP
        </a>
        <span>›</span>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--sf-blue)', textDecoration: 'none' }}>
          Code Intelligence
        </a>
        <span>›</span>
        <span style={{ color: 'var(--sf-text)' }}>ApexGuru</span>
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={20} color="#9050e9" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>ApexGuru</h1>
          <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)' }}>
            AI-powered Apex code analysis and optimization recommendations
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Active Insights', value: '12', accent: '#9050e9' },
          { label: 'Critical Hotspots', value: String(criticalCount), accent: '#c23934' },
          { label: 'Recommendations Implemented', value: '18', accent: '#2e844a' },
          { label: 'Last Analysis', value: 'Mar 25, 2026', accent: '#0176d3' },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '18px 20px',
              border: '1px solid var(--sf-border)',
              borderTop: `3px solid ${card.accent}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--sf-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: 8,
              }}
            >
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--sf-text)' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid var(--sf-border)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--sf-border)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Performance Insights
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr
              style={{
                background: '#fafafa',
                textAlign: 'left',
                borderBottom: '1px solid var(--sf-border)',
              }}
            >
              {['', 'Severity', 'Insight', 'Impact', 'Team', 'Detected'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sf-text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apexGuruInsights.map((insight) => {
              const sev = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.Info;
              const SevIcon = sev.icon;
              const impact = IMPACT_COLORS[insight.impact] || IMPACT_COLORS.Low;
              const isExpanded = expandedId === insight.id;

              return (
                <tbody key={insight.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--sf-border)',
                      cursor: 'pointer',
                      background: isExpanded ? '#f8fbff' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.background = '#f9f9f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.background = '';
                    }}
                  >
                    <td style={{ padding: '10px 16px', width: 30 }}>
                      {isExpanded ? (
                        <ChevronDown size={14} color="var(--sf-text-muted)" />
                      ) : (
                        <ChevronRight size={14} color="var(--sf-text-muted)" />
                      )}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: sev.bg,
                          color: sev.color,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <SevIcon size={12} />
                        {sev.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--sf-text)' }}>
                      {insight.title}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: impact.bg,
                          color: impact.color,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {insight.impact}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--sf-text-secondary)' }}>
                      {insight.team}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--sf-text-secondary)' }}>
                      {insight.lastDetected}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '0 16px 16px 46px',
                          borderBottom: '1px solid var(--sf-border)',
                          background: '#f8fbff',
                        }}
                      >
                        <div
                          style={{
                            background: '#fff',
                            borderRadius: 6,
                            padding: 16,
                            border: '1px solid #e0e6ed',
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              lineHeight: 1.7,
                              color: 'var(--sf-text)',
                              marginBottom: 14,
                            }}
                          >
                            {insight.description}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              gap: 16,
                              fontSize: 12,
                              color: 'var(--sf-text-secondary)',
                              marginBottom: 14,
                            }}
                          >
                            <span>
                              <Calendar size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
                              Detected: {insight.lastDetected}
                            </span>
                            <span>Team: {insight.team}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                height: 30,
                                padding: '0 14px',
                                borderRadius: 4,
                                background: 'var(--sf-blue)',
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                                border: 'none',
                              }}
                            >
                              <CheckCircle2 size={13} /> Acknowledge
                            </button>
                            <button
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                height: 30,
                                padding: '0 14px',
                                borderRadius: 4,
                                background: '#f8f9fa',
                                color: 'var(--sf-text-secondary)',
                                fontSize: 12,
                                fontWeight: 600,
                                border: '1px solid var(--sf-border)',
                              }}
                            >
                              <BellOff size={13} /> Suppress
                            </button>
                            <button
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                height: 30,
                                padding: '0 14px',
                                borderRadius: 4,
                                background: '#f8f9fa',
                                color: 'var(--sf-text-secondary)',
                                fontSize: 12,
                                fontWeight: 600,
                                border: '1px solid var(--sf-border)',
                              }}
                            >
                              <Download size={13} /> Export
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recommendations grid */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recommendations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {RECOMMENDATIONS.map((rec, i) => {
            const RecIcon = rec.icon;
            const impactStyle = IMPACT_COLORS[rec.impact] || IMPACT_COLORS.Low;
            return (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 20,
                  border: '1px solid var(--sf-border)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${rec.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <RecIcon size={16} color={rec.color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{rec.title}</span>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: 'var(--sf-text-secondary)',
                    marginBottom: 12,
                  }}
                >
                  {rec.description}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: impactStyle.bg,
                      color: impactStyle.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Impact: {rec.impact}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: '#f0f0f0',
                      color: 'var(--sf-text-secondary)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Effort: {rec.effort}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
