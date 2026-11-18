import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Menu,
  Clock,
  BookOpenCheck,
  Eye,
  Share2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useUI();

  if (!currentUser) return null;

  const isResident = currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT';
  const isLgu = currentUser?.agencyType === 'LGU';
  const isMdrrmo = currentUser?.agencyType === 'MDRRMO';

  if (isResident) {
    return (
      <nav
        id="bconnect-mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper border-t border-rule px-2 py-1 flex items-center justify-around select-none transition-colors"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {/* 1. Citizen Hub */}
        <button
          id="mobile-nav-dashboard"
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'dashboard' || activeTab === 'resident_portal'
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${activeTab === 'dashboard' || activeTab === 'resident_portal' ? 'bg-paper-2 text-accent' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">Citizen hub</span>
        </button>

        {/* 2. Report Incident (Prominent Action) */}
        <button
          id="mobile-nav-report"
          type="button"
          onClick={() => {
            setActiveTab('submit_report');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'submit_report'
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-accent text-accent-ink flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs mt-0.5 font-semibold leading-tight">Report</span>
        </button>

        {/* 3. My Reports */}
        <button
          id="mobile-nav-cases"
          type="button"
          onClick={() => {
            setActiveTab('my_reports');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'my_reports'
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${activeTab === 'my_reports' ? 'bg-paper-2 text-accent' : ''}`}>
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">My reports</span>
        </button>

        {/* 4. Menu Drawer Toggle */}
        <button
          id="mobile-nav-drawer-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            isMobileMenuOpen
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${isMobileMenuOpen ? 'bg-paper-2 text-accent' : ''}`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">Menu</span>
        </button>
      </nav>
    );
  }

  // LGU Executive / Municipal Administration View (Dashboard, Transparency, Narrative, Menu)
  if (isLgu) {
    return (
      <nav
        id="bconnect-mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation - LGU"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper border-t border-rule px-3 py-1 flex items-center justify-around select-none transition-colors"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {/* 1. Executive Dashboard */}
        <button
          id="mobile-nav-dashboard"
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'dashboard'
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'bg-paper-2 text-accent' : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">Dashboard</span>
        </button>

        {/* 2. Transparency & Oversight */}
        <button
          id="mobile-nav-transparency"
          type="button"
          onClick={() => {
            setActiveTab('transparency');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'transparency'
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              activeTab === 'transparency' ? 'bg-paper-2 text-accent' : ''
            }`}
          >
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">Transparency</span>
        </button>

        {/* 3. Case Narrative & Outcomes */}
        <button
          id="mobile-nav-narrative"
          type="button"
          onClick={() => {
            setActiveTab('annual_narrative');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'annual_narrative'
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              activeTab === 'annual_narrative' ? 'bg-paper-2 text-accent' : ''
            }`}
          >
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">Narrative</span>
        </button>

        {/* 4. Menu Drawer Toggle */}
        <button
          id="mobile-nav-drawer-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            isMobileMenuOpen
              ? 'text-accent font-semibold'
              : 'text-muted hover:text-ink'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              isMobileMenuOpen ? 'bg-paper-2 text-accent' : ''
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-xs mt-0.5 leading-tight">Menu</span>
        </button>
      </nav>
    );
  }

  // MDRRMO Responders & Field Operations View (Dashboard, Incidents, Cases Graph, Menu)
  return (
    <nav
      id="bconnect-mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper border-t border-rule px-2 py-1 flex items-center justify-around select-none transition-colors"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 1. Dashboard */}
      <button
        id="mobile-nav-dashboard"
        type="button"
        onClick={() => {
          setActiveTab('dashboard');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
          activeTab === 'dashboard'
            ? 'text-accent font-semibold'
            : 'text-muted hover:text-ink'
        }`}
      >
        <div
          className={`p-1 rounded-md transition-colors ${
            activeTab === 'dashboard' ? 'bg-paper-2 text-accent' : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5 leading-tight">Dashboard</span>
      </button>

      {/* 2. Incidents */}
      <button
        id="mobile-nav-cases"
        type="button"
        onClick={() => {
          setActiveTab('cases');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
          activeTab === 'cases'
            ? 'text-accent font-semibold'
            : 'text-muted hover:text-ink'
        }`}
      >
        <div
          className={`p-1 rounded-md transition-colors ${
            activeTab === 'cases' ? 'bg-paper-2 text-accent' : ''
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5 leading-tight">{isMdrrmo ? 'Incidents' : 'Cases'}</span>
      </button>

      {/* 3. Resident Cases Graph */}
      <button
        id="mobile-nav-map"
        type="button"
        onClick={() => {
          setActiveTab('incident_graph');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
          activeTab === 'incident_graph'
            ? 'text-accent font-semibold'
            : 'text-muted hover:text-ink'
        }`}
      >
        <div
          className={`p-1 rounded-md transition-colors ${
            activeTab === 'incident_graph' ? 'bg-paper-2 text-accent' : ''
          }`}
        >
          <Share2 className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5 leading-tight">Cases graph</span>
      </button>

      {/* 4. Menu Drawer Toggle */}
      <button
        id="mobile-nav-drawer-toggle"
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
          isMobileMenuOpen
            ? 'text-accent font-semibold'
            : 'text-muted hover:text-ink'
        }`}
      >
        <div
          className={`p-1 rounded-md transition-colors ${
            isMobileMenuOpen ? 'bg-paper-2 text-accent' : ''
          }`}
        >
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5 leading-tight">Menu</span>
      </button>
    </nav>
  );
};
