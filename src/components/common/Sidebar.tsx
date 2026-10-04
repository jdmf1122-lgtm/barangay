import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Clock,
  ArrowRightLeft,
  FileCheck2,
  Eye,
  BookOpenCheck,
  FilePieChart,
  Layers,
  History,
  Settings,
  Building2,
  Shield,
  ShieldAlert,
  Landmark,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogOut,
  Compass,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { cases } = useCases();
  const { unreadNotifCount } = useNotifications();
  const { activeTab, setActiveTab, setIsCreateAccountModalOpen, isMobileMenuOpen, setIsMobileMenuOpen } = useUI();

  const safeCases = cases || [];
  const officialComplaintsCount = safeCases.filter((c) => c.isInvolvingOfficial).length;

  const isMdrrmo = currentUser.agencyType === 'MDRRMO';
  const isLgu = currentUser.agencyType === 'LGU';
  const isAdmin = currentUser.agencyType === 'ADMIN';
  const isResident = currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT';

  // Role-filtered and tailored Navigation items
  const getNavItems = () => {
    // 0. RESIDENT CITIZEN VIEW (Clean, accessible, incident reporting & case tracker)
    if (isResident) {
      const brgyName = currentUser?.barangay || 'San Aquilino';
      const userName = (currentUser?.name || '').toLowerCase();
      const myReports = safeCases.filter(c =>
        c.residentReporterId === currentUser?.id ||
        (c.createdBy && c.createdBy.toLowerCase().includes(userName)) ||
        (c.complainants && c.complainants.some(p => (p.name || '').toLowerCase() === userName)) ||
        (c.barangay === brgyName && c.isCitizenReport)
      );

      return [
        {
          id: 'dashboard',
          label: 'Barangay Citizen Hub',
          subtitle: `Resident Portal • Brgy. ${brgyName}`,
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'submit_report',
          label: 'Report an Incident',
          icon: <UserPlus className="w-4 h-4 text-emerald-400" />,
          highlight: true
        },
        {
          id: 'my_reports',
          label: 'My Filed Reports',
          icon: <Clock className="w-4 h-4" />,
          badge: myReports.length > 0 ? myReports.length : undefined,
          badgeColor: 'bg-emerald-500 text-white'
        }
      ];
    }

    // 1. MDRRMO ACCOUNT VIEW (Emergency dispatch, rescue ops, municipal crash blotter)
    if (isMdrrmo) {
      const isMdrrmoAdmin = currentUser.role === 'MDRRMO_ADMIN';
      const brgyName = currentUser.barangay;
      const mdrrmoCases = brgyName
        ? safeCases.filter(c => c.barangay === brgyName || (c.originatingAgency && c.originatingAgency.includes(brgyName)))
        : safeCases;

      return [
        {
          id: 'dashboard',
          label: isMdrrmoAdmin ? 'MDRRMO Operations Hub' : 'MDRRMO Responder Hub',
          subtitle: isMdrrmoAdmin ? 'Emergency Dispatch & Command' : 'Field Response & Triage',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'cases',
          label: 'Crash Blotter & Incident Queue',
          subtitle: isMdrrmoAdmin ? 'Dispatch & Triage Queue' : 'Incident Triage & Intake',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          badge: mdrrmoCases.length
        },
        {
          id: 'gis_map',
          label: 'Municipal GIS Hazard Map',
          subtitle: 'Accident Blackspots & GPS',
          icon: <Compass className="w-4 h-4" />
        },
        {
          type: 'header',
          label: 'MDRRMO INCIDENT REPORTS'
        },
        {
          id: 'annual_narrative',
          label: 'Incident Narrative & Dispatches',
          subtitle: 'Rescue & Dispatch Log',
          icon: <BookOpenCheck className="w-4 h-4" />
        }
      ];
    }

    // 2. MUNICIPAL LGU VIEW (Executive Oversight, Action Queues, Governance)
    if (isLgu) {
      const isLguAdmin = currentUser.role === 'LGU_ADMINISTRATOR';

      return [
        {
          id: 'dashboard',
          label: isLguAdmin ? 'LGU Executive Dashboard' : 'LGU Department Dashboard',
          subtitle: isLguAdmin ? 'Municipal Executive Oversight' : 'Department Action Queue',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'transparency',
          label: 'Transparency & Oversight',
          subtitle: 'Municipal Performance KPIs',
          icon: <Eye className="w-4 h-4" />
        },
        {
          type: 'header',
          label: 'GOVERNANCE & STATISTICAL REPORTS'
        },
        {
          id: 'annual_narrative',
          label: 'Case Narrative',
          subtitle: 'Summaries & Outcomes',
          icon: <BookOpenCheck className="w-4 h-4" />
        },
        {
          id: 'standard_reports',
          label: 'Standard Governance Reports',
          subtitle: 'Comprehensive LGU Reports',
          icon: <Layers className="w-4 h-4" />
        },
        {
          type: 'header',
          label: 'SYSTEM & INTEGRITY'
        },
        {
          id: 'audit_trail',
          label: 'Audit Trail & Immutable Logs',
          subtitle: 'Security & Access Trail',
          icon: <History className="w-4 h-4" />
        },
        ...(isLguAdmin ? [
          {
            id: 'admin',
            label: 'System Admin & Setup',
            subtitle: 'Escalation Policy & Settings',
            icon: <Settings className="w-4 h-4" />
          }
        ] : [])
      ];
    }

    // 3. MASTER SYSTEM ADMIN (Master Node Control, Accounts, Audits)
    return [
      {
        id: 'dashboard',
        label: 'Master System Dashboard',
        subtitle: 'Master Node Control',
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        id: 'transparency',
        label: 'Transparency & Oversight',
        subtitle: 'Municipal Performance KPIs',
        icon: <Eye className="w-4 h-4" />
      },
      {
        type: 'header',
        label: 'GOVERNANCE & STATISTICAL REPORTS'
      },
      {
        id: 'annual_narrative',
        label: 'Case Narrative',
        subtitle: 'Summaries & Outcomes',
        icon: <BookOpenCheck className="w-4 h-4" />
      },
      {
        id: 'standard_reports',
        label: 'Standard Governance Reports',
        subtitle: 'Comprehensive LGU Reports',
        icon: <Layers className="w-4 h-4" />
      },
      {
        type: 'header',
        label: 'SYSTEM & INTEGRITY'
      },
      {
        id: 'audit_trail',
        label: 'Audit Trail & Immutable Logs',
        subtitle: 'Security & Access Trail',
        icon: <History className="w-4 h-4" />
      },
      {
        id: 'admin',
        label: 'System Admin & Setup',
        subtitle: 'Accounts & Configuration',
        icon: <Settings className="w-4 h-4" />
      }
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-base shadow-xs">
            B
          </div>
          <div>
            <h1 className="text-emerald-950 font-extrabold tracking-tight text-base leading-tight">
              B-CONNECT
            </h1>
            <span className="text-[9px] text-emerald-700 uppercase tracking-widest font-bold block">
              ROXAS, ORI. MINDORO
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            id="btn-close-mobile-sidebar"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70 transition cursor-pointer"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Operating Jurisdiction info pill */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-2.5 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80">
          <div className="text-emerald-700">
            {currentUser.agencyType === 'MDRRMO' && <ShieldAlert className="w-4 h-4 text-orange-600" />}
            {currentUser.agencyType === 'LGU' && <Landmark className="w-4 h-4" />}
            {currentUser.agencyType === 'ADMIN' && <Settings className="w-4 h-4" />}
            {currentUser.agencyType === 'RESIDENT' && <UserPlus className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-emerald-950 truncate">{currentUser?.agencyName || 'Agency'}</div>
            <div className="text-[10px] text-emerald-800/80 truncate font-medium">{currentUser?.position || ''}</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div
                key={`header-${index}`}
                className="text-[10px] uppercase font-bold text-emerald-800/70 px-3 mt-4 mb-1.5 tracking-widest"
              >
                {item.label}
              </div>
            );
          }

          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}${isMobile ? '-mobile' : ''}`}
              onClick={() => handleNavClick(item.id!)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between group cursor-pointer ${isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 font-medium'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-1 h-4 rounded-full flex-shrink-0 transition-colors ${isActive ? 'bg-white' : 'bg-emerald-200 group-hover:bg-emerald-400'}`} />
                <span className={`${isActive ? 'text-white' : 'text-emerald-700 group-hover:text-emerald-900'}`}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  {item.subtitle && (
                    <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {item.urgentAlert && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                    {item.urgentAlert}
                  </span>
                )}
                {item.badge !== undefined && !item.urgentAlert && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${item.badgeColor || (isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800')
                    }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Official Inquiries Quick Indicator (Shown only to Oversight agencies: LGU, ADMIN) */}
      {(isLgu || isAdmin) && officialComplaintsCount > 0 && (
        <div className="px-3 pb-2">
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
            <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-[10px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
              <span>Official Complaints Radar</span>
            </div>
            <p className="text-[10px] text-rose-700 mt-1 leading-snug font-medium">
              {officialComplaintsCount} active complaint{officialComplaintsCount > 1 ? 's' : ''} involving local officials under oversight.
            </p>
          </div>
        </div>
      )}

      {/* Footer User Profile Card, Create Account & Logout */}
      <div className="p-3 border-t border-emerald-100 bg-emerald-50/40 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-800 text-xs">
            {(currentUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'User'}</p>
            <p className="text-[10px] text-emerald-800/80 font-medium truncate">{currentUser?.position || ''}</p>
          </div>
          <button
            id={`btn-sidebar-logout${isMobile ? '-mobile' : ''}`}
            onClick={logout}
            title="Log Out (Sign Out)"
            className="p-1 rounded hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            id={`btn-sidebar-create-account${isMobile ? '-mobile' : ''}`}
            onClick={() => {
              setIsCreateAccountModalOpen(true);
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            className="w-full py-1 px-2 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 rounded-lg border border-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3 h-3 text-emerald-600" />
            <span>+ Account</span>
          </button>
          <button
            id={`btn-sidebar-logout-full${isMobile ? '-mobile' : ''}`}
            onClick={logout}
            className="w-full py-1 px-2 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-lg border border-rose-200 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3 h-3 text-rose-600" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Laptop & Desktop screens >= 1024px) */}
      <aside id="bconnect-sidebar" className="hidden lg:flex w-64 bg-white text-slate-700 flex-col border-r border-emerald-100 flex-shrink-0 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Tablet Backdrop Overlay (< 1024px) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile & Tablet Slide-Over Drawer (< 1024px) */}
      <aside
        id="bconnect-sidebar-mobile"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white text-slate-700 flex flex-col shadow-2xl border-r border-emerald-200 select-none transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};
