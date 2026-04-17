import { InfoTooltip } from './InfoTooltip';

export const SCORE_DIMENSIONS = [
  { key: 'duplication', label: 'Duplicate Code', score: 72, color: '#0176d3', tip: 'How much duplicate code exists in your org. Less duplication = higher score.' },
  { key: 'cleanup', label: 'Easy to Clean Up', score: 81, color: '#2e844a', tip: 'How many duplicates can be removed with low effort (simple file deletions). More easy wins = higher score.' },
  { key: 'risk', label: 'Cleanup Risk', score: 68, color: '#fe9339', tip: 'How many other files depend on the duplicates. Fewer dependencies to redirect = lower risk = higher score.' },
  { key: 'progress', label: 'Improvement Trend', score: 85, color: '#9050e9', tip: 'How much duplication your org has reduced over the last 3 scans. More reduction = higher score.' },
];

interface ScoreBreakdownProps {
  compact?: boolean;
}

export function ScoreBreakdown({ compact = false }: ScoreBreakdownProps) {
  if (compact) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
        {SCORE_DIMENSIONS.map((d) => (
          <div key={d.key} style={{ fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ color: 'var(--sf-text-secondary)', fontWeight: 500 }}>{d.label}</span>
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
        <InfoTooltip text="Your Health Score (78) is based on these 4 factors. Focus on the lowest-scoring area for the biggest improvement." width={260} />
      </div>
      {SCORE_DIMENSIONS.map((d, i) => (
        <div key={d.key} style={{
          display: 'grid',
          gridTemplateColumns: '140px 36px 1fr',
          alignItems: 'center',
          padding: '10px 16px',
          background: i % 2 === 0 ? '#fff' : '#fafbfc',
          borderBottom: '1px solid #f0f2f5',
          gap: 12,
          fontSize: 13,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: 'var(--sf-text)' }}>
            {d.label}
            <InfoTooltip text={d.tip} width={240} />
          </span>
          <span style={{
            fontWeight: 700,
            fontSize: 14,
            color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e',
            textAlign: 'right',
          }}>
            {d.score}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${d.score}%`, height: '100%', background: d.color, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 11, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e', fontWeight: 600, minWidth: 30 }}>
              {d.score >= 80 ? 'Good' : d.score >= 60 ? 'Fair' : 'Low'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
