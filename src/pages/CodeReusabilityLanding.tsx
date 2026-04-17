import { useState } from 'react';
import {
  BarChart3,
  ExternalLink,
  Download,
  RotateCcw,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { scanReports } from '../data/mockData';
import { InfoTooltip, TIP } from '../components/InfoTooltip';
import { ScoreBreakdown } from '../components/ScoreBreakdown';

interface CodeReusabilityLandingProps {
  onViewReport: (reportId: string) => void;
  onGenerateReport: () => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusBadgeClass: Record<string, string> = {
  Complete: 'sf-badge sf-badge-complete',
  'In Progress': 'sf-badge sf-badge-progress',
  Failed: 'sf-badge sf-badge-failed',
  Draft: 'sf-badge sf-badge-draft',
};

const latestReport = scanReports[0];

export default function CodeReusabilityLanding({
  onViewReport,
  onGenerateReport,
}: CodeReusabilityLandingProps) {
  const { scanInProgress, processingMessage, triggerScan, showToast } = useAppContext();

  const [reportName, setReportName] = useState(
    'Mar 2026 Code Reuse Report - Northstar Retail Group',
  );
  const [environment, setEnvironment] = useState('Production');
  const [scope, setScope] = useState('All Surfaces');

  const handleGenerate = () => {
    triggerScan();
    onGenerateReport();
  };

  const handleDownloadPdf = () => {
    showToast('Preparing PDF...', 'info');
    setTimeout(() => {
      showToast('PDF downloaded successfully', 'success');
    }, 1500);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--sf-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: 6,
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="sf-breadcrumb">
        <a href="#" onClick={(e) => e.preventDefault()}>SETUP</a>
        <span className="sep">›</span>
        <a href="#" onClick={(e) => e.preventDefault()}>CODE INTELLIGENCE</a>
        <span className="sep">›</span>
        <span>CODE REUSABILITY</span>
      </div>

      {/* Page header with actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #e1f5fe, #bbdefb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BarChart3 size={20} color="#0176d3" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Code Reusability</h1>
            <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginTop: 2 }}>
              Scan your org to find repeated code patterns and identify opportunities to simplify your codebase.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sf-btn" onClick={() => onViewReport(latestReport.id)}>
            <Eye size={14} /> View Full Report
          </button>
          <button className="sf-btn" onClick={() => onViewReport('playbook')}>
            <BarChart3 size={14} /> How to Use This Report
          </button>
          <button className="sf-btn sf-btn-primary" onClick={handleGenerate} disabled={scanInProgress}>
            <Plus size={14} /> Generate Reuse Report
          </button>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>
        {[
          { label: 'HEALTH SCORE', value: '78', sub: '+9 vs previous', tip: TIP['health-score'] },
          { label: 'CLONE GROUPS', value: '318', sub: null, tip: TIP['clone-groups'] },
          { label: 'EXACT DUPLICATES', value: '150', sub: 'Easy cleanup', tip: TIP['exact-duplicates'] },
          { label: 'NEAR DUPLICATES', value: '168', sub: 'Needs review', tip: TIP['near-duplicates'] },
          { label: 'CHARS SAVED', value: '424,685', sub: null, tip: TIP['chars-saved'] },
        ].map((card, i) => (
          <div key={i} className="sf-stat-card" onClick={() => onViewReport(latestReport.id)}>
            <span className="stat-label">{card.label} <InfoTooltip text={card.tip} /></span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="stat-value">{card.value}</span>
              {card.sub && <span className={`stat-delta ${i === 0 ? 'positive' : ''}`} style={i !== 0 ? { fontSize: 11, color: 'var(--sf-text-secondary)', fontWeight: 500 } : undefined}>{i === 0 ? `▲ ${card.sub}` : card.sub}</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Score Breakdown — separate row */}
      <div className="sf-card" style={{ marginBottom: 16, padding: '14px 18px' }}>
        <ScoreBreakdown compact />
      </div>

      {/* ── Three Insight Columns ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        <div className="sf-insight-col">
          <div className="col-header">
            <CheckCircle2 size={18} color="#2e844a" />
            <span>Easy Wins <InfoTooltip text={TIP['health-score']} /></span>
          </div>
          {[
            { text: '7 identical case data view files — delete 6 copies', detail: 'Bug fix in 1 copy not applied to other 6 • 3 teams affected' },
            { text: '3 identical claims summary generators — delete 2', detail: 'Currency format fix missing in 2 copies • Sprint change planned' },
            { text: '2 identical feed comment trigger handlers', detail: 'Profanity filter updated in only 1 copy' },
          ].map((item, i) => (
            <div key={i} className="col-item" onClick={() => onViewReport(latestReport.id)}>
              <div>
                <span className="item-title">{item.text}</span>
                <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', marginTop: 2 }}>{item.detail}</div>
              </div>
              <ArrowUpRight size={14} color="#0176d3" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>
        <div className="sf-insight-col">
          <div className="col-header">
            <AlertTriangle size={18} color="#fe9339" />
            <span>Needs Review <InfoTooltip text={TIP['near-duplicates']} /></span>
          </div>
          {[
            { text: '6 near-duplicate listing data methods — need consolidation', detail: 'Changed 14 times in 90 days • Governor limit risk in 3 copies' },
            { text: '8 repeated boolean evaluator methods', detail: 'Highest copy count in org • 320 lines of duplicate tests' },
            { text: '3 similar guest review builder methods', detail: 'Scoring algorithm updated in only 1 of 3 copies' },
          ].map((item, i) => (
            <div key={i} className="col-item" onClick={() => onViewReport(latestReport.id)}>
              <div>
                <span className="item-title">{item.text}</span>
                <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', marginTop: 2 }}>{item.detail}</div>
              </div>
              <ArrowUpRight size={14} color="#0176d3" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>
        <div className="sf-insight-col">
          <div className="col-header">
            <Lightbulb size={18} color="#0176d3" />
            <span>Recommended Actions <InfoTooltip text={TIP['recommendation']} /></span>
          </div>
          {[
            { text: 'Start with file-level duplicates — lowest risk cleanup', detail: '142 groups' },
            { text: 'Extract shared methods for listing data queries', detail: '6 copies → 1 method' },
            { text: 'Parameterize boolean evaluator pattern', detail: '8 copies → 1 method' },
          ].map((item, i) => (
            <div key={i} className="col-item" onClick={() => onViewReport(latestReport.id)}>
              <div>
                <span className="item-title">{item.text}</span>
                <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', marginTop: 2 }}>{item.detail}</div>
              </div>
              <ArrowUpRight size={14} color="#0176d3" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Latest Scan Details ── */}
      <div className="sf-card" style={{ marginBottom: 16 }}>
        <h3 className="sf-section-title">Latest Scan Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
          {[
            ['Report Name', latestReport.name],
            ['Requested By', latestReport.requestedBy],
            ['Requested Date', formatDate(latestReport.requestedDate)],
            ['Start Time', formatDateTime(latestReport.startTime)],
            ['End Time', formatDateTime(latestReport.endTime)],
            ['Environment', latestReport.environment],
            ['Org ID', latestReport.orgId],
            ['Scope', latestReport.scope.join(', ')],
            ['Runtime Enrichment', latestReport.runtimeEnrichment, TIP['runtime-priority']],
            ['Report Version', latestReport.reportVersion],
            ['Status', latestReport.status],
          ].map(([label, value, tipText], i) => (
            <div key={i} style={{ padding: '6px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}{tipText && <InfoTooltip text={tipText} />}</div>
              <div style={{ color: 'var(--sf-text)', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── New Report Form ── */}
      <div className="sf-card" style={{ marginBottom: 16, position: 'relative' }}>
        <h2 className="sf-section-title">New Report</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 240px',
            gap: 12,
            alignItems: 'end',
            marginBottom: 16,
          }}
        >
          <div>
            <label style={labelStyle}>Report Name</label>
            <input
              className="sf-input"
              style={{ width: '100%' }}
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              disabled={scanInProgress}
            />
          </div>
          <div>
            <label style={labelStyle}>Environment</label>
            <select
              className="sf-select"
              style={{ width: '100%' }}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              disabled={scanInProgress}
            >
              <option>Production</option>
              <option>Full Copy Sandbox</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Scope</label>
            <select
              className="sf-select"
              style={{ width: '100%' }}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              disabled={scanInProgress}
            >
              <option>All Surfaces</option>
              <option>Apex Classes &amp; Methods</option>
              <option>Apex + Triggers</option>
              <option>LWC (JavaScript / TypeScript)</option>
              <option>Aura Components</option>
              <option>Visualforce Pages &amp; Controllers</option>
              <option>SOQL / SOSL Patterns</option>
              <option>Flows &amp; Invocable Actions</option>
              <option>Integration Wrappers (REST / SOAP)</option>
            </select>
          </div>
        </div>

        <button
          className="sf-btn sf-btn-primary"
          onClick={handleGenerate}
          disabled={scanInProgress}
        >
          Generate Report
        </button>

        {scanInProgress && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.82)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              zIndex: 10,
            }}
          >
            <Loader2
              size={28}
              color="var(--sf-blue)"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sf-text)' }}>
              {processingMessage}
            </span>
          </div>
        )}
      </div>

      {/* ── Scan History / Audit Table ── */}
      <div className="sf-card" style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--sf-border)',
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Scan History</h2>
          <button
            className="sf-btn sf-btn-primary sf-btn-sm"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            <Plus size={12} /> New Report
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="sf-table">
            <thead>
              <tr>
                <th></th>
                <th>Report Name</th>
                <th>Requestor</th>
                <th>Requested Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Score <InfoTooltip text={TIP['health-score']} /></th>
                <th>Delta <InfoTooltip text={TIP['score-delta']} /></th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanReports.map((report) => (
                <tr key={report.id} onClick={() => report.status === 'Complete' && onViewReport(report.id)}>
                  <td><BarChart3 size={14} color="var(--sf-text-muted)" /></td>
                  <td>
                    {report.status === 'Complete' ? (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onViewReport(report.id);
                        }}
                        style={{ color: 'var(--sf-blue)', textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
                      >
                        {report.name}
                      </a>
                    ) : (
                      <span style={{ fontWeight: 500 }}>{report.name}</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--sf-text-secondary)' }}>{report.requestedBy}</td>
                  <td style={{ color: 'var(--sf-text-secondary)', fontSize: 12 }}>{formatDate(report.requestedDate)}</td>
                  <td style={{ color: 'var(--sf-text-secondary)', fontSize: 12 }}>{formatDateTime(report.startTime)}</td>
                  <td style={{ color: 'var(--sf-text-secondary)', fontSize: 12 }}>{formatDateTime(report.endTime)}</td>
                  <td><span style={{ fontWeight: 700 }}>{report.score !== null ? report.score : '—'}</span></td>
                  <td>
                    {report.scoreDelta !== null ? (
                      <span style={{ color: 'var(--sf-success)', fontWeight: 600 }}>+{report.scoreDelta}</span>
                    ) : (
                      <span style={{ color: 'var(--sf-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td><span className={statusBadgeClass[report.status] || 'sf-badge'}>{report.status}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {report.status === 'Complete' && (
                        <button className="sf-btn sf-btn-icon sf-btn-sm" title="View Report" onClick={() => onViewReport(report.id)}>
                          <ExternalLink size={14} />
                        </button>
                      )}
                      <button className="sf-btn sf-btn-icon sf-btn-sm" title="Download PDF" onClick={handleDownloadPdf}>
                        <Download size={14} />
                      </button>
                      {report.status === 'Failed' && (
                        <button className="sf-btn sf-btn-icon sf-btn-sm" title="Re-run" onClick={handleGenerate}>
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
