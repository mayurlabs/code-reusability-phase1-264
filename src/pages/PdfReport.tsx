import React from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { scanReports, cloneGroups, scoreHistory } from '../data/mockData';
import type { CloneGroup, CloneCopy } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { SCORE_DIMENSIONS, APEX_LIMIT } from '../components/ScoreBreakdown';

interface Props {
  onBack: () => void;
}

const TIER_COLORS: Record<string, string> = {
  HIGH: '#ea001e',
  MEDIUM: '#fe9339',
  LOW: '#2e844a',
};

const LEVEL_LABELS: Record<string, string> = {
  file: 'FILE',
  method: 'METHOD',
  block: 'BLOCK',
};

const report = scanReports[0];

function fmt(n: number): string {
  return n.toLocaleString();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

const fileGroups = cloneGroups.filter((g) => g.level === 'file');
const methodGroups = cloneGroups.filter((g) => g.level === 'method');
const blockGroups = cloneGroups.filter((g) => g.level === 'block');

const allSorted = [...cloneGroups].sort((a, b) => {
  const tierOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return tierOrder[a.tier] - tierOrder[b.tier];
});

const maxCharsSaved = Math.max(...cloneGroups.map((g) => g.charsSaved));

const totalCharsSaved = 424685;
const totalCodebaseChars = 2400000;

const GLOSSARY: [string, string][] = [
  ['Clone Group', 'A set of code fragments identified as duplicates or near-duplicates of each other.'],
  ['Exact Duplicate', 'Code fragments that are byte-identical except for whitespace and class/method names.'],
  ['Near Duplicate', 'Code fragments that share the same structure but have minor differences in parameters, field references, or error handling.'],
  ['Tier', 'Priority ranking (HIGH, MEDIUM, LOW) based on impact, change frequency, and risk.'],
  ['Level', 'The granularity of the duplicate: File (entire file), Method (single method), or Block (code block within a method).'],
  ['Category', 'The classification of duplicated code: business_logic, data_access, file_duplicate, orchestration, simple_logic, or trivial_accessor.'],
  ['Effort', 'Estimated cleanup effort: LOW (delete/redirect), MEDIUM (extract & parameterize), HIGH (complex refactoring).'],
  ['Recipe', 'The recommended approach for eliminating the duplication.'],
  ['Representative', 'The canonical copy of the code — the version to keep when eliminating duplicates.'],
  ['Characters Saved', 'The total number of characters that would be removed from the codebase if all redundant copies were deleted.'],
  ['Safe to Remove', 'Whether a copy can be deleted without breaking other code. Based on caller analysis and dependency checking.'],
];

function calcBeforeAfter(group: CloneGroup) {
  const repChars = group.representative.charCount;
  const before = repChars * group.copies;
  const after = repChars;
  return { before, after, savings: before - after };
}

function CodeBlock({ lines, maxLines }: { lines: string[]; maxLines?: number }) {
  const display = maxLines ? lines.slice(0, maxLines) : lines;
  return (
    <div style={{
      background: '#1e293b',
      color: '#e2e8f0',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: 11,
      lineHeight: 1.5,
      borderRadius: 4,
      overflow: 'auto',
      padding: '12px 0',
    }}>
      {display.map((line, i) => (
        <div key={i} style={{ display: 'flex', padding: '0 12px', minHeight: 18 }}>
          <span style={{ color: '#64748b', minWidth: 32, textAlign: 'right', marginRight: 12, userSelect: 'none' }}>
            {i + 1}
          </span>
          <span style={{ whiteSpace: 'pre' }}>{line}</span>
        </div>
      ))}
      {maxLines && lines.length > maxLines && (
        <div style={{ padding: '4px 12px', color: '#64748b', fontStyle: 'italic' }}>
          ... {lines.length - maxLines} more lines
        </div>
      )}
    </div>
  );
}

function DiffView({ representative, copy }: { representative: CloneCopy; copy: CloneCopy }) {
  const diffs = copy.differences || [];
  const repLines = representative.code;
  const copyLines = copy.code;

  const diffLineSetRep = new Set<number>();
  const diffLineSetCopy = new Set<number>();

  for (const diff of diffs) {
    const rangeParts = diff.lineRange.split('-');
    const start = parseInt(rangeParts[0], 10);
    const end = rangeParts.length > 1 ? parseInt(rangeParts[1], 10) : start;
    for (let i = start; i <= end; i++) {
      diffLineSetRep.add(i);
      diffLineSetCopy.add(i);
    }
  }

  const paneStyle: React.CSSProperties = {
    flex: 1,
    background: '#1e293b',
    borderRadius: 4,
    overflow: 'auto',
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    fontSize: 10,
    lineHeight: 1.5,
    padding: '8px 0',
    minWidth: 0,
  };

  const renderLines = (lines: string[], diffSet: Set<number>, borderColor: string) =>
    lines.map((line, i) => {
      const lineNum = i + 1;
      const isDiff = diffSet.has(lineNum);
      return (
        <div key={i} style={{
          display: 'flex',
          padding: '0 8px',
          minHeight: 16,
          borderLeft: isDiff ? `3px solid ${borderColor}` : '3px solid transparent',
          background: isDiff ? `${borderColor}15` : 'transparent',
        }}>
          <span style={{ color: '#64748b', minWidth: 24, textAlign: 'right', marginRight: 8, userSelect: 'none', fontSize: 10 }}>
            {lineNum}
          </span>
          <span style={{ color: '#e2e8f0', whiteSpace: 'pre' }}>{line}</span>
        </div>
      );
    });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, fontSize: 11, marginBottom: 6, color: '#54698d' }}>
        <div style={{ flex: 1 }}>Representative: <strong style={{ color: '#181818' }}>{representative.fileName}</strong></div>
        <div style={{ flex: 1 }}>Copy: <strong style={{ color: '#181818' }}>{copy.fileName}</strong></div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={paneStyle}>{renderLines(repLines, diffLineSetRep, '#2e844a')}</div>
        <div style={paneStyle}>{renderLines(copyLines, diffLineSetCopy, '#ea001e')}</div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#54698d' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderLeft: '3px solid #2e844a', marginRight: 4 }} /> Representative differs</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderLeft: '3px solid #ea001e', marginRight: 4 }} /> Copy differs</span>
        <span style={{ color: '#8a9bb5' }}>(no highlight) = Identical lines</span>
      </div>

      {diffs.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#54698d' }}>
          <strong style={{ color: '#181818' }}>Differences:</strong>
          {diffs.map((d, i) => (
            <div key={i} style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid #d8dde6' }}>
              <span style={{ fontWeight: 600 }}>Lines {d.lineRange}:</span> {d.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      color: TIER_COLORS[tier],
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {tier}
    </span>
  );
}

function SmallBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 600,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 3,
      padding: '1px 5px',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    }}>
      {label}
    </span>
  );
}

