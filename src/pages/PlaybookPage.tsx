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
  ['Finding duplicates', 'Exact text matching only', 'Semantic + structural + runtime similarity'],
  ['Prioritization', 'No prioritization', 'Ranked by runtime usage and business impact'],
  ['Safety check', 'None', 'Dependency analysis and migration readiness'],
  ['Actionable guidance', '"These look similar"', 'Step-by-step cleanup plan with risk assessment'],
  ['Progress tracking', 'No', 'Score trend over time'],
  ['Multi-language', 'Usually single language', 'Apex, Triggers, LWC, Aura, VF, SOQL, Flows'],
];

const GLOSSARY: [string, string][] = [
  ['Code Reuse Health Score', 'A 0–100 score measuring how well your org avoids unnecessary code duplication.'],
  ['Finding', 'A group of similar code implementations that solve the same business problem.'],
  ['Preferred Implementation', 'The version recommended to keep as the standard — usually the most used, best structured, and lowest risk.'],
  ['Similar Implementation', 'Code that does the same thing as another implementation but with different syntax or approach.'],
  ['Duplicate Code', 'Lines of logic that are identical across multiple implementations.'],
  ['Runtime Priority', 'How important a finding is, based on how frequently the duplicated code runs in production.'],
  ['Dependency', 'A relationship where one piece of code calls or relies on another.'],
  ['Inbound Dependency', 'Another class or method that calls this implementation.'],
  ['Outbound Dependency', 'A class or method that this implementation relies on.'],
  ['Risk Level', 'How risky it is to change or remove an implementation, based on its dependencies.'],
  ['Migration Ready', 'Whether an implementation\'s callers can be safely redirected to the preferred version.'],
  ['Scan', 'An analysis of your org\'s codebase to identify reuse opportunities.'],
  ['Scope', 'Which coding surfaces are included in a scan (Apex, Triggers, LWC, etc.).'],
  ['Consolidation', 'Merging multiple similar implementations into one standard version.'],
  ['Retirement', 'Safely removing an implementation after its callers have been migrated.'],
];

