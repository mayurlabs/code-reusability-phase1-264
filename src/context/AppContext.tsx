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
  currentView: 'landing' | 'report' | 'playbook' | 'pdf';
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
    "Hi, I'm Agentforce! I can help you understand duplicate code in your org, find easy cleanup opportunities, and guide you through refactoring. What would you like to explore?",
  timestamp: new Date().toISOString(),
  actions: [
    { label: 'Scan my org for duplicate code', actionId: 'analyze-org' },
    { label: 'What are the easy wins?', actionId: 'easy-wins' },
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
    processingMessage: 'Scanning for duplicate code...',
    delay: 2500,
    content:
      "Here's a summary of your latest Clone Detection scan:\n\n**Org:** Northstar Retail Group\n**Files Analyzed:** 785\n**Clone Groups Found:** 318\n**Characters Saved:** 424,685\n\nBreakdown:\n• **142 file-level duplicates** — identical files that can be deleted\n• **126 method-level clones** — similar methods to extract and consolidate\n• **50 block-level clones** — repeated code blocks within methods\n\nThe easiest wins are the file-level duplicates — most are LOW effort deletions.",
    actions: [
      { label: 'Show me the easy wins', actionId: 'easy-wins' },
      { label: 'What are the biggest duplicates?', actionId: 'biggest' },
      { label: 'What changed since last scan?', actionId: 'report-comparison' },
    ],
  },
  'easy-wins': {
    processingMessage: 'Finding low-effort duplicates...',
    delay: 1800,
    content:
      "Here are your easiest cleanup opportunities — exact duplicate files that can be deleted with LOW effort:\n\n1. `GetCasesByAssigneeIdDataView.cls` — 7 identical copies, 13,608 chars\n   Recipe: Delete 6 copies, keep 1, redirect callers\n\n2. `GuestPastClaimsSummaryGenerator.cls` — 3 identical copies, 6,654 chars\n   Recipe: Delete 2, keep 1\n\n3. `ClaimPaymentCurrencyTriggerHandler.cls` — 3 identical copies, 6,058 chars\n   Recipe: Delete 2, keep 1\n\n4. `FeedCommentTriggerHandler.cls` — 2 identical copies, 4,597 chars\n   Recipe: Delete 1, keep 1\n\nThese 4 groups alone could save ~30,917 characters of duplicate code with minimal risk.",
    actions: [
      { label: 'Tell me about the case data views', actionId: 'case-detail' },
      { label: 'What needs more review?', actionId: 'near-dupes' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  biggest: {
    processingMessage: 'Finding largest duplicates...',
    delay: 1800,
    content:
      "The largest duplicate code groups by characters saved:\n\n1. `GetCasesByAssigneeIdDataView.cls` — **13,608 chars** across 7 copies (file duplicate)\n2. `ViaductListingDataService.getListingD...` — **12,660 chars** across 6 copies (method clone)\n3. `ViaductReviewsService.buildGuestRevie...` — **8,260 chars** across 3 copies (method clone)\n4. `BooleanEqualityEvaluator.runEvaluator...` — **6,780 chars** across 8 copies (method clone)\n5. `GuestPastClaimsSummaryGenerator.cls` — **6,654 chars** across 3 copies (file duplicate)\n\nThe top 5 groups account for ~47,962 characters of duplicate code.",
    actions: [
      { label: 'Show me the easy wins', actionId: 'easy-wins' },
      { label: 'What needs more review?', actionId: 'near-dupes' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'case-detail': {
    processingMessage: 'Analyzing case data views...',
    delay: 2000,
    content:
      "**GetCasesByAssigneeIdDataView.cls** — 7 identical copies\n\nThese are data view classes for the Case Management module. Each file extends `BaseDataView` and implements a `getCases()` method with a different filter field:\n\n• GetCasesByAssigneeIdDataView.cls (keep this one)\n• GetCasesByCaseFolderIdDataView.cls\n• GetCasesByCustomerDataView.cls\n• GetCasesByIdsDataView.cls\n• GetCasesByItemEntityTokenDataView.cls\n• GetCasesByListingIdDataView.cls\n• GetCasesByReservationDataView.cls\n\n**Recipe:** Delete 6 files. Keep `GetCasesByAssigneeIdDataView.cls` as the representative. Parameterize the filter field so one class handles all query types.\n\n**Callers:** Each copy is referenced by 1-2 controllers. All callers can be redirected to the surviving copy.\n\n**Effort:** LOW — straightforward file deletion + caller redirect.",
    actions: [
      { label: 'Is it safe to delete these?', actionId: 'safety-check' },
      { label: 'What about near duplicates?', actionId: 'near-dupes' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'safety-check': {
    processingMessage: 'Checking references...',
    delay: 2000,
    content:
      "Checking callers for the 6 copies to be deleted:\n\n• `GetCasesByCaseFolderIdDataView.cls` — referenced by `CaseFolderController` → redirect to representative ✓\n• `GetCasesByCustomerDataView.cls` — referenced by `CustomerCasePanel` → redirect ✓\n• `GetCasesByIdsDataView.cls` — referenced by `CaseBatchProcessor` → redirect ✓\n• `GetCasesByItemEntityTokenDataView.cls` — referenced by `ItemTokenService` → redirect ✓\n• `GetCasesByListingIdDataView.cls` — referenced by `ListingCaseController` → redirect ✓\n• `GetCasesByReservationDataView.cls` — referenced by `ReservationCaseView` → redirect ✓\n\n**All 6 copies are safe to delete.** Each has only 1 caller that can be easily redirected to the surviving `GetCasesByAssigneeIdDataView.cls`.",
    actions: [
      { label: 'What about near duplicates?', actionId: 'near-dupes' },
      { label: 'What should I do first?', actionId: 'recommendations' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'near-dupes': {
    processingMessage: 'Analyzing near duplicates...',
    delay: 2000,
    content:
      "Near duplicates require more review because the code isn't identical — there are small differences to resolve:\n\n**HIGH priority:**\n• `SummaryAuditGenerator.fetchGuestClaim...` — 2 copies, differs in error handling approach\n• `VlocitySummaryAuditGenerator.fetchHos...` — 2 copies, differs in data mapping logic\n• `ViaductListingDataService.buildListin...` — 2 copies, same listing construction with different field sets\n• `FSCEvidenceValidationController.compl...` — 2 copies, validation orchestration with different completion rules\n\n**MEDIUM priority:**\n• `ViaductListingDataService.getListingD...` — 6 copies, same query pattern with different filters\n• `ViaductReviewsService.buildGuestRevie...` — 3 copies, review builder with different guest types\n• `BooleanEqualityEvaluator.runEvaluator...` — 8 copies, simple boolean pattern repeated\n\n**Recipe for most:** Extract a shared method and parameterize the differences.",
    actions: [
      { label: 'Tell me about the listing data methods', actionId: 'listing-detail' },
      { label: 'What should I do first?', actionId: 'recommendations' },
      { label: 'Go back to easy wins', actionId: 'easy-wins' },
    ],
  },
  'listing-detail': {
    processingMessage: 'Analyzing listing data service...',
    delay: 1500,
    content:
      "`ViaductListingDataService.getListingD...` — 6 near-duplicate methods\n\nThese 6 methods all fetch listing data but with different filters:\n• `getListingDataByHostId()` — filters by host ID\n• `getListingDataByRegion()` — filters by region\n• `getListingDataByStatus()` — filters by listing status\n• `getListingDataByCategory()` — filters by category\n• `getListingDataByPrice()` — filters by price range\n• `getListingDataByAvailability()` — filters by date availability\n\n**What's the same:** SOQL query structure, field selection, response mapping, error handling\n**What's different:** Only the WHERE clause filter\n\n**Recipe:** Extract one `getListingData(FilterType, FilterValue)` method and pass the filter as a parameter. This eliminates 5 redundant methods.\n\n**Effort:** MEDIUM — need to update callers to pass the filter parameter.",
    actions: [
      { label: 'What should I do first?', actionId: 'recommendations' },
      { label: 'Go back to near duplicates', actionId: 'near-dupes' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  recommendations: {
    processingMessage: 'Building cleanup plan...',
    delay: 1800,
    content:
      "Here's my recommended cleanup plan, ordered by impact and effort:\n\n**Phase 1 — Easy wins (this sprint):**\n1. Delete 6 copies of `GetCasesByAssigneeIdDataView.cls` → saves 13,608 chars\n2. Delete 2 copies of `GuestPastClaimsSummaryGenerator.cls` → saves 6,654 chars\n3. Delete 2 copies of `ClaimPaymentCurrencyTriggerHandler.cls` → saves 6,058 chars\n4. Delete 1 copy of `FeedCommentTriggerHandler.cls` → saves 4,597 chars\n\n**Phase 2 — Method consolidation (next sprint):**\n5. Extract shared method for `ViaductListingDataService.getListingD...` (6 copies)\n6. Consolidate `BooleanEqualityEvaluator.runEvaluator...` (8 copies)\n7. Merge `ViaductReviewsService.buildGuestRevie...` (3 copies)\n\n**Phase 3 — Complex refactoring (plan for later):**\n8. Review and consolidate remaining HIGH-priority near duplicates\n\nRe-run the scan after each phase to measure improvement.",
    actions: [
      { label: 'What changed since last scan?', actionId: 'report-comparison' },
      { label: 'Go back to easy wins', actionId: 'easy-wins' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
  'report-comparison': {
    processingMessage: 'Comparing scans...',
    delay: 1800,
    content:
      "Comparing your latest scan (Mar 26) to the previous one (Mar 12):\n\n**Score: 69 → 78** (+9 points)\n\n**What improved:**\n• 12 file-level duplicates were deleted\n• 3 method-level clones were consolidated into shared methods\n• Total chars saved increased by 28,400\n\n**Still needs work:**\n• 142 file-level duplicates remain\n• 126 method-level clones still need review\n• 5 new clone groups detected in recent code changes\n\nOverall, your org is trending in the right direction.",
    actions: [
      { label: 'Show me the easy wins', actionId: 'easy-wins' },
      { label: 'Run a new scan', actionId: 'new-scan' },
      { label: 'Go back to summary', actionId: 'analyze-org' },
    ],
  },
};

const ACTION_LABELS: Record<string, string> = {
  'analyze-org': 'Scan my org for duplicate code',
  'easy-wins': 'What are the easy wins?',
  biggest: 'What are the biggest duplicates?',
  'case-detail': 'Tell me about the case data views',
  'safety-check': 'Is it safe to delete these?',
  'near-dupes': 'What about near duplicates?',
  'listing-detail': 'Tell me about the listing data methods',
  recommendations: 'What should I do first?',
  'report-comparison': "What's changed since my last scan?",
  'new-scan': 'Run a new scan',
};

function getFreeFormResponse(text: string): ActionResponse {
  const lower = text.toLowerCase();

  if (lower.includes('duplicate') || lower.includes('clone') || lower.includes('delete')) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        'Based on the latest scan, your org has **318 clone groups** with **424,685 characters** of duplicate code that could be removed. The biggest contributors are file-level duplicates (142 groups) and method-level clones (126 groups).',
      actions: [
        { label: 'Show me the easy wins', actionId: 'easy-wins' },
        { label: 'What are the biggest duplicates?', actionId: 'biggest' },
        { label: 'Go back to summary', actionId: 'analyze-org' },
      ],
    };
  }

  if (lower.includes('safe') || lower.includes('remove')) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        "Before removing any duplicate, I'd recommend checking its callers first. Each copy may be referenced by controllers, triggers, or services that need to be redirected to the surviving copy. I can check specific files for you — just ask about a particular clone group.",
      actions: [
        { label: 'Is it safe to delete these?', actionId: 'safety-check' },
        { label: 'Show me the easy wins', actionId: 'easy-wins' },
        { label: 'Go back to summary', actionId: 'analyze-org' },
      ],
    };
  }

  if (lower.includes('method') || lower.includes('extract') || lower.includes('consolidate')) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        'For near-duplicate methods, the best approach is to extract a shared method and parameterize the differences. For example, 6 copies of `ViaductListingDataService.getListingD...` all do the same SOQL query with different WHERE clauses — extracting one parameterized method eliminates 5 redundant copies.',
      actions: [
        { label: 'Tell me about the listing data methods', actionId: 'listing-detail' },
        { label: 'What about near duplicates?', actionId: 'near-dupes' },
        { label: 'Go back to summary', actionId: 'analyze-org' },
      ],
    };
  }

  if (
    lower.includes('report') ||
    lower.includes('pdf')
  ) {
    return {
      processingMessage: 'Thinking...',
      delay: 1500,
      content:
        'You can download a detailed PDF report from the Clone Detection landing page — look for the download icon next to your latest scan in the audit table. The report includes all clone groups, character counts, and recommended recipes.',
      actions: [
        { label: 'Scan my org for duplicate code', actionId: 'analyze-org' },
        { label: "What's changed since my last scan?", actionId: 'report-comparison' },
        { label: 'Show me the easy wins', actionId: 'easy-wins' },
      ],
    };
  }

  return {
    processingMessage: 'Thinking...',
    delay: 1500,
    content:
      'I can help you explore your clone detection results. Try asking about duplicate files, easy wins, near duplicates, or what\'s changed since your last scan.',
    actions: [
      { label: 'Scan my org for duplicate code', actionId: 'analyze-org' },
      { label: 'What are the easy wins?', actionId: 'easy-wins' },
      { label: "What's changed since my last scan?", actionId: 'report-comparison' },
    ],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePageRaw] = useState('code-reusability');
  const [currentView, setCurrentView] = useState<'landing' | 'report' | 'playbook' | 'pdf'>('landing');
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
