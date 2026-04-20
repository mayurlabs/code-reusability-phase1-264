import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Shield,
  Copy,
  FileText,
  Code2,
  Layers,
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
import {
  scanReports,
  cloneGroups,
  scoreHistory,
  levelDistribution,
  categoryDistribution,
} from '../data/mockData';
import type { CloneGroup } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { InfoTooltip, TIP } from '../components/InfoTooltip';
import { ScoreBreakdown, ApexLimitBar } from '../components/ScoreBreakdown';

interface Props {
  reportId: string;
  onBack: () => void;
}

const TIER_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  HIGH: { bg: '#fde8ea', color: '#ea001e' },
  MEDIUM: { bg: '#fef4e8', color: '#b86e00' },
  LOW: { bg: '#e6f9ed', color: '#2e844a' },
};

const EFFORT_STYLE = TIER_STYLE;

const LEVEL_ICON: Record<string, React.ReactNode> = {
  file: <FileText size={12} />,
  method: <Code2 size={12} />,
  block: <Layers size={12} />,
};

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

const codeBlockStyle: React.CSSProperties = {
  fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 12,
  lineHeight: '22px',
  background: '#1e293b',
  color: '#e2e8f0',
  borderRadius: 6,
  overflow: 'auto',
};

function TierBadge({ tier }: { tier: string }) {
  const s = TIER_STYLE[tier] || { bg: '#f0f0f0', color: '#706e6b' };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 10px',
        borderRadius: 10,
        background: s.bg,
        color: s.color,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {tier}
    </span>
  );
}

function LevelBadge({ level }: { level: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 10,
        background: '#f0f0f0',
        color: '#706e6b',
        whiteSpace: 'nowrap',
      }}
    >
      {LEVEL_ICON[level]}
      {level}
    </span>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  const s = EFFORT_STYLE[effort] || { bg: '#f0f0f0', color: '#706e6b' };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 10,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      Effort: {effort}
    </span>
  );
}

function CodeBlock({ lines, startLine = 1 }: { lines: string[]; startLine?: number }) {
  return (
    <div style={{ ...codeBlockStyle, padding: 0 }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            borderBottom: i < lines.length - 1 ? '1px solid #2d3a4e' : 'none',
          }}
        >
          <span
            style={{
              width: 44,
              textAlign: 'right',
              paddingRight: 12,
              paddingLeft: 8,
              color: '#64748b',
              fontSize: 11,
              userSelect: 'none',
              lineHeight: '22px',
              flexShrink: 0,
              borderRight: '1px solid #334155',
            }}
          >
            {startLine + i}
          </span>
          <span
            style={{
              flex: 1,
              whiteSpace: 'pre',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingLeft: 12,
              paddingRight: 12,
              lineHeight: '22px',
            }}
          >
            {line}
          </span>
        </div>
      ))}
    </div>
  );
}

