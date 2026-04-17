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
  'health-score': 'Shows how well your org manages duplicate code. Higher score = less duplication, more cleanup done, cleaner codebase.',
  'clone-groups': 'The total number of duplicate code groups found. Each group contains 2 or more copies of the same or very similar code.',
  'exact-duplicates': 'Files or methods that are identical or nearly identical copies. These are the easiest to clean up — delete all but one and redirect callers.',
  'near-duplicates': 'Methods or code blocks that are very similar but have small differences like different parameter names, filter values, or error handling. These need review before consolidating.',
  'chars-saved': 'The total amount of duplicate code measured in characters. Removing these duplicates would reduce your codebase by this amount.',
  'tier': 'The confidence and impact level of this clone group. HIGH = high confidence, significant impact. MEDIUM = moderate. LOW = lower priority.',
  'level': 'The granularity of duplication detected. File = entire file is duplicated. Method = a specific method is duplicated across files. Block = a code block within a method is duplicated.',
  'category': 'The semantic type of the duplicated code. Examples: business_logic, data_access_logic, file_duplicate, orchestration, simple_logic, trivial_accessor.',
  'effort': 'The estimated refactoring effort to remove this duplication. LOW = simple deletion. MEDIUM = extract shared method. HIGH = complex restructuring.',
  'recipe': 'The recommended refactoring action — what to do with this duplicate code. Examples: delete duplicate file, extract shared method, extract and parameterize.',
  'copies': 'How many copies of this code exist. All copies contain the same or very similar logic.',
  'representative': 'The copy that should be kept as the surviving version. Other copies should be removed or consolidated into this one.',
  'safe-to-remove': 'Whether this copy can be safely deleted. Depends on how many callers reference it and whether they can be redirected.',
  'referenced-by': 'Other classes, triggers, or components that call or import this file/method. These callers need to be redirected before the copy can be removed.',
  'score': 'A 0-100 confidence score for this clone group. Higher = more confident that this is true duplication worth addressing.',
  'score-delta': 'Change vs the previous scan. Positive = your org reduced duplication since the last scan.',
  'surfaces': 'The types of Salesforce code analyzed — Apex classes, triggers, LWC JavaScript, SOQL patterns.',
  'recommendation': 'The suggested refactoring action for this group.',
  'audit-log': 'Record of all scans — who ran them, when, and what the results were.',
};
