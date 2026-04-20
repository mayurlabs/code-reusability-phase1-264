import { InfoTooltip } from './InfoTooltip';

export const SCORE_DIMENSIONS = [
  {
    key: 'exact',
    label: 'Exact Duplicates',
    score: 72,
    pct: '10.3%',
    detail: '10.3% of codebase is exact-duplicate code that can be deleted',
    color: '#0176d3',
    tip: 'How much identical (copy-paste) code exists. These are the easiest to clean up — delete all but one copy and redirect callers.',
  },
  {
    key: 'near',
    label: 'Near Duplicates',
    score: 84,
    pct: '7.4%',
    detail: '7.4% of codebase is near-duplicate code that needs refactoring',
    color: '#9050e9',
    tip: 'How much similar (but not identical) code exists. These need review to understand the differences before consolidating into a shared method.',
  },
  {
    key: 'trend',
    label: 'Trend',
    score: 78,
    pct: '',
    detail: 'Improving — reduced 28,400 chars since last scan',
    color: '#2e844a',
    tip: 'Whether your org is reducing duplication over time. Above 50 = improving, 50 = flat, below 50 = duplication is growing.',
  },
];

export const APEX_LIMIT = {
  total: 6_000_000,
  used: 5_200_000,
  duplicated: 424_685,
  afterCleanup: 5_200_000 - 424_685,
  usedPct: ((5_200_000 / 6_000_000) * 100).toFixed(1),
  afterPct: (((5_200_000 - 424_685) / 6_000_000) * 100).toFixed(1),
  duplicatedPct: ((424_685 / 6_000_000) * 100).toFixed(1),
  urgency: 'warning' as 'safe' | 'warning' | 'critical',
};

interface ScoreBreakdownProps {
  compact?: boolean;
}

export function ScoreBreakdown({ compact = false }: ScoreBreakdownProps) {
  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {SCORE_DIMENSIONS.map((d) => (
          <div key={d.key} style={{ fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ color: 'var(--sf-text-secondary)', fontWeight: 500 }}>
                {d.label}
                {d.pct && <span style={{ color: 'var(--sf-text-muted)', fontWeight: 400, marginLeft: 4 }}>({d.pct})</span>}
              </span>
              <span style={{ fontWeight: 700, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#fe9339' : '#ea001e' }}>{d.score}</span>
            </div>
            <div style={{ height: 5, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${d.score}%`, height: '100%', background: d.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--sf-border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px',
        background: '#fafbfc',
        borderBottom: '1px solid var(--sf-border)',
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--sf-text)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        Score Breakdown
        <InfoTooltip text="Your Health Score (78) is based on exact duplication (40%), near duplication (40%), and improvement trend (20%). Lower duplication = higher score." width={280} />
      </div>
      {SCORE_DIMENSIONS.map((d, i) => (
        <div key={d.key} style={{
          display: 'grid',
          gridTemplateColumns: '140px 36px 1fr',
          alignItems: 'center',
          padding: '12px 16px',
          background: i % 2 === 0 ? '#fff' : '#fafbfc',
          borderBottom: '1px solid #f0f2f5',
          gap: 12,
          fontSize: 13,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: 'var(--sf-text)' }}>
            {d.label}
            <InfoTooltip text={d.tip} width={260} />
          </span>
          <span style={{
            fontWeight: 700,
            fontSize: 15,
            color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e',
            textAlign: 'right',
          }}>
            {d.score}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ flex: 1, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${d.score}%`, height: '100%', background: d.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 11, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e', fontWeight: 600, minWidth: 30 }}>
                {d.score >= 80 ? 'Good' : d.score >= 60 ? 'Fair' : 'Low'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--sf-text-muted)' }}>{d.detail}</div>
          </div>
        </div>
      ))}
      <div style={{ padding: '8px 16px', background: '#fafbfc', fontSize: 11, color: 'var(--sf-text-muted)', borderTop: '1px solid #f0f2f5' }}>
        Formula: (Exact Score × 0.4) + (Near Score × 0.4) + (Trend Score × 0.2) = {(72 * 0.4 + 84 * 0.4 + 78 * 0.2).toFixed(0)}
      </div>
    </div>
  );
}

export function ApexLimitBar() {
  const { total, used, duplicated, afterCleanup, usedPct, afterPct, duplicatedPct, urgency } = APEX_LIMIT;
  const urgencyColor = urgency === 'critical' ? '#ea001e' : urgency === 'warning' ? '#fe9339' : '#2e844a';
  const urgencyBg = urgency === 'critical' ? '#fef5f5' : urgency === 'warning' ? '#fefbf0' : '#f5faf5';
  const urgencyIcon = urgency === 'critical' ? '🔴' : urgency === 'warning' ? '⚠️' : '✓';
  const urgencyText = urgency === 'critical'
    ? `Your org is near the Apex character limit. Removing duplicate code would recover ${duplicatedPct}% of capacity.`
    : urgency === 'warning'
      ? `Your org is using ${usedPct}% of the Apex character limit. Duplicate code accounts for ${duplicatedPct}% — removing it would bring usage down to ${afterPct}%.`
      : `Your org has plenty of Apex capacity. Cleaning up duplicates now prevents future issues as your codebase grows.`;

  return (
    <div style={{
      border: `1px solid ${urgencyColor}30`,
      borderRadius: 8,
      background: urgencyBg,
      padding: '14px 18px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{urgencyIcon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: urgencyColor }}>
          Apex Character Limit Usage
        </span>
        <InfoTooltip text="Salesforce orgs have a 6M character limit for Apex code. Duplicate code consumes this capacity unnecessarily. Removing duplicates frees up space for new development." width={280} />
      </div>

      {/* Usage bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ height: 20, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
          {/* After cleanup portion */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${(afterCleanup / total) * 100}%`,
            background: '#0176d3',
            borderRadius: '6px 0 0 6px',
          }} />
          {/* Duplicate portion */}
          <div style={{
            position: 'absolute',
            left: `${(afterCleanup / total) * 100}%`,
            top: 0,
            height: '100%',
            width: `${(duplicated / total) * 100}%`,
            background: urgencyColor,
            opacity: 0.7,
          }} />
          {/* Percentage labels */}
          <div style={{
            position: 'absolute',
            left: 8,
            top: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
          }}>
            {afterPct}% code
          </div>
          <div style={{
            position: 'absolute',
            right: `${100 - (used / total) * 100 + 1}%`,
            top: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
          }}>
            {duplicatedPct}% duplicate
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--sf-text-secondary)', flexWrap: 'wrap' }}>
        <span><strong style={{ color: 'var(--sf-text)' }}>{(used / 1_000_000).toFixed(1)}M</strong> / {(total / 1_000_000).toFixed(0)}M used ({usedPct}%)</span>
        <span><strong style={{ color: urgencyColor }}>{(duplicated / 1_000).toFixed(0)}K</strong> chars are duplicate</span>
        <span>After cleanup: <strong style={{ color: '#2e844a' }}>{(afterCleanup / 1_000_000).toFixed(1)}M</strong> ({afterPct}%)</span>
      </div>

      {/* Message */}
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--sf-text-secondary)', lineHeight: 1.5 }}>
        {urgencyText}
      </div>
    </div>
  );
}
