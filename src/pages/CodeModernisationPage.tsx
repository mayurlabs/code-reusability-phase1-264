import { useState } from 'react';
import {
  GitBranch,
  Layers,
  AlertTriangle,
  Settings,
  Code2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import { modernisationCandidates } from '../data/mockData';

const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof Layers; color: string; bg: string }
> = {
  'Code Consolidation': { icon: Layers, color: '#0176d3', bg: '#e1f5fe' },
  'Governor Limit Risk': { icon: AlertTriangle, color: '#c23934', bg: '#fde8e8' },
  Architecture: { icon: Code2, color: '#9050e9', bg: '#f3e8ff' },
  Configuration: { icon: Settings, color: '#fe9339', bg: '#fff8e1' },
};

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Recommended: { bg: '#e6f9ed', color: '#2e844a' },
  Planned: { bg: '#e1f5fe', color: '#0176d3' },
  'Under Review': { bg: '#fff8e1', color: '#b7741a' },
  'In Progress': { bg: '#f3e8ff', color: '#9050e9' },
};

const IMPACT_COLORS: Record<string, { bg: string; color: string }> = {
  High: { bg: '#fde8e8', color: '#c23934' },
  Medium: { bg: '#fff8e1', color: '#b7741a' },
  Low: { bg: '#f0f0f0', color: '#706e6b' },
};

const DETAIL_DATA: Record<
  string,
  { currentState: string; targetState: string }
> = {
  'mod-001': {
    currentState:
      'LegacyPricingUtils uses inline SOQL and a custom Discount_Matrix__c object with hardcoded field references. It returns 0 on null price instead of throwing an exception, creating silent failures in downstream calculations.',
    targetState:
      'Migrate all callers of LegacyPricingUtils.calcProductDiscount() to PricingRulesEngineV2.calculateDiscount(). The V2 engine uses the selector pattern, throws explicit exceptions, includes audit logging, and handles rounding consistently.',
  },
  'mod-002': {
    currentState:
      'QuotePricingHelper issues SOQL queries inside a for-loop when iterating over quote line items. On quotes with 80+ lines, this has caused governor limit failures in production.',
    targetState:
      'Refactor to pre-query all discount tier records using a selector class with a collection-based filter. Process tier matching in-memory using a Map<Id, List<Discount_Tier__c>> structure.',
  },
  'mod-003': {
    currentState:
      'ForecastRollupHelper and ForecastUtils contain 97% identical logic for aggregating opportunity amounts by territory and quarter. Only the date range defaults differ between the two classes.',
    targetState:
      'Consolidate into ForecastRollupService.rollupByTerritory() with a configurable date range parameter. Delete the duplicate classes and update all three caller references.',
  },
  'mod-004': {
    currentState:
      'Case escalation logic is embedded across five trigger branches, making it difficult to unit test escalation rules independently. Changes to escalation channels require modifying multiple trigger files.',
    targetState:
      'Extract all escalation evaluation into CaseEscalationHandler with a single evaluateEscalation() entry point. Trigger calls handler; handler manages channel routing, SLA calculation, and notification dispatch.',
  },
  'mod-005': {
    currentState:
      'Address validation is performed in four different locations with different API providers (USPS, SmartyStreets, internal rules). Some flows skip validation entirely on certain address types.',
    targetState:
      'Route all validation through AddressValidationService.validate() with a provider strategy pattern. Configure the active provider via Custom Metadata. Ensure all address-bearing flows call the unified service.',
  },
  'mod-006': {
    currentState:
      'Discount approval thresholds are hardcoded as constants in three different Apex classes. Changing a threshold requires a code deployment, and different flows may enforce inconsistent limits.',
    targetState:
      'Migrate all threshold values to the Approval_Threshold__mdt Custom Metadata Type. ApprovalThresholdEngine already supports metadata-driven lookups — extend it to be the single evaluation point for all flows.',
  },
};