function ImpactSummary({ impact }: { impact: CloneGroup['impact'] }) {
  const rows = [
    { icon: '📐', label: 'Code', value: impact.codeLines, bg: '#f8f9fb' },
    { icon: '⚡', label: 'Workflows Affected', value: impact.workflows, bg: '#fff' },
    { icon: '🔄', label: 'Change Risk', value: impact.changeRisk, bg: '#f8f9fb' },
    { icon: '🧪', label: 'Test Surface', value: impact.testSurface, bg: '#fff' },
    { icon: '🔗', label: 'Dependencies', value: impact.dependencies, bg: '#f8f9fb' },
    ...(impact.governorLimits
      ? [{ icon: '⚠️', label: 'Governor Limits', value: impact.governorLimits, bg: '#fff8f0' }]
      : []),
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
        Impact Summary
        <InfoTooltip
          text="Shows the full business impact of this clone group — not just chars saved, but workflows affected, change risk, test efficiency, and dependency complexity."
          width={300}
        />
      </div>
      <div style={{ border: '1px solid #d0dbe8', borderRadius: 8, overflow: 'hidden' }}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 150px 1fr',
              alignItems: 'center',
              padding: '10px 16px',
              background: row.bg,
              borderBottom: ri < rows.length - 1 ? '1px solid #eef1f5' : 'none',
              fontSize: 13,
              gap: 8,
            }}
          >
            <span style={{ fontSize: 15, textAlign: 'center' }}>{row.icon}</span>
            <span style={{ fontWeight: 600, color: 'var(--sf-text)', fontSize: 12 }}>{row.label}</span>
            <span style={{ color: 'var(--sf-text-secondary)', lineHeight: 1.5 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyNextRationale({ group }: { group: CloneGroup }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...labelStyle, marginBottom: 6 }}>Why this matters</div>
        {group.whyItMatters.map((reason, i) => (
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

      <div style={{ marginBottom: 16 }}>
        <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          Next steps <InfoTooltip text={TIP['recommendation']} />
        </div>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {group.nextSteps.map((step, i) => (
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

      <div>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Rationale</div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {group.rationale.map((r, i) => (
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
    </>
  );
}

function ExactDuplicateBody({ group }: { group: CloneGroup }) {
  const rep = group.representative;

  return (
    <div style={{ padding: '0 24px 24px', borderTop: '1px solid #eef1f5' }}>
      {/* a. Recipe */}
      <div
        style={{
          marginTop: 16,
          background: '#f0faf4',
          border: '1px solid #b7ebc9',
          borderRadius: 8,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#2e844a' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1b5e20' }}>
            Recipe
          </span>
          <InfoTooltip text={TIP['recipe']} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1b5e20', marginBottom: 6 }}>
          {group.recipe}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: '#2e7d32', marginBottom: 10 }}>
          {group.recipeDetail}
        </div>
        <EffortBadge effort={group.effort} />
      </div>

      {/* Criticality Signals */}
      {group.criticalitySignals && group.criticalitySignals.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: group.tier === 'HIGH' ? '#ea001e' : group.tier === 'MEDIUM' ? '#b86e00' : '#2e844a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            Why this is {group.tier} priority
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.criticalitySignals.map((signal, si) => (
              <div key={si} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 12px',
                background: group.tier === 'HIGH' ? '#fef5f5' : group.tier === 'MEDIUM' ? '#fefbf0' : '#f5faf5',
                borderRadius: 6,
                borderLeft: `3px solid ${group.tier === 'HIGH' ? '#ea001e' : group.tier === 'MEDIUM' ? '#fe9339' : '#2e844a'}`,
                fontSize: 13,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{signal.icon}</span>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--sf-text)' }}>{signal.label}:</span>{' '}
                  <span style={{ color: 'var(--sf-text-secondary)' }}>{signal.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* b. The Code */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          The Code <InfoTooltip text={TIP['representative']} />
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--sf-text-secondary)',
            marginBottom: 8,
            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          Representative: {rep.fileName} — {rep.lineRange} ({rep.lineCount} lines, {rep.charCount.toLocaleString()} chars)
        </div>
        <CodeBlock lines={rep.code} />
      </div>

      {/* c. All Copies */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          All Copies <InfoTooltip text={TIP['copies']} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e8ed', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>File Name</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Lines</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Chars</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Referenced By</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontSize: 10 }}>Safe to Remove</th>
              </tr>
            </thead>
            <tbody>
              {group.cloneCopies.map((copy) => (
                <tr key={copy.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td
                    style={{
                      padding: '8px 10px',
                      fontWeight: 500,
                      color: 'var(--sf-text)',
                      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: 11,
                      wordBreak: 'break-all',
                      maxWidth: 280,
                      lineHeight: 1.4,
                    }}
                  >
                    {copy.fileName}
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--sf-text-secondary)' }}>
                    {copy.lineRange} ({copy.lineCount})
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--sf-text-secondary)' }}>
                    {copy.charCount.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--sf-text-secondary)', fontSize: 11 }}>
                    {copy.referencedBy.join(', ') || '—'}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {copy.safeToRemove ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2e844a', fontWeight: 600, fontSize: 11 }}>
                        <CheckCircle2 size={13} /> Yes
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ea001e', fontWeight: 600, fontSize: 11 }}>
                        <AlertTriangle size={13} /> No
                        {copy.safetyNote && (
                          <InfoTooltip text={copy.safetyNote} width={240} />
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* d. Impact Summary */}
      <ImpactSummary impact={group.impact} />

      {/* e. Why / Next / Rationale */}
      <WhyNextRationale group={group} />
    </div>
  );
}

function NearDuplicateBody({ group }: { group: CloneGroup }) {
  const rep = group.representative;

  return (
    <div style={{ padding: '0 24px 24px', borderTop: '1px solid #eef1f5' }}>
      {/* a. Recipe */}
      <div
        style={{
          marginTop: 16,
          background: '#e8f0fe',
          border: '1px solid #90caf9',
          borderRadius: 8,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Code2 size={16} style={{ color: '#0176d3' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0d47a1' }}>
            Recipe
          </span>
          <InfoTooltip text={TIP['recipe']} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0d47a1', marginBottom: 6 }}>
          {group.recipe}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1565c0', marginBottom: 10 }}>
          {group.recipeDetail}
        </div>
        <EffortBadge effort={group.effort} />
      </div>

      {/* Criticality Signals */}
      {group.criticalitySignals && group.criticalitySignals.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: group.tier === 'HIGH' ? '#ea001e' : group.tier === 'MEDIUM' ? '#b86e00' : '#2e844a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            Why this is {group.tier} priority
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.criticalitySignals.map((signal, si) => (
              <div key={si} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 12px',
                background: group.tier === 'HIGH' ? '#fef5f5' : group.tier === 'MEDIUM' ? '#fefbf0' : '#f5faf5',
                borderRadius: 6,
                borderLeft: `3px solid ${group.tier === 'HIGH' ? '#ea001e' : group.tier === 'MEDIUM' ? '#fe9339' : '#2e844a'}`,
                fontSize: 13,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{signal.icon}</span>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--sf-text)' }}>{signal.label}:</span>{' '}
                  <span style={{ color: 'var(--sf-text-secondary)' }}>{signal.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* b. Representative Code */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          Representative Code <InfoTooltip text={TIP['representative']} />
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--sf-text-secondary)',
            marginBottom: 8,
            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          Representative: {rep.fileName} — {rep.lineRange}
        </div>
        <CodeBlock lines={rep.code} />
      </div>

      {/* c. Copies with Differences */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, marginBottom: 10, display: 'flex', alignItems: 'center' }}>
          Copies with Differences <InfoTooltip text={TIP['near-duplicates']} />
        </div>
        {group.cloneCopies.map((copy) => (
          <div
            key={copy.id}
            style={{
              border: '1px solid #d0dbe8',
              borderRadius: 8,
              marginBottom: 14,
              overflow: 'hidden',
            }}
          >
            {/* Copy header */}
            <div
              style={{
                padding: '12px 16px',
                background: '#fafbfc',
                borderBottom: '1px solid #eef1f5',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 6,
                }}
              >
                <Copy size={14} style={{ color: 'var(--sf-text-muted)' }} />
                <code
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--sf-blue)',
                    wordBreak: 'break-all',
                    lineHeight: 1.3,
                  }}
                >
                  {copy.fileName}
                </code>
                <span style={{ fontSize: 11, color: 'var(--sf-text-secondary)' }}>
                  {copy.lineRange} · {copy.lineCount} lines · {copy.charCount.toLocaleString()} chars
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--sf-text-secondary)', marginBottom: 4 }}>
                <strong>Referenced By:</strong> {copy.referencedBy.join(', ') || '—'}
              </div>
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ color: 'var(--sf-text-secondary)' }}>Safe to Remove:</strong>
                {copy.safeToRemove ? (
                  <span style={{ color: '#2e844a', fontWeight: 600 }}>
                    <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                    Yes
                  </span>
                ) : (
                  <span style={{ color: '#ea001e', fontWeight: 600 }}>
                    <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                    No
                    {copy.safetyNote && (
                      <span style={{ fontWeight: 400, color: 'var(--sf-text-secondary)', marginLeft: 6 }}>
                        — {copy.safetyNote}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Key Differences */}
            {copy.differences && copy.differences.length > 0 && (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 10 }}>
                  Key Differences
                </div>
                {copy.differences.map((diff, di) => (
                  <div
                    key={di}
                    style={{
                      marginBottom: di < copy.differences!.length - 1 ? 14 : 0,
                      border: '1px solid #e5e8ed',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 12px',
                        background: '#fef9e7',
                        borderBottom: '1px solid #e5e8ed',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#7c4a03',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <AlertTriangle size={12} style={{ color: '#b86e00' }} />
                      {diff.description}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                      <div style={{ borderRight: '1px solid #e5e8ed' }}>
                        <div style={{ padding: '6px 10px', background: '#f8f9fb', fontSize: 10, fontWeight: 700, color: 'var(--sf-text-muted)', textTransform: 'uppercase', borderBottom: '1px solid #e5e8ed' }}>
                          Representative:
                        </div>
                        <div
                          style={{
                            padding: '8px 10px',
                            background: '#1e293b',
                            color: '#e2e8f0',
                            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: 11,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            minHeight: 40,
                          }}
                        >
                          {diff.representativeCode}
                        </div>
                      </div>
                      <div>
                        <div style={{ padding: '6px 10px', background: '#f8f9fb', fontSize: 10, fontWeight: 700, color: 'var(--sf-text-muted)', textTransform: 'uppercase', borderBottom: '1px solid #e5e8ed' }}>
                          This copy:
                        </div>
                        <div
                          style={{
                            padding: '8px 10px',
                            background: '#1e293b',
                            color: '#e2e8f0',
                            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: 11,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            minHeight: 40,
                          }}
                        >
                          {diff.copyCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* d. Impact Summary */}
      <ImpactSummary impact={group.impact} />

      {/* e. Why / Next / Rationale */}
      <WhyNextRationale group={group} />
    </div>
  );
}

export default function ScanReport({ reportId, onBack }: Props) {
  const { showToast } = useAppContext();
  const [loaded, setLoaded] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());

  const report = scanReports.find((r) => r.id === reportId) || scanReports[0];

  const sortedGroups = [...cloneGroups].sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 3) - (TIER_ORDER[b.tier] ?? 3)
  );

  const totalExact = cloneGroups.filter((g) => g.isExact).length;
  const totalNear = cloneGroups.filter((g) => !g.isExact).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      const topIds = sortedGroups.slice(0, 3).map((c) => c.id);
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

  /* ── Loading Skeleton ── */
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

      {/* ── 2. Breadcrumb ── */}
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

      {/* ── 3. Report Header ── */}
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

            {/* Stats row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                marginBottom: 18,
                fontSize: 13,
              }}
            >
              {[
                { label: 'Files', value: '785' },
                { label: 'Groups', value: String(cloneGroups.length), tip: TIP['clone-groups'] },
                { label: 'Chars saved', value: cloneGroups.reduce((s, g) => s + g.charsSaved, 0).toLocaleString(), tip: TIP['chars-saved'] },
                { label: 'Exact', value: String(totalExact), tip: TIP['exact-duplicates'] },
                { label: 'Near', value: String(totalNear), tip: TIP['near-duplicates'] },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--sf-text-muted)', fontWeight: 500, fontSize: 12 }}>
                    {s.label}:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--sf-text)' }}>{s.value}</span>
                  {s.tip && <InfoTooltip text={s.tip} />}
                </div>
              ))}
            </div>

            {/* Metadata row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, fontSize: 13 }}>
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

          {/* Score + Download */}
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

      {/* ── Apex Character Limit ── */}
      <ApexLimitBar />

      {/* ── 4. Org Scan Summary ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20 }}>
        <h2
          className="sf-section-title"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Shield size={18} style={{ color: 'var(--sf-blue)' }} />
          Org Scan Summary
        </h2>

        {/* 4 stat boxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            { label: 'Clone Groups Found', value: String(cloneGroups.length), tip: TIP['clone-groups'] },
            { label: 'Exact Duplicates', value: String(totalExact), tip: TIP['exact-duplicates'] },
            { label: 'Near Duplicates', value: String(totalNear), tip: TIP['near-duplicates'] },
            { label: 'Chars Saved', value: cloneGroups.reduce((s, g) => s + g.charsSaved, 0).toLocaleString(), tip: TIP['chars-saved'] },
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
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--sf-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.label}
                {stat.tip && <InfoTooltip text={stat.tip} />}
              </div>
            </div>
          ))}
        </div>

        {/* Summary paragraph */}
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            color: 'var(--sf-text)',
            marginBottom: 20,
          }}
        >
          Your org has significant clone reduction opportunities across Apex classes, trigger handlers,
          and data access layers. The scan identified {cloneGroups.length} clone groups spanning{' '}
          {cloneGroups.reduce((s, g) => s + g.copies, 0)} total copies. Addressing the highest-tier
          findings below could eliminate approximately{' '}
          {cloneGroups.reduce((s, g) => s + g.charsSaved, 0).toLocaleString()} characters of
          duplicate code and improve long-term maintainability.
        </p>

        {/* Level distribution */}
        <div style={{ ...labelStyle, marginBottom: 10 }}>Level Distribution</div>
        {levelDistribution.map((row) => {
          const total = levelDistribution.reduce((s, r) => s + r.value, 0);
          const pct = Math.round((row.value / total) * 100);
          return (
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
              <span style={{ width: 110, fontWeight: 500, color: 'var(--sf-text)' }}>
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
                    width: `${pct}%`,
                    height: '100%',
                    background: row.color,
                    borderRadius: 4,
                  }}
                />
              </div>
              <span
                style={{
                  width: 90,
                  textAlign: 'right',
                  color: 'var(--sf-text-secondary)',
                  fontSize: 12,
                }}
              >
                {row.value} groups ({pct}%)
              </span>
            </div>
          );
        })}

        {/* ScoreBreakdown — full version */}
        <div style={{ marginTop: 20 }}>
          <ScoreBreakdown />
        </div>
      </div>

      {/* ── 5. What Changed ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20 }}>
        <h2
          className="sf-section-title"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}
        >
          What Changed <InfoTooltip text={TIP['score-delta']} />
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Reduced */}
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
              Reduced
            </div>
            {[
              '6 identical DataView files consolidated — 13,608 chars eliminated',
              'Guest claim audit methods merged into shared fetchGuestClaimData',
              '4 exact-copy SOQL helper methods removed across trigger handlers',
              'Boolean evaluator pattern extracted to shared utility class',
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

          {/* Still Needs Work */}
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
              Still Needs Work
            </div>
            {[
              '6 listing-query near duplicates still differ only in WHERE clause',
              'Review DTO builders repeated 3 times with guest-type variation',
              'Evidence validation orchestration duplicated across FSC and insurance',
              'Host summary fetch methods still need date-filter reconciliation',
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

      {/* ── 6. Clone Detection Findings ── */}
      <div style={{ marginBottom: 8, marginTop: 8 }}>
        <h2
          className="sf-section-title"
          style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}
        >
          Clone Detection Findings <InfoTooltip text={TIP['tier']} />
        </h2>
        <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 16 }}>
          Sorted by tier and impact — HIGH first
        </p>
      </div>

      {sortedGroups.map((group) => {
        const isExpanded = expandedFindings.has(group.id);
        const tierStyle = TIER_STYLE[group.tier] || { bg: '#f0f0f0', color: '#706e6b' };

        return (
          <div
            key={group.id}
            className="sf-card"
            style={{
              padding: 0,
              marginBottom: 14,
              borderLeft: `4px solid ${tierStyle.color}`,
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <button
              onClick={() => toggleFinding(group.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 10,
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <TierBadge tier={group.tier} />
              <LevelBadge level={group.level} />
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--sf-text)',
                }}
              >
                {group.name}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 10,
                  background: '#f0f0f0',
                  color: 'var(--sf-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Copy size={11} />
                {group.copies} copies
              </span>
              <EffortBadge effort={group.effort} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--sf-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.charsSaved.toLocaleString()} chars
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sf-text)',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.score}
                <InfoTooltip text={TIP['score']} />
              </span>
              {isExpanded ? (
                <ChevronUp size={18} style={{ color: 'var(--sf-text-muted)', flexShrink: 0 }} />
              ) : (
                <ChevronDown size={18} style={{ color: 'var(--sf-text-muted)', flexShrink: 0 }} />
              )}
            </button>

            {/* Card body */}
            {isExpanded && (
              group.isExact ? (
                <ExactDuplicateBody group={group} />
              ) : (
                <NearDuplicateBody group={group} />
              )
            )}
          </div>
        );
      })}

      {/* ── 7. Score History ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 20, marginTop: 28 }}>
        <h2
          className="sf-section-title"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}
        >
          Score History <InfoTooltip text={TIP['score-delta']} />
        </h2>
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

      {/* ── 8. Scan Details ── */}
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
