import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Compass,
  Menu,
  Clock,
  UserCheck,
  BookOpenCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeTab,
    setActiveTab,
    setIsNewCaseModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useUI();

  if (!currentUser) return null;

  const isResident = currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT';
  const isLgu = currentUser?.agencyType === 'LGU';

  const handleCenterAction = () => {
    if (isResident) {
      setActiveTab('submit_report');
    } else {
      setIsNewCaseModalOpen(true);
    }
  };

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

  // Non-Resident Official / Responder View (Dashboard, Blotter/Narrative, Elevated New, GIS Map, Menu)
  return (
    <nav
      id="bconnect-mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around select-none"
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
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-emerald-50' : ''}`}>
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">Dashboard</span>
      </button>

      {/* 2. Blotter / Narrative */}
      <button
        id="mobile-nav-cases"
        type="button"
        onClick={() => {
          setActiveTab(isLgu ? 'annual_narrative' : 'cases');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
          activeTab === 'cases' || (isLgu && activeTab === 'annual_narrative')
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${activeTab === 'cases' || (isLgu && activeTab === 'annual_narrative') ? 'bg-emerald-50' : ''}`}>
          {isLgu ? <BookOpenCheck className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">
          {isLgu ? 'Narrative' : 'Blotter'}
        </span>
      </button>

      {/* 3. Center Elevated Action Button (+ New) */}
      <div className="flex flex-col items-center justify-center px-1">
        <button
          id="mobile-nav-center-action"
          type="button"
          onClick={handleCenterAction}
          className="w-12 h-12 -mt-5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-4 ring-white active:scale-95 transition cursor-pointer"
          title="Record New Incident"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
        <span className="text-[9px] font-bold text-emerald-900 mt-1 leading-tight">
          New
        </span>
      </div>

      {/* 4. GIS Hazard Map */}
      <button
        id="mobile-nav-map"
        type="button"
        onClick={() => {
          setActiveTab('gis_map');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer ${
          activeTab === 'gis_map'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${activeTab === 'gis_map' ? 'bg-emerald-50' : ''}`}>
          <Compass className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight">GIS Map</span>
      </button>

      {/* 5. Menu Drawer Toggle */}
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
};
