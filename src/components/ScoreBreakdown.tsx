import { InfoTooltip } from './InfoTooltip';

export const SCORE_DIMENSIONS = [
  { key: 'duplication', label: 'Code Duplication', score: 72, color: '#0176d3', tip: 'Volume of duplicate code detected across your org. Less duplication = higher score.' },
  { key: 'cleanup', label: 'Cleanup Readiness', score: 81, color: '#2e844a', tip: 'How many duplicates have LOW effort recipes (simple deletions). More easy wins = higher score.' },
  { key: 'changeRisk', label: 'Change Risk', score: 68, color: '#fe9339', tip: 'How many callers need to be redirected when duplicates are removed. Fewer redirects = higher score.' },
  { key: 'testing', label: 'Test Efficiency', score: 85, color: '#9050e9', tip: 'How much duplicate test coverage exists. Less duplicate testing = higher score.' },
  { key: 'refs', label: 'Reference Safety', score: 79, color: '#0891b2', tip: 'How safely callers can be redirected to surviving copies. Cleaner references = higher score.' },
  { key: 'compliance', label: 'Compliance', score: 90, color: '#2e844a', tip: 'Whether duplicates create governance or audit concerns. Fewer concerns = higher score.' },
];

interface ScoreBreakdownProps {
  compact?: boolean;
}

export function ScoreBreakdown({ compact = false }: ScoreBreakdownProps) {
  if (compact) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 10 }}>
        {SCORE_DIMENSIONS.map((d) => (
          <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ color: 'var(--sf-text-secondary)', fontWeight: 500 }}>{d.label}</span>
                <span style={{ fontWeight: 700, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#fe9339' : '#ea001e', fontSize: 11 }}>{d.score}</span>
              </div>
              <div style={{ height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${d.score}%`, height: '100%', background: d.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--sf-border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
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
        <InfoTooltip text="Your Code Reuse Health Score (78) is a weighted composite of these 6 dimensions. Focus on the lowest-scoring areas for the biggest improvement." width={280} />
      </div>
      {SCORE_DIMENSIONS.map((d, i) => (
        <div key={d.key} style={{
          display: 'grid',
          gridTemplateColumns: '150px 40px 1fr',
          alignItems: 'center',
          padding: '8px 16px',
          background: i % 2 === 0 ? '#fff' : '#fafbfc',
          borderBottom: '1px solid #f0f2f5',
          gap: 12,
          fontSize: 12,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: 'var(--sf-text)' }}>
            {d.label}
            <InfoTooltip text={d.tip} width={240} />
          </span>
          <span style={{
            fontWeight: 700,
            fontSize: 13,
            color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e',
            textAlign: 'right',
          }}>
            {d.score}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${d.score}%`,
                height: '100%',
                background: d.color,
                borderRadius: 4,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 10, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e', fontWeight: 600, minWidth: 30 }}>
              {d.score >= 80 ? 'Good' : d.score >= 60 ? 'Fair' : 'Low'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