const STEPS: { title: string; bullets: string[] }[] = [
  {
    title: 'Generate a Scan',
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
      'Look at the "What Improved" and "What Needs Attention" sections.',
      'Identify the top recommended actions.',
    ],
  },
  {
    title: 'Explore Findings',
    bullets: [
      'Open the full report to see all findings ranked by priority.',
      'Start with the #1 finding — it has the highest business impact.',
      'Review the code highlighting to see what\'s duplicated vs. unique.',
      'Check dependencies before planning any changes.',
    ],
  },
  {
    title: 'Ask Agentforce',
    bullets: [
      'Click the Agentforce icon in the header.',
      'Ask questions like "Is it safe to remove the legacy version?" or "What should I clean up first?"',
      'Get conversational guidance with step-by-step recommendations.',
    ],
  },
  {
    title: 'Take Action',
    bullets: [
      'Designate the preferred implementation as your org\'s standard.',
      'Migrate callers from weaker versions to the standard.',
      'Retire deprecated implementations after dependency validation.',
      'Re-run the scan to measure improvement.',
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
              A complete guide to understanding your Code Reusability scan, interpreting scores and
              findings, and taking action to improve your org's code health.
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
            What is Code Reusability?
          </h2>
        </div>
        <p style={paragraph}>
          Code Reusability is a Salesforce-native tool that analyzes your entire codebase to find
          repeated logic and recommend how to simplify it. Instead of reading through thousands of
          files manually, it does the heavy lifting for you.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Scans your entire Salesforce codebase across all development surfaces — Apex classes, triggers, LWC, Aura components, Visualforce pages, SOQL queries, and Flows.',
            'Identifies repeated code patterns — places where similar logic exists in multiple files, even when the syntax differs.',
            'Recommends which implementation to keep as the standard and which can be consolidated or removed.',
            'Tracks improvement over time with a Code Reuse Health Score that shows whether your org is getting cleaner or more cluttered.',
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
          Static code scanners only find exact text matches. Code Reusability goes further — it
          uses runtime data, dependency analysis, and semantic similarity to find code that does the
          same thing <em>even if it's written differently</em>.
        </p>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <table style={comparisonTable}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ ...thStyle, width: '22%' }}>Capability</th>
                <th style={{ ...thStyle, width: '39%', color: '#9ca3af' }}>
                  Static Scanner
                </th>
                <th style={{ ...thStyle, width: '39%', color: '#0176d3' }}>
                  Code Reusability
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
          <strong>Bottom line:</strong> A static scanner tells you "these files look similar." Code
          Reusability tells you "here are 5 implementations of pricing logic, here's which one is
          best, here's what depends on each, and here are the safe steps to consolidate."
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

        {/* 3.2 Findings */}
        <h3 style={subheading}>3.2 &nbsp;Findings</h3>
        <p style={paragraph}>
          Each finding represents a group of similar code implementations that solve the same
          business problem. Priority is based on runtime usage — higher usage means the duplication
          has more business impact.
        </p>
        <p style={{ ...paragraph, fontWeight: 600, marginBottom: 8 }}>Each finding shows:</p>
        <ul style={{ margin: '0 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'The best version to keep (preferred implementation).',
            'Other versions found, with usage data and similarity percentage.',
            'What\'s the same across versions (safe to consolidate).',
            'What\'s different (needs attention before merging).',
            'Dependencies — what other code relies on each version.',
            'Recommended cleanup steps.',
          ].map((text, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--sf-text)' }}>{text}</li>
          ))}
        </ul>

        {/* 3.3 Code Highlighting */}
        <h3 style={subheading}>3.3 &nbsp;Code Highlighting</h3>
        <p style={{ ...paragraph, marginBottom: 12 }}>
          When you expand a finding, the code view uses color highlighting to show what's shared and
          what's unique:
        </p>
        <div style={{ marginBottom: 16 }}>
          {highlightDot('#2e844a', 'Duplicate (Green)', '— This line is identical across implementations. Safe to keep once.')}
          {highlightDot('#f59e0b', 'Similar (Yellow)', '— Same intent, slightly different syntax. Minor cleanup needed.')}
          {highlightDot('#ea580c', 'Different (Orange)', '— Fundamentally different approach. Needs review before consolidation.')}
          {highlightDot('#0176d3', 'Unique (Blue)', '— Only exists in this implementation. Evaluate whether to adopt or remove.')}
        </div>

        {/* 3.4 Dependencies */}
        <h3 style={subheading}>3.4 &nbsp;Dependencies</h3>
        <p style={{ ...paragraph, marginBottom: 12 }}>
          Every finding includes a dependency summary so you know how risky it is to change each
          implementation:
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
                ['Inbound', 'How many other classes/methods call this implementation.'],
                ['Outbound', 'How many classes/methods this implementation depends on.'],
                ['Risk Level', 'Low (safe to change), Moderate (some callers need updating), High (widely used, change carefully).'],
                ['Migration Ready', 'Whether callers can be redirected to the preferred version without breaking changes.'],
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
          You're not on your own. Here's how to get the most out of Code Reusability:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              icon: <Zap size={18} color="#0176d3" />,
              title: 'Use Agentforce',
              description: 'Click the AI assistant icon in the header for instant, conversational guidance on any finding or recommendation.',
            },
            {
              icon: <Shield size={18} color="#7c3aed" />,
              title: 'Share Reports',
              description: 'Export any report as a PDF and share it with your team for architecture reviews or sprint planning.',
            },
            {
              icon: <TrendingUp size={18} color="#2e844a" />,
              title: 'Salesforce Success Team',
              description: 'Contact your Salesforce Success team for hands-on architecture reviews and cleanup strategy sessions.',
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
