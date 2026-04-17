import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Target,
  BookOpen,
  Layers,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

const sectionIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionHeaderRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
};

const paragraph: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: 'var(--sf-text)',
  margin: '0 0 14px',
};

const subheading: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--sf-text)',
  margin: '24px 0 8px',
};

const comparisonTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  lineHeight: 1.55,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontWeight: 700,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
};

const stepCircle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0176d3, #1b96ff)',
  color: '#fff',
  fontWeight: 800,
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const scoreBand = (range: string, color: string, label: string, description: string) => (
  <div
    key={range}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
    }}
  >
    <span
      style={{
        display: 'inline-block',
        minWidth: 56,
        padding: '3px 10px',
        borderRadius: 6,
        background: color,
        color: '#fff',
        fontWeight: 700,
        fontSize: 12,
        textAlign: 'center',
      }}
    >
      {range}
    </span>
    <div>
      <strong style={{ fontSize: 13, color: 'var(--sf-text)' }}>{label}</strong>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{description}</div>
    </div>
  </div>
);

const highlightDot = (color: string, label: string, description: string) => (
  <div
    key={label}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
    }}
  >
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        background: color,
        flexShrink: 0,
        marginTop: 3,
      }}
    />
    <div>
      <strong style={{ fontSize: 13, color: 'var(--sf-text)' }}>{label}</strong>
      <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>{description}</span>
    </div>
  </div>
);

const COMPARISON_ROWS = [
  ['Detection levels', 'File-level only', 'File, method, and block level (L0-L3)'],
  ['Classification', 'No classification', 'business_logic, data_access_logic, orchestration, etc.'],
  ['Refactoring guidance', '"These look similar"', 'Specific recipes: delete, extract, parameterize'],
  ['Caller analysis', 'None', 'Shows who references each copy, safe-to-remove assessment'],
  ['Effort estimation', 'None', 'LOW / MEDIUM / HIGH effort per group'],
  ['Progress tracking', 'No', 'Score trend over time with improvement metrics'],
];

const GLOSSARY: [string, string][] = [
  ['Clone Group', 'A set of 2 or more files, methods, or blocks that contain identical or nearly identical code.'],
  ['Exact Duplicate', 'Code that is identical across copies — can be deleted without code changes.'],
  ['Near Duplicate', 'Code that is very similar but has small differences — needs review before consolidating.'],
  ['Representative', 'The copy recommended to keep as the surviving version.'],
  ['Tier', 'Confidence/impact level: HIGH, MEDIUM, LOW.'],
  ['Level', 'Detection granularity: file (entire file duplicated), method (specific method), block (code block within a method).'],
  ['Category', 'Semantic classification: business_logic, data_access_logic, file_duplicate, orchestration, simple_logic, trivial_accessor.'],
  ['Effort', 'Estimated refactoring complexity: LOW (simple deletion), MEDIUM (extract method), HIGH (complex restructuring).'],
  ['Refactoring Recipe', 'The recommended action to remove duplication.'],
  ['Score', '0-100 confidence score for each clone group.'],
  ['Characters Saved', 'Total duplicate code measured in characters.'],
  ['Referenced By', 'Other classes or components that call or import this code.'],
  ['Safe to Remove', 'Whether a copy can be deleted without breaking dependent code.'],
  ['Health Score', 'Composite score measuring overall code duplication in your org.'],
  ['Scan', 'An analysis of your org\'s codebase to find duplicate code.'],
];

