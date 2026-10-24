import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Compass,
  Menu,
  Clock,
  UserCheck,
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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around select-none"
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
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'dashboard' || activeTab === 'resident_portal'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-emerald-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'dashboard' || activeTab === 'resident_portal' ? 'bg-emerald-50' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Citizen Hub</span>
        </button>

        {/* 2. Report Incident (Prominent Action) */}
        <button
          id="mobile-nav-report"
          type="button"
          onClick={() => {
            setActiveTab('submit_report');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'submit_report'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-emerald-800'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 active:scale-95 transition">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold leading-tight">Report</span>
        </button>

        {/* 3. My Reports */}
        <button
          id="mobile-nav-cases"
          type="button"
          onClick={() => {
            setActiveTab('my_reports');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'my_reports'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-emerald-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'my_reports' ? 'bg-emerald-50' : ''}`}>
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">My Reports</span>
        </button>

        {/* 4. Menu Drawer Toggle */}
        <button
          id="mobile-nav-drawer-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            isMobileMenuOpen
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-emerald-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${isMobileMenuOpen ? 'bg-emerald-50' : ''}`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Menu</span>
        </button>
      </nav>
    );
  }

  // LGU Executive / Municipal Administration View (Dashboard, Transparency, Narrative, Menu)
  // Spec: Remove "GIS Map" and "New (+)" for LGU on mobile since LGU focuses on executive governance and oversight
  if (isLgu) {
    return (
      <nav
        id="bconnect-mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation - LGU"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-1.5 flex items-center justify-around select-none transition-colors"
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
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-[#0f532a] font-black'
              : 'text-slate-500 hover:text-[#062612]'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              activeTab === 'dashboard' ? 'bg-emerald-50/90 border border-amber-300/50' : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Dashboard</span>
        </button>

        {/* 2. Transparency & Oversight */}
        <button
          id="mobile-nav-transparency"
          type="button"
          onClick={() => {
            setActiveTab('transparency');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'transparency'
              ? 'text-[#0f532a] font-black'
              : 'text-slate-500 hover:text-[#062612]'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              activeTab === 'transparency' ? 'bg-emerald-50/90 border border-amber-300/50' : ''
            }`}
          >
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Transparency</span>
        </button>

        {/* 3. Case Narrative & Outcomes */}
        <button
          id="mobile-nav-narrative"
          type="button"
          onClick={() => {
            setActiveTab('annual_narrative');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            activeTab === 'annual_narrative'
              ? 'text-[#0f532a] font-black'
              : 'text-slate-500 hover:text-[#062612]'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              activeTab === 'annual_narrative' ? 'bg-emerald-50/90 border border-amber-300/50' : ''
            }`}
          >
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Narrative</span>
        </button>

        {/* 4. Menu Drawer Toggle */}
        <button
          id="mobile-nav-drawer-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
            isMobileMenuOpen
              ? 'text-[#0f532a] font-black'
              : 'text-slate-500 hover:text-[#062612]'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              isMobileMenuOpen ? 'bg-emerald-50/90 border border-amber-300/50' : ''
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Menu</span>
        </button>
      </nav>
    );
  }

  // MDRRMO Responders & Field Operations View (Dashboard, Blotter, Elevated New, GIS Map, Menu)
  return (
    <nav
      id="bconnect-mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around select-none transition-colors ${
        isMdrrmo ? 'border-orange-100' : 'border-emerald-100'
      }`}
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
        className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
          activeTab === 'dashboard'
            ? isMdrrmo
              ? 'text-orange-700 font-bold'
              : 'text-emerald-700 font-bold'
            : isMdrrmo
            ? 'text-slate-500 hover:text-orange-800'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition ${
            activeTab === 'dashboard'
              ? isMdrrmo
                ? 'bg-orange-50'
                : 'bg-emerald-50'
              : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">Dashboard</span>
      </button>

      {/* 2. Blotter */}
      <button
        id="mobile-nav-cases"
        type="button"
        onClick={() => {
          setActiveTab('cases');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
          activeTab === 'cases'
            ? isMdrrmo
              ? 'text-orange-700 font-bold'
              : 'text-emerald-700 font-bold'
            : isMdrrmo
            ? 'text-slate-500 hover:text-orange-800'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition ${
            activeTab === 'cases'
              ? isMdrrmo
                ? 'bg-orange-50'
                : 'bg-emerald-50'
              : ''
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">Blotter</span>
      </button>

      {/* 3. Resident Cases Graph */}
      <button
        id="mobile-nav-map"
        type="button"
        onClick={() => {
          setActiveTab('incident_graph');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
          activeTab === 'incident_graph'
            ? isMdrrmo
              ? 'text-orange-700 font-bold'
              : 'text-emerald-700 font-bold'
            : isMdrrmo
            ? 'text-slate-500 hover:text-orange-800'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition ${
            activeTab === 'incident_graph'
              ? isMdrrmo
                ? 'bg-orange-50'
                : 'bg-emerald-50'
              : ''
          }`}
        >
          <Share2 className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">Cases Graph</span>
      </button>

      {/* 4. Menu Drawer Toggle */}
      <button
        id="mobile-nav-drawer-toggle"
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
          isMobileMenuOpen
            ? isMdrrmo
              ? 'text-orange-700 font-bold'
              : 'text-emerald-700 font-bold'
            : isMdrrmo
            ? 'text-slate-500 hover:text-orange-800'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition ${
            isMobileMenuOpen
              ? isMdrrmo
                ? 'bg-orange-50'
                : 'bg-emerald-50'
              : ''
          }`}
        >
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">Menu</span>
      </button>
    </nav>
  );
};