function FindingCard({ group, index }: { group: CloneGroup; index: number }) {
  const { before, after, savings } = calcBeforeAfter(group);
  const tierColor = TIER_COLORS[group.tier];
  const barWidth = Math.max(5, (group.charsSaved / maxCharsSaved) * 100);

  return (
    <div style={{
      border: '1px solid #d8dde6',
      borderLeft: `4px solid ${tierColor}`,
      borderRadius: 4,
      padding: 24,
      marginBottom: 20,
      pageBreakInside: 'avoid',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#181818', marginBottom: 6 }}>
            #{index + 1} &middot; {group.name}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <TierBadge tier={group.tier} />
            <SmallBadge label={LEVEL_LABELS[group.level]} color="#0176d3" />
            <SmallBadge label={`${group.effort} effort`} color={TIER_COLORS[group.effort]} />
            <span style={{ fontSize: 11, color: '#54698d' }}>{group.copies} copies</span>
            {group.isExact
              ? <SmallBadge label="EXACT" color="#2e844a" />
              : <SmallBadge label="NEAR" color="#fe9339" />}
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#181818' }}>
          {group.score}
        </div>
      </div>

      {/* Recipe */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Recipe
        </div>
        <div style={{
          background: '#f4f6f9',
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: 12,
          color: '#181818',
          lineHeight: 1.5,
        }}>
          {group.recipe}
        </div>
      </div>

      {/* Impact */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Impact
        </div>
        <div style={{
          height: 6,
          background: '#e5e7eb',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 6,
        }}>
          <div style={{ width: `${barWidth}%`, height: '100%', background: tierColor, borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 11, color: '#54698d', lineHeight: 1.6 }}>
          Before: {fmt(before)} chars ({group.copies} copies) → After: {fmt(after)} chars (1 copy)<br />
          Savings: <strong style={{ color: '#181818' }}>{fmt(savings)} chars</strong><br />
          Workflows: {group.whereItAppears.join(', ')}
        </div>
      </div>

      {/* Criticality Signals */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Why This Is {group.tier} Priority
        </div>
        {group.criticalitySignals.map((sig, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 11, lineHeight: 1.5 }}>
            <span>{sig.icon}</span>
            <span>
              <strong style={{ color: '#181818' }}>{sig.label}</strong>
              <span style={{ color: '#54698d' }}> — {sig.detail}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Copies table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Copies
        </div>
        <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #d8dde6' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#54698d', fontWeight: 600 }}>File Name</th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#54698d', fontWeight: 600 }}>Callers</th>
              <th style={{ textAlign: 'center', padding: '4px 8px', color: '#54698d', fontWeight: 600 }}>Safe to Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#fafbfc' }}>
              <td style={{ padding: '4px 8px', fontWeight: 600 }}>
                {group.representative.fileName}
                <span style={{ fontSize: 9, color: '#0176d3', marginLeft: 4 }}>(representative)</span>
              </td>
              <td style={{ padding: '4px 8px', color: '#54698d' }}>{group.representative.referencedBy.join(', ')}</td>
              <td style={{ textAlign: 'center', padding: '4px 8px' }}>—</td>
            </tr>
            {group.cloneCopies.map((copy, i) => (
              <tr key={copy.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '4px 8px' }}>{copy.fileName}</td>
                <td style={{ padding: '4px 8px', color: '#54698d' }}>{copy.referencedBy.join(', ')}</td>
                <td style={{ textAlign: 'center', padding: '4px 8px', color: copy.safeToRemove ? '#2e844a' : '#ea001e', fontWeight: 600 }}>
                  {copy.safeToRemove ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Code */}
      {group.isExact ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Code <span style={{ fontWeight: 400, textTransform: 'none' }}>(shown once — all copies identical)</span>
          </div>
          <CodeBlock lines={group.representative.code} maxLines={30} />
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Code Comparison
          </div>
          {group.cloneCopies.map((copy) => (
            <div key={copy.id} style={{ marginBottom: 12 }}>
              <DiffView representative={group.representative} copy={copy} />
            </div>
          ))}
        </div>
      )}

      {/* Next Steps */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Recommended Next Steps
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: '#181818', lineHeight: 1.7 }}>
          {group.nextSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      fontSize: 16,
      fontWeight: 700,
      color: '#181818',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: '2px solid #181818',
      paddingBottom: 8,
      marginTop: 40,
      marginBottom: 8,
      pageBreakBefore: 'always',
    }}>
      {label} <span style={{ fontSize: 13, color: '#54698d', fontWeight: 500 }}>({count} groups)</span>
    </div>
  );
}

function PageFooter({ section }: { section: string }) {
  return (
    <div style={{
      borderTop: '1px solid #d8dde6',
      marginTop: 32,
      paddingTop: 8,
      fontSize: 10,
      color: '#8a9bb5',
      textAlign: 'center',
    }}>
      Code Reuse Intelligence Report — Northstar Retail Group — Mar 2026 — {section}
    </div>
  );
}

export default function PdfReport({ onBack }: Props) {
  const { showToast } = useAppContext();

  const handlePrint = () => {
    window.print();
    showToast('Print dialog opened', 'info');
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Print-hide styles */}
      <style>{`
        @media print {
          .pdf-topbar { display: none !important; }
          .pdf-paper {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            max-width: 100% !important;
          }
          body { background: #fff !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="pdf-topbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #d8dde6',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: '#0176d3',
              fontWeight: 600,
              padding: '4px 0',
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#181818' }}>PDF Report Preview</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff',
              border: '1px solid #d8dde6',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#181818',
            }}
          >
            <Download size={14} />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#0176d3',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* Paper container */}
      <div className="pdf-paper" style={{
        maxWidth: 800,
        margin: '24px auto',
        background: '#fff',
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
        borderRadius: 4,
        padding: '48px 48px 32px',
      }}>

        {/* ── SCAN DETAILS ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#181818', letterSpacing: '0.5px' }}>
            Code Reuse Intelligence Report
          </div>
          <div style={{ fontSize: 12, color: '#54698d', marginTop: 4 }}>
            Clone Detection Analysis — {report.name}
          </div>
        </div>

        <div style={{
          border: '1px solid #d8dde6',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          <div style={{
            background: '#fafbfc',
            padding: '8px 16px',
            fontSize: 10,
            fontWeight: 700,
            color: '#54698d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '1px solid #d8dde6',
          }}>
            Scan Details
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
          }}>
            {([
              ['Org Name', 'Northstar Retail Group'],
              ['Org ID', report.orgId],
              ['Environment', report.environment],
              ['Scan Date', fmtDate(report.startTime)],
              ['Completed', fmtDate(report.endTime)],
              ['Requested By', report.requestedBy],
              ['Scope', report.scope.join(', ')],
              ['Report Version', report.reportVersion],
              ['Status', report.status],
            ] as [string, string][]).map(([label, value], i) => (
              <div key={label} style={{
                padding: '10px 16px',
                borderBottom: i < 6 ? '1px solid #f0f2f5' : 'none',
                borderRight: (i + 1) % 3 !== 0 ? '1px solid #f0f2f5' : 'none',
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9bb5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: 12, color: '#181818', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <PageFooter section="Page 1" />

        {/* ── APEX CHARACTER LIMIT ── */}
        <div style={{ marginBottom: 32, padding: 16, border: '1px solid #fe933940', borderRadius: 6, background: '#fefbf0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#b86e00', marginBottom: 8 }}>
            ⚠️ Apex Character Limit Usage
          </div>
          <div style={{ height: 16, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(APEX_LIMIT.afterCleanup / APEX_LIMIT.total) * 100}%`, background: '#0176d3', borderRadius: '4px 0 0 4px' }} />
            <div style={{ position: 'absolute', left: `${(APEX_LIMIT.afterCleanup / APEX_LIMIT.total) * 100}%`, top: 0, height: '100%', width: `${(APEX_LIMIT.duplicated / APEX_LIMIT.total) * 100}%`, background: '#fe9339', opacity: 0.7 }} />
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 11, color: '#555' }}>
            <span><strong>{(APEX_LIMIT.used / 1_000_000).toFixed(1)}M</strong> / {(APEX_LIMIT.total / 1_000_000).toFixed(0)}M used ({APEX_LIMIT.usedPct}%)</span>
            <span><strong style={{ color: '#b86e00' }}>{(APEX_LIMIT.duplicated / 1_000).toFixed(0)}K</strong> chars are duplicate</span>
            <span>After cleanup: <strong style={{ color: '#2e844a' }}>{(APEX_LIMIT.afterCleanup / 1_000_000).toFixed(1)}M</strong> ({APEX_LIMIT.afterPct}%)</span>
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
            Your org uses {APEX_LIMIT.usedPct}% of the 6M Apex character limit. Removing duplicate code would free {APEX_LIMIT.duplicatedPct}% of total capacity and bring usage to {APEX_LIMIT.afterPct}%.
          </div>
        </div>

        {/* ── EXECUTIVE SUMMARY ── */}
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#181818',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          borderBottom: '2px solid #181818',
          paddingBottom: 8,
          marginTop: 40,
          marginBottom: 20,
        }}>
          Executive Summary
        </div>

        {/* Health Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '4px solid #0176d3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: '#181818',
          }}>
            78
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#181818' }}>Health Score</div>
            <div style={{
              display: 'inline-block',
              background: '#e8fbe8',
              color: '#2e844a',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              marginTop: 4,
            }}>
              +9 vs previous
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', marginBottom: 10 }}>
            Score Breakdown
          </div>
          {SCORE_DIMENSIONS.map((d) => (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ width: 130, fontSize: 12, color: '#181818', fontWeight: 500 }}>{d.label}</span>
              <span style={{ width: 28, fontSize: 13, fontWeight: 700, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e', textAlign: 'right' }}>
                {d.score}
              </span>
              <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${d.score}%`, height: '100%', background: d.color, borderRadius: 4 }} />
              </div>
              <span style={{ width: 32, fontSize: 10, fontWeight: 600, color: d.score >= 80 ? '#2e844a' : d.score >= 60 ? '#b86e00' : '#ea001e' }}>
                {d.score >= 80 ? 'Good' : d.score >= 60 ? 'Fair' : 'Low'}
              </span>
            </div>
          ))}
        </div>

        {/* Key Numbers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginBottom: 24,
          border: '1px solid #d8dde6',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          {([
            ['Files Analyzed', '785'],
            ['Clone Groups', '318'],
            ['Exact Dupes', '150'],
            ['Near Dupes', '168'],
            ['Chars Saved', fmt(totalCharsSaved)],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #f0f2f5' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#181818' }}>{value}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#8a9bb5', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Level breakdown */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#54698d', textTransform: 'uppercase', marginBottom: 8 }}>
            Level Breakdown
          </div>
          {([
            ['File-level', 142, '#ea001e'],
            ['Method-level', 126, '#fe9339'],
            ['Block-level', 50, '#0176d3'],
          ] as [string, number, string][]).map(([label, count, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ width: 100, fontSize: 12, color: '#181818' }}>{label}</span>
              <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(count / 318) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
              </div>
              <span style={{ width: 50, fontSize: 12, fontWeight: 600, color: '#181818', textAlign: 'right' }}>{count} groups</span>
            </div>
          ))}
        </div>

        {/* Org-level impact */}
        <div style={{
          background: '#f4f6f9',
          borderRadius: 4,
          padding: '12px 16px',
          fontSize: 12,
          color: '#181818',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          <strong>Org-level impact:</strong> Total org codebase: ~{(totalCodebaseChars / 1000000).toFixed(1)}M characters.
          Removing all identified duplicates would reduce it by {fmt(totalCharsSaved)} characters
          ({((totalCharsSaved / totalCodebaseChars) * 100).toFixed(1)}%).
        </div>

        <PageFooter section="Page 2" />

        {/* ── FINDINGS SUMMARY TABLE ── */}
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#181818',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          borderBottom: '2px solid #181818',
          paddingBottom: 8,
          marginTop: 40,
          marginBottom: 16,
        }}>
          All Findings
        </div>

        <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #d8dde6' }}>
              <th style={{ textAlign: 'left', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>#</th>
              <th style={{ textAlign: 'left', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>Finding</th>
              <th style={{ textAlign: 'left', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>Level</th>
              <th style={{ textAlign: 'left', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>Tier</th>
              <th style={{ textAlign: 'center', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>Copies</th>
              <th style={{ textAlign: 'left', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>Effort</th>
              <th style={{ textAlign: 'right', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10 }}>Chars Saved</th>
              <th style={{ textAlign: 'left', padding: '6px 6px', color: '#54698d', fontWeight: 700, fontSize: 10, maxWidth: 180 }}>Recipe</th>
            </tr>
          </thead>
          <tbody>
            {allSorted.map((g, i) => (
              <tr key={g.id} style={{ borderBottom: '1px solid #f0f2f5', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '5px 6px', color: '#54698d' }}>{i + 1}</td>
                <td style={{ padding: '5px 6px', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</td>
                <td style={{ padding: '5px 6px', color: '#0176d3', fontSize: 10, fontWeight: 600 }}>{LEVEL_LABELS[g.level]}</td>
                <td style={{ padding: '5px 6px' }}><TierBadge tier={g.tier} /></td>
                <td style={{ padding: '5px 6px', textAlign: 'center' }}>{g.copies}</td>
                <td style={{ padding: '5px 6px', fontSize: 10, color: TIER_COLORS[g.effort] }}>{g.effort}</td>
                <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600 }}>{fmt(g.charsSaved)}</td>
                <td style={{ padding: '5px 6px', fontSize: 10, color: '#54698d', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.recipe}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter section="Page 3" />

        {/* ── SECTION A: FILE-LEVEL ── */}
        <SectionHeader label="Section A: File-Level Duplicates" count={fileGroups.length} />
        <div style={{ fontSize: 12, color: '#54698d', marginBottom: 20, lineHeight: 1.5 }}>
          Entire files that are identical or nearly identical. Most can be removed with LOW effort.
        </div>
        {fileGroups.map((g, i) => (
          <FindingCard key={g.id} group={g} index={i} />
        ))}
        <PageFooter section="Section A" />

        {/* ── SECTION B: METHOD-LEVEL ── */}
        <SectionHeader label="Section B: Method-Level Duplicates" count={methodGroups.length} />
        <div style={{ fontSize: 12, color: '#54698d', marginBottom: 20, lineHeight: 1.5 }}>
          Methods within different classes that contain identical or very similar code. Most require extracting a shared method.
        </div>
        {methodGroups.map((g, i) => (
          <FindingCard key={g.id} group={g} index={fileGroups.length + i} />
        ))}
        <PageFooter section="Section B" />

        {/* ── SECTION C: BLOCK-LEVEL ── */}
        <SectionHeader label="Section C: Block-Level Duplicates" count={blockGroups.length} />
        <div style={{ fontSize: 12, color: '#54698d', marginBottom: 20, lineHeight: 1.5 }}>
          Repeated code blocks within methods — loop patterns, conditional branches, or query construction.
        </div>
        {blockGroups.length === 0 ? (
          <div style={{
            border: '1px solid #d8dde6',
            borderRadius: 4,
            padding: '24px 32px',
            textAlign: 'center',
            color: '#8a9bb5',
            fontSize: 12,
            fontStyle: 'italic',
          }}>
            No block-level duplicates detected in this scan.
          </div>
        ) : (
          blockGroups.map((g, i) => (
            <FindingCard key={g.id} group={g} index={fileGroups.length + methodGroups.length + i} />
          ))
        )}
        <PageFooter section="Section C" />

        {/* ── GLOSSARY ── */}
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#181818',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          borderBottom: '2px solid #181818',
          paddingBottom: 8,
          marginTop: 40,
          marginBottom: 16,
        }}>
          Glossary
        </div>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            {GLOSSARY.map(([term, def], i) => (
              <tr key={term} style={{ borderBottom: '1px solid #f0f2f5', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#181818', width: 160, verticalAlign: 'top' }}>{term}</td>
                <td style={{ padding: '8px 12px', color: '#54698d', lineHeight: 1.5 }}>{def}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter section="Glossary" />

      </div>
    </div>
  );
}