export default function CodeModernisationPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--sf-text-muted)',
          marginBottom: 12,
        }}
      >
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--sf-blue)', textDecoration: 'none' }}>
          SETUP
        </a>
        <span>›</span>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--sf-blue)', textDecoration: 'none' }}>
          Code Intelligence
        </a>
        <span>›</span>
        <span style={{ color: 'var(--sf-text)' }}>Code Modernisation</span>
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #e6f9ed, #d4edda)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <GitBranch size={20} color="#2e844a" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Code Modernisation</h1>
          <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)' }}>
            Modernize legacy Apex patterns and adopt new platform capabilities
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Modernisation Candidates', value: '14', accent: '#0176d3', icon: Search },
          { label: 'Legacy Patterns', value: '8', accent: '#c23934', icon: AlertTriangle },
          { label: 'Migration Opportunities', value: '5', accent: '#2e844a', icon: TrendingUp },
          { label: 'Architecture Upgrades', value: '3', accent: '#9050e9', icon: Code2 },
        ].map((card) => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: '18px 20px',
                border: '1px solid var(--sf-border)',
                borderTop: `3px solid ${card.accent}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sf-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {card.label}
                </span>
                <CardIcon size={16} color={card.accent} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--sf-text)' }}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate cards grid */}
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Modernisation Candidates</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {modernisationCandidates.map((mod) => {
          const catConfig = CATEGORY_CONFIG[mod.category] || CATEGORY_CONFIG.Architecture;
          const CatIcon = catConfig.icon;
          const statusStyle = STATUS_CONFIG[mod.status] || STATUS_CONFIG['Under Review'];
          const impactStyle = IMPACT_COLORS[mod.impact] || IMPACT_COLORS.Low;
          const isExpanded = expandedId === mod.id;
          const detail = DETAIL_DATA[mod.id];

          return (
            <div
              key={mod.id}
              style={{
                background: '#fff',
                borderRadius: 8,
                border: '1px solid var(--sf-border)',
                overflow: 'hidden',
                transition: 'box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => setExpandedId(isExpanded ? null : mod.id)}
            >
              <div style={{ padding: 20 }}>
                {/* Category + expand icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: catConfig.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CatIcon size={14} color={catConfig.color} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: catConfig.color,
                        textTransform: 'uppercase',
                      }}
                    >
                      {mod.category}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} color="var(--sf-text-muted)" />
                  ) : (
                    <ChevronDown size={16} color="var(--sf-text-muted)" />
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>
                  {mod.title}
                </h3>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {mod.status}
                  </span>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: impactStyle.bg,
                      color: impactStyle.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Impact: {mod.impact}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--sf-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Clock size={11} />
                    {mod.team}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && detail && (
                <div
                  style={{
                    padding: '0 20px 20px',
                    borderTop: '1px solid var(--sf-border)',
                    paddingTop: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 24px 1fr',
                      gap: 12,
                      alignItems: 'start',
                      marginBottom: 16,
                    }}
                  >
                    {/* Current State */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#c23934',
                          marginBottom: 8,
                        }}
                      >
                        <AlertTriangle size={13} /> Current State
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: 'var(--sf-text)',
                          background: '#fdf2f2',
                          padding: 12,
                          borderRadius: 6,
                          borderLeft: '3px solid #c23934',
                        }}
                      >
                        {detail.currentState}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 36,
                      }}
                    >
                      <ArrowRight size={18} color="var(--sf-text-muted)" />
                    </div>

                    {/* Target State */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#2e844a',
                          marginBottom: 8,
                        }}
                      >
                        <CheckCircle2 size={13} /> Recommended Target State
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: 'var(--sf-text)',
                          background: '#f0faf4',
                          padding: 12,
                          borderRadius: 6,
                          borderLeft: '3px solid #2e844a',
                        }}
                      >
                        {detail.targetState}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        height: 30,
                        padding: '0 14px',
                        borderRadius: 4,
                        background: 'var(--sf-blue)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                      }}
                    >
                      <CheckCircle2 size={13} /> Begin Migration
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        height: 30,
                        padding: '0 14px',
                        borderRadius: 4,
                        background: '#f8f9fa',
                        color: 'var(--sf-text-secondary)',
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid var(--sf-border)',
                      }}
                    >
                      Create Task
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        height: 30,
                        padding: '0 14px',
                        borderRadius: 4,
                        background: '#f8f9fa',
                        color: 'var(--sf-text-secondary)',
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid var(--sf-border)',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