const STEPS: { title: string; bullets: string[] }[] = [
  {
    title: 'Generate a Clone Detection Scan',
    bullets: [
      'Go to Code Reusability in Setup.',
      'Select your environment and scope.',
      'Click "Generate Report."',
      'Wait for the scan to complete (typically 5–15 minutes).',
    ],
  },
  {
    title: 'Review the Summary',
    bullets: [
      'Check your Code Reuse Health Score and how it changed.',
      'Review the clone groups found, and the exact vs near duplicate split.',
      'Look at characters saved to understand the scale of duplication.',
    ],
  },
  {
    title: 'Start with Easy Wins',
    bullets: [
      'Focus on exact duplicates first — these are identical copies with LOW effort.',
      'Delete all but one copy and redirect callers to the representative.',
      'File-level duplicates are the safest starting point.',
    ],
  },
  {
    title: 'Review Near Duplicates',
    bullets: [
      'Open near-duplicate groups and compare the representative with each copy.',
      'Check the highlighted differences to understand what varies.',
      'Pick the recommended recipe: extract shared method or parameterize.',
    ],
  },
  {
    title: 'Ask Agentforce for Guidance',
    bullets: [
      'Click the Agentforce icon in the header.',
      'Ask questions like "Is it safe to remove this copy?" or "What should I clean up first?"',
      'Get conversational guidance with step-by-step recommendations.',
    ],
  },
  {
    title: 'Track Progress',
    bullets: [
      'Run regular scans (monthly recommended).',
      'Monitor your score trend over time.',
      'Share reports with your architecture team for governance reviews.',
    ],
  },
];

