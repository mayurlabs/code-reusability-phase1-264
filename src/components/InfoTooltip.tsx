import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  width?: number;
}

export function InfoTooltip({ text, width = 260 }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4, verticalAlign: 'middle' }}
    >
      <Info
        size={13}
        color="#0176d3"
        style={{ cursor: 'pointer', opacity: 0.7, flexShrink: 0 }}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        onMouseEnter={(e) => { (e.currentTarget as SVGElement).style.opacity = '1'; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as SVGElement).style.opacity = '0.7'; }}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            width,
            padding: '10px 14px',
            background: '#1b2537',
            color: '#e8ecf1',
            fontSize: 12,
            lineHeight: 1.5,
            borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            zIndex: 999,
            pointerEvents: 'auto',
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1b2537',
            }}
          />
        </div>
      )}
    </span>
  );
}

export const TIP: Record<string, string> = {
  'health-score': 'Shows how well your org standardizes repeated code. Higher score = fewer duplicates, more reusable standards, lower fragmentation.',
  'high-priority': 'Repeated code groups with the highest business impact based on usage, dependency complexity, and duplication density.',
  'reusable-standards': 'Groups where a preferred implementation has been identified as the best version to keep and standardize on.',
  'lower-value': 'Implementations that are weaker, older, or more fragmented — candidates for consolidation or retirement after review.',
  'surfaces': 'The types of Salesforce code analyzed — Apex classes, triggers, LWC JavaScript, SOQL patterns, and more.',
  'duplicate': 'Code nearly identical to another implementation, often from copy-paste reuse across classes or services.',
  'near-duplicate': 'Code very similar to another implementation but with local differences like naming, branching, or object-specific adjustments. In Phase 1, near-duplicate detection focuses on high-confidence structural matches.',
  'preferred': 'The implementation recommended as the best version to standardize on, based on structural quality, dependency profile, and usage signals.',
  'pattern-family': 'Implementations that are not literal copies but solve the same business capability with enough structural and logical overlap to review together. In Phase 1, only high-confidence pattern families are surfaced — broad semantic inference is reserved for later phases.',
  'recommendation': 'The suggested next step — keep the best version, merge variants, review before acting, or monitor over time.',
  'runtime-priority': 'How important this pattern is based on runtime activity. Higher priority = affects more active business flows.',
  'dep-graph': 'Shows what calls this code (inbound) and what it relies on (outbound). Use this to assess consolidation or retirement safety.',
  'inbound': 'Other classes, triggers, or flows that call this implementation. More inbound callers = more risk if this code changes.',
  'outbound': 'Utilities, services, or frameworks this implementation depends on. Changes to these may affect this code.',
  'dep-risk': 'Likelihood that changing this code could break something. Low = safe, Moderate = some callers need updating, High = change carefully.',
  'migration-ready': 'Whether dependent callers can be safely redirected to the preferred version now, or need migration work first.',
  'standardize': 'Use this as the preferred reusable version. Other variants should eventually be consolidated into this one.',
  'consolidate': 'Merge repeated implementations into one shared pattern. Requires developer review — not an automatic refactor.',
  'retire': 'This variant may be retired later, but only after verifying all dependent callers have been migrated to the preferred version. Retirement is never automatic — it always requires review and caller migration first.',
  'review': 'Needs human validation before action. The analysis found similarity but cannot fully confirm the recommended action.',
  'monitor': 'Worth tracking over time, but may not need immediate action.',
  'score-delta': 'Change vs the previous scan. Positive = your org is improving its code reuse posture.',
  'audit-log': 'Record of all scans — who ran them, when, and what the results were. Use for governance and tracking.',
  'code-identical': 'This line is identical across implementations — duplicate logic safe to keep once.',
  'code-similar': 'Same intent, slightly different syntax — minor cleanup may be needed.',
  'code-different': 'Fundamentally different approach — needs review before consolidation.',
  'code-unique': 'Only exists in this implementation — evaluate whether to adopt everywhere or remove.',
  'why-grouped': 'Explains why these implementations were grouped together — shared business purpose, overlapping logic, or common patterns.',
};
