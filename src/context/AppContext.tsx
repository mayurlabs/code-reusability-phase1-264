import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';

export interface AgentMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: string;
  actions?: { label: string; actionId: string }[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextValue {
  activePage: string;
  currentView: 'landing' | 'report' | 'playbook';
  currentReportId: string;
  toasts: Toast[];
  agentPanelOpen: boolean;
  agentMessages: AgentMessage[];
  isProcessing: boolean;
  processingMessage: string;
  scanInProgress: boolean;

  setActivePage: (page: string) => void;
  setCurrentView: (view: 'landing' | 'report') => void;
  setCurrentReportId: (id: string) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  toggleAgentPanel: () => void;
  setAgentPanelOpen: (v: boolean) => void;
  addAgentMessage: (msg: AgentMessage) => void;
  triggerScan: () => void;
  handleAgentAction: (actionId: string) => void;
  sendAgentMessage: (text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const WELCOME_MESSAGE: AgentMessage = {
  id: 'welcome',
  role: 'bot',
  content:
    "Hi, I'm Agentforce! I can help you understand your org's code patterns, find repeated logic, and recommend which implementations to keep. What would you like to explore?",
  timestamp: new Date().toISOString(),
  actions: [
    { label: 'Analyze my org for reuse opportunities', actionId: 'analyze-org' },
    { label: 'Summarize my latest report', actionId: 'summarize-report' },
    { label: "What's changed since my last scan?", actionId: 'report-comparison' },
  ],
};

interface ActionResponse {
  processingMessage: string;
  delay: number;
  content: string;
  actions?: { label: string; actionId: string }[];
}

const ACTION_RESPONSES: Record<string, ActionResponse> = {
  'analyze-org': {
    processingMessage: 'Analyzing scan results...',
    delay: 2500,
    content:
      "Here's a summary of your latest Code Reuse scan:\n\n**Org:** Northstar Retail Group\n**Assets Analyzed:** 1,842 across Apex, Triggers, LWC, and SOQL\n**Score:** 78 (up 9 points from your last scan)\n\nI found **12 groups of similar code** that could be simplified:\n• **3 high priority** — repeated pricing and discount logic\n• **5 medium priority** — shared validation and date helpers\n• **4 low priority** — older patterns with limited usage\n\nThe biggest opportunity is in your **pricing and discount logic** — 5 similar implementations exist across different teams.",
    actions: [
      { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
      { label: 'Which code can I consolidate or retire?', actionId: 'safe-remove' },
      { label: 'Show me what improved since last time', actionId: 'report-comparison' },
    ],
  },
  'summarize-report': {
    processingMessage: 'Analyzing scan results...',
    delay: 2500,
    content:
      "Here's a summary of your latest Code Reuse scan:\n\n**Org:** Northstar Retail Group\n**Assets Analyzed:** 1,842 across Apex, Triggers, LWC, and SOQL\n**Score:** 78 (up 9 points from your last scan)\n\nI found **12 groups of similar code** that could be simplified:\n• **3 high priority** — repeated pricing and discount logic\n• **5 medium priority** — shared validation and date helpers\n• **4 low priority** — older patterns with limited usage\n\nThe biggest opportunity is in your **pricing and discount logic** — 5 similar implementations exist across different teams.",
    actions: [
      { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
      { label: 'Which code can I consolidate or retire?', actionId: 'safe-remove' },
      { label: 'Show me what improved since last time', actionId: 'report-comparison' },
    ],
  },
  'pricing-detail': {
    processingMessage: 'Looking at pricing logic...',
    delay: 2000,
    content:
      "Your org has **5 similar implementations** of pricing and discount calculation logic, spread across 3 teams:\n\n**Best version to keep:**\n`PricingRulesEngineV2.calculateDiscount()`\n• Owned by: Revenue Cloud Platform\n• Used 184,320 times in the last 30 days\n• Cleanest structure with the fewest dependencies\n\n**Other versions found:**\n\n1. `QuotePricingHelper.applyDiscountRules()`\n   Sales Operations — 48,112 uses/30d — Similar but lacks error handling\n\n2. `LegacyPriceCalcService.computePromoDiscount()`\n   Revenue Cloud — 1,904 uses/30d — Outdated, candidate for retirement after caller migration\n\n3. `DiscountRuleProcessor.evaluateThresholds()`\n   Core CRM — 18,602 uses/30d — Active but redundant\n\n4. `OpportunityPricingBranchHandler.applyDealDeskOverride()`\n   Sales Operations — 9,214 uses/30d — Trigger-based variant\n\nKeeping the best version and retiring the others could eliminate ~420 lines of redundant logic and reduce maintenance overhead.",
    actions: [
      { label: 'Is it safe to remove the legacy version?', actionId: 'safety-check' },
      { label: "Compare what's the same vs different", actionId: 'comparison' },
      { label: 'What should I do next?', actionId: 'recommendations' },
    ],
  },
  'safe-remove': {
    processingMessage: 'Checking code usage patterns...',
    delay: 1800,
    content:
      "Based on usage data, here are the implementations that could potentially be consolidated or retired:\n\n**Low usage — review for retirement after migration:**\n• `LegacyPriceCalcService.computePromoDiscount()` — only 1,904 uses/month, but has 2 active callers that need to be redirected first\n• 3 date-formatting helpers with under 500 uses/month — functionally identical to existing utilities\n\n**Medium usage — consolidate into preferred version:**\n• `QuotePricingHelper.applyDiscountRules()` — 48,112 uses/month, actively used but redundant\n\n**Keep as-is:**\n• `PricingRulesEngineV2.calculateDiscount()` — highest usage, best structure\n• `DiscountRuleProcessor.evaluateThresholds()` — still being reviewed\n\nI'd recommend starting with the legacy pricing service — it has the lowest risk.",
    actions: [
      { label: 'Is it safe to remove the legacy version?', actionId: 'safety-check' },
      { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'safety-check': {
    processingMessage: 'Checking dependencies...',
    delay: 2000,
    content:
      "Let me check the dependencies for `LegacyPriceCalcService.computePromoDiscount()`:\n\n**What still depends on it:**\n• `PromoOverrideBatchProcessor` — a batch job that runs weekly\n• `LegacyDealDeskFlowAction` — connected to a Flow\n\n**Risk level: Medium**\nIt's rarely used (1,904 calls/month) but still has 2 active callers. You'd need to redirect those callers to the preferred version first.\n\n**The preferred version** (`PricingRulesEngineV2`) has:\n• 8 inbound callers (well-adopted)\n• Low dependency risk\n• Ready to be the standard\n\n**My recommendation:** Don't remove the legacy version yet. First, migrate the 2 remaining callers to the preferred version. Then it's safe to retire.",
    actions: [
      { label: 'What about the other versions?', actionId: 'pricing-detail' },
      { label: "Compare what's the same vs different", actionId: 'comparison' },
      { label: 'Create a cleanup plan', actionId: 'recommendations' },
    ],
  },
  comparison: {
    processingMessage: 'Comparing implementations...',
    delay: 2200,
    content:
      "Here's how the 5 pricing implementations compare:\n\n**What's the same across all (safe to keep once):**\n• Price lookup from Pricebook — identical in all 5\n• Quantity threshold matching — same loop logic\n• Final price calculation — same formula\n• Regional adjustment — identical approach\n\n**What's different (needs attention):**\n• Error handling — preferred throws typed exceptions; legacy returns null silently\n• Discount source — preferred uses shared helper; legacy has inline database queries (governor limit risk)\n• Audit logging — only the preferred version logs pricing decisions for compliance\n\n**Missing from all versions:**\n• Discount ceiling enforcement — none of the 5 cap the maximum discount\n\n**Bottom line:** 60% of the logic is identical. The preferred version has the cleanest approach for the parts that differ.",
    actions: [
      { label: 'What should I do next?', actionId: 'recommendations' },
      { label: 'Tell me about other repeated code', actionId: 'other-groups' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  recommendations: {
    processingMessage: 'Building cleanup plan...',
    delay: 1800,
    content:
      "Here's my recommended cleanup plan for the pricing logic:\n\n**Step 1:** Designate `PricingRulesEngineV2.calculateDiscount()` as your org's standard pricing method\n\n**Step 2:** Migrate the 2 callers of the legacy version to use the standard version\n\n**Step 3:** Retire `LegacyPriceCalcService` once callers are migrated\n\n**Step 4:** Review `QuotePricingHelper` — it's actively used but redundant. Plan to consolidate in a future sprint.\n\n**Step 5:** Re-run a Code Reuse scan after cleanup to measure improvement\n\nWould you like to explore anything else?",
    actions: [
      { label: 'Tell me about other repeated code', actionId: 'other-groups' },
      { label: "What's changed since last time?", actionId: 'report-comparison' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'report-comparison': {
    processingMessage: 'Reviewing changes since last scan...',
    delay: 1800,
    content:
      "Comparing your latest scan (Mar 26) to the previous one (Mar 12):\n\n**Score: 69 → 78** (+9 points)\n\n**What improved:**\n• 3 duplicate pricing rule variants were consolidated\n• Address validation logic was standardized to one version\n• 4 rarely-used trigger helpers were cleaned up\n\n**Still needs work:**\n• Quote sync wrappers are still repeated across 5 files\n• Renewal date helpers are still duplicated\n• 1 new group of similar discount approval code was detected\n\nOverall, your org is trending in the right direction.",
    actions: [
      { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
      { label: 'Run a new scan', actionId: 'new-scan' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'other-groups': {
    processingMessage: 'Looking at other patterns...',
    delay: 1500,
    content:
      "Beyond pricing logic, here are other groups of similar code I found:\n\n**Medium Priority:**\n• **Address Validation** — 4 similar implementations across Apex and LWC\n• **Quote Sync Wrappers** — 5 REST wrapper patterns with inconsistent retry logic\n• **Renewal Date Helpers** — 4 near-identical date normalization utilities\n• **Territory Assignment** — 6 variants of opportunity routing logic\n• **Forecast Rollup** — 3 identical aggregation utilities\n\n**Low Priority:**\n• **Invoice Tax Methods** — 4 similar tax computation approaches\n• **Case Escalation** — 5 trigger-based escalation branches\n• **Lead Scoring** — 3 legacy scoring implementations\n• **Discount Approval** — 4 threshold evaluators\n\nThe address validation and quote sync groups are the best candidates for cleanup after pricing.",
    actions: [
      { label: 'Tell me about address validation', actionId: 'address-detail' },
      { label: 'Go back to pricing logic', actionId: 'pricing-detail' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'address-detail': {
    processingMessage: 'Analyzing address validation code...',
    delay: 1500,
    content:
      "Your org has **4 implementations** of address validation:\n\n**Best version to keep:**\n`AddressValidationOrchestrator.validate()`\n• Used across account creation, lead conversion, and contact imports\n• Strongest validation coverage\n\n**Other versions:**\n• `LeadAddressHelper.normalizeAndValidate()` — Apex, similar but missing country-code mapping\n• `CheckoutAddressValidator.runValidation()` — Apex, only used in checkout flow\n• `LwcAddressUtils.verifyPostalAddress()` — LWC JS, client-side regex fallback\n\nConsolidating could eliminate ~280 lines of redundant logic. The LWC variant should call the shared service instead of doing its own validation.",
    actions: [
      { label: 'What should I do next?', actionId: 'recommendations' },
      { label: 'Go back to other groups', actionId: 'other-groups' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
};

const ACTION_LABELS: Record<string, string> = {
  'analyze-org': 'Analyze my org for reuse opportunities',
  'summarize-report': 'Summarize my latest report',
  'pricing-detail': 'Tell me about the pricing logic',
  'safe-remove': 'Which code can I consolidate or retire?',
  'safety-check': 'Is it safe to remove the legacy version?',
  comparison: "Compare what's the same vs different",
  recommendations: 'What should I do next?',
  'report-comparison': "What's changed since my last scan?",
  'other-groups': 'Tell me about other repeated code',
  'address-detail': 'Tell me about address validation',
  'new-scan': 'Run a new scan',
};

function getFreeFormResponse(text: string): ActionResponse {
  const lower = text.toLowerCase();

  if (lower.includes('duplicate') || lower.includes('lines') || lower.includes('remove')) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        'Based on the latest scan, your org has approximately **2,830 lines** of redundant logic that could be consolidated or retired through standardization. The biggest contributors are pricing logic (~420 lines), address validation (~280 lines), and quote sync wrappers (~350 lines).',
      actions: [
        { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
        { label: 'Which code can I consolidate or retire?', actionId: 'safe-remove' },
        { label: 'Go back to summary', actionId: 'analyze-org' },
      ],
    };
  }

  if (lower.includes('team')) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        'Looking at code ownership, the **Revenue Cloud Platform** team has the most repeated code patterns — primarily around pricing calculations and discount logic. The **Sales Operations** team is next, with overlapping quote and deal desk utilities. I\'d recommend starting cleanup conversations with these two teams.',
      actions: [
        { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
        { label: 'Tell me about other repeated code', actionId: 'other-groups' },
        { label: 'Go back to summary', actionId: 'analyze-org' },
      ],
    };
  }

  if (lower.includes('safe') || lower.includes('retire') || lower.includes('legacy')) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        "Before retiring any legacy code, I'd recommend: (1) verify all callers have been migrated, (2) check for indirect references through Flows and Process Builder, and (3) run a usage report for the past 30 days. The safest candidates right now are `LegacyPriceCalcService` and 3 date-formatting helpers with minimal usage.",
      actions: [
        { label: 'Is it safe to remove the legacy version?', actionId: 'safety-check' },
        { label: 'Which code can I consolidate or retire?', actionId: 'safe-remove' },
        { label: 'Go back to summary', actionId: 'analyze-org' },
      ],
    };
  }

  if (
    lower.includes('report') ||
    lower.includes('pdf') ||
    lower.includes('download')
  ) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        'You can download a detailed PDF report from the Code Reusability landing page — look for the download icon next to your latest scan in the audit table. The report includes all similarity groups, usage metrics, and recommended actions.',
      actions: [
        { label: 'Analyze my org for reuse opportunities', actionId: 'analyze-org' },
        { label: "What's changed since my last scan?", actionId: 'report-comparison' },
        { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
      ],
    };
  }

  return {
    processingMessage: 'Thinking...',
    delay: 1500,
    content:
      'I can help you explore your scan results. Try asking about specific code patterns, which implementations to keep, or what\'s safe to clean up.',
    actions: [
      { label: 'Analyze my org for reuse opportunities', actionId: 'analyze-org' },
      { label: 'Tell me about the pricing logic', actionId: 'pricing-detail' },
      { label: "What's changed since my last scan?", actionId: 'report-comparison' },
    ],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePageRaw] = useState('code-reusability');
  const [currentView, setCurrentView] = useState<'landing' | 'report' | 'playbook'>('landing');
  const [currentReportId, setCurrentReportId] = useState('rpt-001');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([WELCOME_MESSAGE]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [scanInProgress, setScanInProgress] = useState(false);

  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const id of timeoutRefs.current) clearTimeout(id);
    };
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  const setActivePage = useCallback(
    (page: string) => {
      setActivePageRaw(page);
      setCurrentView('landing');
    },
    [],
  );

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const toggleAgentPanel = useCallback(() => {
    setAgentPanelOpen((prev) => !prev);
  }, []);

  const addAgentMessage = useCallback((msg: AgentMessage) => {
    setAgentMessages((prev) => [...prev, msg]);
  }, []);

  const triggerScan = useCallback(() => {
    setScanInProgress(true);
    setProcessingMessage('Connecting to org...');

    const steps = [
      { msg: 'Analyzing Apex classes and methods...', delay: 1000 },
      { msg: 'Scanning triggers and LWC utilities...', delay: 1000 },
      { msg: 'Identifying similar patterns...', delay: 1000 },
      { msg: 'Generating report...', delay: 500 },
    ];

    let cumulative = 0;
    for (const step of steps) {
      cumulative += step.delay;
      const m = step.msg;
      scheduleTimeout(() => setProcessingMessage(m), cumulative);
    }

    cumulative += 500;
    scheduleTimeout(() => {
      setScanInProgress(false);
      setProcessingMessage('');
      showToast('Scan completed successfully', 'success');
    }, cumulative);
  }, [scheduleTimeout, showToast]);

  const handleAgentAction = useCallback(
    (actionId: string) => {
      if (actionId === 'new-scan') {
        addAgentMessage({
          id: crypto.randomUUID(),
          role: 'user',
          content: ACTION_LABELS[actionId] ?? actionId,
          timestamp: new Date().toISOString(),
        });
        triggerScan();
        return;
      }

      const response = ACTION_RESPONSES[actionId];
      if (!response) return;

      addAgentMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: ACTION_LABELS[actionId] ?? actionId,
        timestamp: new Date().toISOString(),
      });

      setIsProcessing(true);
      setProcessingMessage(response.processingMessage);

      scheduleTimeout(() => {
        setIsProcessing(false);
        setProcessingMessage('');
        addAgentMessage({
          id: crypto.randomUUID(),
          role: 'bot',
          content: response.content,
          timestamp: new Date().toISOString(),
          actions: response.actions,
        });
      }, response.delay);
    },
    [addAgentMessage, scheduleTimeout, triggerScan],
  );

  const sendAgentMessage = useCallback(
    (text: string) => {
      addAgentMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      });

      const response = getFreeFormResponse(text);

      setIsProcessing(true);
      setProcessingMessage(response.processingMessage);

      scheduleTimeout(() => {
        setIsProcessing(false);
        setProcessingMessage('');
        addAgentMessage({
          id: crypto.randomUUID(),
          role: 'bot',
          content: response.content,
          timestamp: new Date().toISOString(),
          actions: response.actions,
        });
      }, response.delay);
    },
    [addAgentMessage, scheduleTimeout],
  );

  return (
    <AppContext.Provider
      value={{
        activePage,
        currentView,
        currentReportId,
        toasts,
        agentPanelOpen,
        agentMessages,
        isProcessing,
        processingMessage,
        scanInProgress,
        setActivePage,
        setCurrentView,
        setCurrentReportId,
        showToast,
        toggleAgentPanel,
        setAgentPanelOpen,
        addAgentMessage,
        triggerScan,
        handleAgentAction,
        sendAgentMessage,
      }}
    >
      {children}

      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                background:
                  toast.type === 'success'
                    ? '#2e844a'
                    : toast.type === 'error'
                      ? '#c23934'
                      : '#0176d3',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                animation: 'toastIn 0.3s ease-out',
                whiteSpace: 'nowrap',
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