export default function PlaybookPage({ onBack }: Props) {
  return (
    <div>
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
        <span>HOW TO USE THIS REPORT</span>
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

      {/* ── Page Header ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              ...sectionIcon,
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0176d3, #1b96ff)',
            }}
          >
            <BookOpen size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--sf-text)', margin: 0 }}>
              How to Use This Report
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.6, maxWidth: 680 }}>
              A complete guide to understanding your Clone Detection scan, interpreting scores and
              clone groups, and taking action to eliminate duplicate code in your org.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 1: What is Code Reusability? ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={sectionHeaderRow}>
          <div style={{ ...sectionIcon, background: '#eef6ff' }}>
            <Layers size={20} color="#0176d3" />
          </div>
          <h2 className="sf-section-title" style={{ margin: 0 }}>
            <span style={{ color: '#6b7280', fontWeight: 600, marginRight: 8 }}>1.</span>
            What is Clone Detection?
          </h2>
        </div>
        <p style={paragraph}>
          Clone Detection is a Salesforce-native tool that scans your Apex codebase to find
          duplicate code and recommend how to eliminate it. Instead of reviewing thousands of
          files manually, it does the heavy lifting for you.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Scans your Salesforce Apex codebase to find duplicate code — files, methods, and blocks that are identical or nearly identical.',
            'Detects 4 levels: L0 (file-level), L1 (exact method), L2 (fuzzy method), L3 (block-level).',
            'Provides actionable refactoring recipes: delete duplicate, extract shared method, parameterize.',
            'Tracks cleanup progress with a health score over time.',
          ].map((text, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--sf-text)' }}>{text}</li>
          ))}
        </ul>
      </div>

      {/* ── Section 2: Why This Matters ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={sectionHeaderRow}>
          <div style={{ ...sectionIcon, background: '#fef3e2' }}>
            <Target size={20} color="#fe9339" />
          </div>
          <h2 className="sf-section-title" style={{ margin: 0 }}>
            <span style={{ color: '#6b7280', fontWeight: 600, marginRight: 8 }}>2.</span>
            Why This Matters
          </h2>
        </div>
        <p style={paragraph}>
          Basic duplicate finders only match at the file level. ApexGuru Clone Detection goes
          further — it detects duplication at file, method, and block levels, classifies each
          group by semantic category, and provides specific refactoring recipes.
        </p>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <table style={comparisonTable}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ ...thStyle, width: '22%' }}>Capability</th>
                <th style={{ ...thStyle, width: '39%', color: '#9ca3af' }}>
                  Basic Duplicate Finder
                </th>
                <th style={{ ...thStyle, width: '39%', color: '#0176d3' }}>
                  ApexGuru Clone Detection
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(([capability, scanner, reuse], i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--sf-text)' }}>{capability}</td>
                  <td style={{ ...tdStyle, color: '#9ca3af' }}>{scanner}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#047857' }}>
                      <CheckCircle2 size={14} />
                      {reuse}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            marginTop: 18,
            padding: '14px 16px',
            borderRadius: 8,
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            fontSize: 13,
            color: '#0369a1',
            lineHeight: 1.6,
          }}
        >
          <strong>Bottom line:</strong> A basic duplicate finder tells you "these files look similar."
          ApexGuru Clone Detection tells you "here are 7 copies of the same data view, here's
          which one to keep, here's who calls each copy, and here's the recipe to safely remove the rest."
        </div>
      </div>

      {/* ── Section 3: Understanding Your Report ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={sectionHeaderRow}>
          <div style={{ ...sectionIcon, background: '#eef6ff' }}>
            <BarChart3 size={20} color="#0176d3" />
          </div>
          <h2 className="sf-section-title" style={{ margin: 0 }}>
            <span style={{ color: '#6b7280', fontWeight: 600, marginRight: 8 }}>3.</span>
            Understanding Your Report
          </h2>
        </div>

        {/* 3.1 Health Score */}
        <h3 style={subheading}>3.1 &nbsp;Code Reuse Health Score (0–100)</h3>
        <p style={paragraph}>
          The Health Score is the single number that captures the overall state of code reuse in your
          org. A higher score means less duplication and better standardization.
        </p>
        <p style={{ ...paragraph, fontWeight: 600, marginBottom: 8 }}>How it's calculated:</p>
        <ul style={{ margin: '0 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['Duplicate code ratio', '— what percentage of logic exists in multiple places.'],
            ['Standardization level', '— how many findings have a designated preferred version.'],
            ['Resolution rate', '— how many previously identified duplications have been cleaned up.'],
            ['Dependency hygiene', '— how clean the dependency structure is across implementations.'],
          ].map(([bold, rest], i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--sf-text)' }}>
              <strong>{bold}</strong>{rest}
            </li>
          ))}
        </ul>
        <p style={{ ...paragraph, fontWeight: 600, marginBottom: 8 }}>What a good score looks like:</p>
        <div style={{ marginBottom: 8 }}>
          {scoreBand('0–40', '#ea001e', 'Needs Work', 'Significant duplication, many opportunities to simplify.')}
          {scoreBand('41–60', '#fe9339', 'Moderate', 'Some standards defined but inconsistently applied.')}
          {scoreBand('61–80', '#0176d3', 'Good', 'Most critical duplications addressed.')}
          {scoreBand('81–100', '#2e844a', 'Excellent', 'Well-standardized codebase with minimal redundancy.')}
        </div>

        {/* 3.2 Clone Groups */}
        <h3 style={subheading}>3.2 &nbsp;Clone Groups</h3>
        <p style={paragraph}>
          Each clone group represents a set of 2 or more files, methods, or blocks that contain
          identical or nearly identical code. Groups are ranked by tier (confidence/impact) and
          classified by category and effort level.
        </p>
        <p style={{ ...paragraph, fontWeight: 600, marginBottom: 8 }}>Each clone group shows:</p>
        <ul style={{ margin: '0 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Tier — HIGH, MEDIUM, or LOW confidence and impact.',
            'Level — file (entire file duplicated), method (specific method), or block (code block within a method).',
            'Category — semantic classification such as business_logic, data_access_logic, file_duplicate, orchestration.',
            'Effort — estimated refactoring complexity: LOW (simple deletion), MEDIUM (extract method), HIGH (complex restructuring).',
            'Refactoring recipe — the recommended action to remove the duplication.',
            'Characters saved — total duplicate code measured in characters.',
          ].map((text, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--sf-text)' }}>{text}</li>
          ))}
        </ul>

        {/* 3.3 Representative vs Copies View */}
        <h3 style={subheading}>3.3 &nbsp;Representative vs Copies View</h3>
        <p style={{ ...paragraph, marginBottom: 12 }}>
          When you expand a clone group, the code view shows the representative (the copy to keep)
          alongside each copy. Color highlighting shows what's identical and what differs:
        </p>
        <div style={{ marginBottom: 16 }}>
          {highlightDot('#2e844a', 'Identical (Green)', '— This line is the same in both representative and copy. No changes needed.')}
          {highlightDot('#f59e0b', 'Similar (Yellow)', '— Same intent, slightly different syntax (e.g., different parameter names).')}
          {highlightDot('#ea580c', 'Different (Orange)', '— Different logic. Needs review before consolidation.')}
          {highlightDot('#0176d3', 'Unique (Blue)', '— Only exists in this copy. Evaluate whether to adopt or discard.')}
        </div>

        {/* 3.4 Referenced By & Safe to Remove */}
        <h3 style={subheading}>3.4 &nbsp;Referenced By &amp; Safe to Remove</h3>
        <p style={{ ...paragraph, marginBottom: 12 }}>
          Every copy in a clone group includes caller information so you know whether it's safe
          to delete:
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={comparisonTable}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>Metric</th>
                <th style={thStyle}>What It Means</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Referenced By', 'Other classes, triggers, or components that call or import this file/method. These callers need to be redirected before the copy can be removed.'],
                ['Safe to Remove', 'Whether this copy can be safely deleted. Depends on how many callers reference it and whether they can be redirected to the representative.'],
                ['Representative', 'The copy recommended to keep as the surviving version. Other copies should be removed or consolidated into this one.'],
                ['Copies', 'How many copies of this code exist. All copies contain the same or very similar logic.'],
              ].map(([metric, meaning], i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--sf-text)' }}>{metric}</td>
                  <td style={tdStyle}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Step-by-Step User Journey ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={sectionHeaderRow}>
          <div style={{ ...sectionIcon, background: '#ecfdf5' }}>
            <ArrowRight size={20} color="#2e844a" />
          </div>
          <h2 className="sf-section-title" style={{ margin: 0 }}>
            <span style={{ color: '#6b7280', fontWeight: 600, marginRight: 8 }}>4.</span>
            Step-by-Step User Journey
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {STEPS.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={stepCircle}>{idx + 1}</div>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sf-text)', margin: '0 0 8px' }}>
                  {step.title}
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {step.bullets.map((b, bi) => (
                    <li key={bi} style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--sf-text)' }}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Glossary ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={sectionHeaderRow}>
          <div style={{ ...sectionIcon, background: '#f5f3ff' }}>
            <BookOpen size={20} color="#7c3aed" />
          </div>
          <h2 className="sf-section-title" style={{ margin: 0 }}>
            <span style={{ color: '#6b7280', fontWeight: 600, marginRight: 8 }}>5.</span>
            Glossary
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={comparisonTable}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ ...thStyle, width: '28%' }}>Term</th>
                <th style={thStyle}>Definition</th>
              </tr>
            </thead>
            <tbody>
              {GLOSSARY.map(([term, definition], i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--sf-text)' }}>{term}</td>
                  <td style={tdStyle}>{definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 6: Getting Help ── */}
      <div className="sf-card" style={{ padding: 24, marginBottom: 40 }}>
        <div style={sectionHeaderRow}>
          <div style={{ ...sectionIcon, background: '#ecfdf5' }}>
            <Users size={20} color="#2e844a" />
          </div>
          <h2 className="sf-section-title" style={{ margin: 0 }}>
            <span style={{ color: '#6b7280', fontWeight: 600, marginRight: 8 }}>6.</span>
            Getting Help
          </h2>
        </div>
        <p style={{ ...paragraph, marginBottom: 16 }}>
          You're not on your own. Here's how to get the most out of Clone Detection:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              icon: <Zap size={18} color="#0176d3" />,
              title: 'Use Agentforce',
              description: 'Click the AI assistant icon in the header for instant, conversational guidance on any clone group or refactoring recipe.',
            },
            {
              icon: <Shield size={18} color="#7c3aed" />,
              title: 'Share Reports',
              description: 'Export any report as a PDF and share it with your team for architecture reviews or sprint planning.',
            },
            {
              icon: <TrendingUp size={18} color="#2e844a" />,
              title: 'Salesforce Success Team',
              description: 'Contact your Salesforce Success team for hands-on architecture reviews and clone cleanup strategy sessions.',
            },
            {
              icon: <BookOpen size={18} color="#fe9339" />,
              title: 'Salesforce Help',
              description: 'Visit Salesforce Help for detailed documentation, best practices guides, and community discussions.',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 10,
                background: '#f9fafb',
                border: '1px solid #f0f0f0',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--sf-text)' }}>{item.title}</strong>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.55 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
