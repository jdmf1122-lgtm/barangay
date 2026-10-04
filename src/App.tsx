import React from 'react';
import { AppProviders } from './context/AppProviders';
import { useAuth } from './hooks/useAuth';
import { useUI } from './hooks/useUI';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MdrrmoDashboard } from './components/dashboards/MdrrmoDashboard';
import { LguDashboard } from './components/dashboards/LguDashboard';

import { TransparencyDashboard } from './components/dashboards/TransparencyDashboard';
import { CaseList } from './components/cases/CaseList';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { NewCaseModal } from './components/cases/NewCaseModal';
import { CreateAccountModal } from './components/auth/CreateAccountModal';
import { EditAccountModal } from './components/auth/EditAccountModal';
import { GeographicBarangayMap } from './components/graph/GeographicBarangayMap';
import { AnnualNarrativeReport } from './components/reports/AnnualNarrativeReport';
import { StandardReportsView } from './components/reports/StandardReportsView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { SystemAdminView } from './components/admin/SystemAdminView';
import { ResidentPortalView } from './components/resident/ResidentPortalView';
import { EmergencyAccidentAlarmModal } from './components/common/EmergencyAccidentAlarmModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { useEscalationMonitor } from './hooks/useEscalationMonitor';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const {
    activeTab,
    isEditAccountModalOpen,
    setIsEditAccountModalOpen,
    userToEdit
  } = useUI();

  // Active MDRRMO to LGU auto-escalation daemon
  useEscalationMonitor();

  // If user is not authenticated or currentUser is missing, show Auth (Login & Create Account) Portal
  if (!isAuthenticated || !currentUser) {
    return <AuthPage />;
  }

  const renderContent = () => {
    // If logged in as resident citizen, route directly to Resident Portal
    if (currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT') {
      if (activeTab === 'submit_report') {
        return <ResidentPortalView key="submit" initialTab="submit" />;
      }
      if (activeTab === 'my_reports') {
        return <ResidentPortalView key="my_reports" initialTab="my_reports" />;
      }

      if (activeTab === 'cases') {
        return <CaseList />;
      }
      return <ResidentPortalView key="overview" initialTab="overview" />;
    }

    switch (activeTab) {
      case 'resident_portal':
        return <ResidentPortalView key="overview" initialTab="overview" />;
      case 'submit_report':
        return <ResidentPortalView key="submit" initialTab="submit" />;
      case 'my_reports':
        return <ResidentPortalView key="my_reports" initialTab="my_reports" />;

      case 'dashboard':
        switch (currentUser?.agencyType) {
          case 'MDRRMO':
            return <MdrrmoDashboard />;
          case 'LGU':
            return <LguDashboard />;

          case 'ADMIN':
            return <SystemAdminView />;
          case 'RESIDENT':
            return <ResidentPortalView initialTab="overview" />;
          default:
            return <MdrrmoDashboard />;
        }
      case 'cases':
        return currentUser?.agencyType === 'LGU' ? <LguDashboard /> : <CaseList />;
      case 'gis_map':
        return <GeographicBarangayMap />;
      case 'transparency':
        return <TransparencyDashboard />;
      case 'annual_narrative':
        return <AnnualNarrativeReport />;
      case 'standard_reports':
        return <StandardReportsView />;
      case 'audit_trail':
        return <AuditTrailView />;
      case 'admin':
        return <SystemAdminView />;
      default:
        return currentUser?.agencyType === 'LGU' ? <LguDashboard /> : <CaseList />;
    }
  };

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-full bg-[#f5fbf7] flex flex-col font-sans text-slate-900 overflow-hidden antialiased selection:bg-emerald-600 selection:text-white" style={{ backgroundColor: '#f5fbf7' }}>
      {/* Top Header */}
      <Header />

      {/* Main Workspace Area (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Desktop persistent + Mobile slide-over drawer) */}
        <Sidebar />

        {/* Dynamic Page Container */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 space-y-4 sm:space-y-6 pb-24 lg:pb-7">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {renderContent()}
            </div>
          </main>

          {/* Light Green Balance System Footer (Hidden on small phone screens, shown on tablet/laptop) */}
          <footer className="hidden sm:flex h-9 lg:h-10 bg-white/90 border-t border-emerald-100 px-4 sm:px-6 lg:px-8 items-center justify-between text-[10px] text-emerald-800/70 font-medium select-none flex-shrink-0 backdrop-blur-xs">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden md:inline">Last System Audit: 4 mins ago</span>
              <span className="hidden md:inline text-emerald-200">|</span>
              <span className="font-mono text-emerald-900 font-semibold">Version 4.2.0-STABLE</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-emerald-900 font-medium truncate">Roxas Municipal Info Office</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0" />
              <span className="font-semibold text-emerald-700">System Fully Encrypted</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens < 1024px) */}
      <MobileBottomNav />

      {/* Global Modals */}
      <CaseDetailModal />
      <NewCaseModal />
      <CreateAccountModal />
      <EditAccountModal
        isOpen={isEditAccountModalOpen}
        onClose={() => setIsEditAccountModalOpen(false)}
        userToEdit={userToEdit}
      />
      <EmergencyAccidentAlarmModal />
    </div>
  );
};

import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
