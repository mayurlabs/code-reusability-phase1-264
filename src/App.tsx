import { useEffect, useRef } from 'react';
import { useAppContext } from './context/AppContext';
import { GlobalHeader, SetupHeader } from './components/GlobalHeader';
import { LeftNav } from './components/LeftNav';
import { AgentPanel } from './components/AgentPanel';
import CodeReusabilityLanding from './pages/CodeReusabilityLanding';
import ScanReport from './pages/ScanReport';
import PlaybookPage from './pages/PlaybookPage';
import ApexGuruPage from './pages/ApexGuruPage';
import CodeModernisationPage from './pages/CodeModernisationPage';

export default function App() {
  const {
    activePage,
    currentView,
    currentReportId,
    agentPanelOpen,
    setCurrentView,
    setCurrentReportId,
  } = useAppContext();

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [activePage, currentView]);

  function handleViewReport(id: string) {
    if (id === 'playbook') {
      setCurrentView('playbook');
    } else {
      setCurrentReportId(id);
      setCurrentView('report');
    }
  }

  function handleGenerateReport() {
    setCurrentView('report');
  }

  function handleBackToLanding() {
    setCurrentView('landing');
  }

  function renderContent() {
    switch (activePage) {
      case 'code-reusability':
        if (currentView === 'report') {
          return <ScanReport reportId={currentReportId} onBack={handleBackToLanding} />;
        }
        if (currentView === 'playbook') {
          return <PlaybookPage onBack={handleBackToLanding} />;
        }
        return (
          <CodeReusabilityLanding
            onViewReport={handleViewReport}
            onGenerateReport={handleGenerateReport}
          />
        );
      case 'apex-guru':
        return <ApexGuruPage />;
      case 'code-modernisation':
        return <CodeModernisationPage />;
      default:
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--sf-text-muted)',
              fontSize: 14,
            }}
          >
            Select a tool from the left navigation
          </div>
        );
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--sf-body-bg)',
        color: 'var(--sf-text)',
      }}
    >
      <GlobalHeader />
      <SetupHeader />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftNav />

        <main
          ref={mainRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px 28px',
            background: 'var(--sf-body-bg)',
            minWidth: 0,
          }}
        >
          {renderContent()}
        </main>

        {agentPanelOpen && <AgentPanel />}
      </div>
    </div>
  );
}
