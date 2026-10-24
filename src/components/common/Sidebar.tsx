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
  Compass,
  Share2,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const { cases } = useCases();
  const { unreadNotifCount } = useNotifications();
  const { activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen } = useUI();

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
          id: 'incident_graph',
          label: 'Resident Cases Graph',
          subtitle: 'Citizen Reports to MDRRMO',
          icon: <Share2 className="w-4 h-4" />
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
      <div
        className={`p-4 sm:p-5 border-b flex items-center justify-between transition-colors ${isMdrrmo
            ? 'bg-orange-50/50 border-orange-100'
            : isLgu
              ? 'bg-gradient-to-r from-emerald-50/80 via-emerald-50/50 to-amber-50/40 border-emerald-200/90'
              : 'bg-emerald-50/40 border-emerald-100'
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 bg-white rounded-xl p-0.5 flex items-center justify-center shadow-xs border ${isMdrrmo
                ? 'border-orange-200/90'
                : isLgu
                  ? 'border-2 border-amber-400 ring-1 ring-emerald-700/20'
                  : 'border-emerald-200/80'
              }`}
          >
            <img
              src={
                currentUser.agencyType === 'MDRRMO'
                  ? '/mdrrmo_logo.png'
                  : currentUser.agencyType === 'LGU'
                    ? '/lgu_logo.png'
                    : '/bconnect_logo_transparent.png'
              }
              alt={
                currentUser.agencyType === 'MDRRMO'
                  ? 'MDRRMO Logo'
                  : currentUser.agencyType === 'LGU'
                    ? 'LGU Roxas Seal'
                    : 'B-CONNECT Logo'
              }
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <h1
              className={`font-extrabold tracking-tight text-base leading-tight ${isMdrrmo
                  ? 'text-slate-900'
                  : isLgu
                    ? 'text-[#062612]'
                    : 'text-emerald-950'
                }`}
            >
              {currentUser.agencyType === 'MDRRMO'
                ? 'MDRRMO ROXAS'
                : currentUser.agencyType === 'LGU'
                  ? 'LGU ROXAS'
                  : 'B-CONNECT'}
            </h1>
            <span
              className={`text-[9px] uppercase tracking-widest font-black block ${isMdrrmo
                  ? 'text-orange-600'
                  : isLgu
                    ? 'text-[#0f532a]'
                    : 'text-emerald-700'
                }`}
            >
              {currentUser.agencyType === 'MDRRMO'
                ? 'DISASTER RISK & RESCUE'
                : currentUser.agencyType === 'LGU'
                  ? 'MUNICIPAL GOVERNMENT'
                  : 'ROXAS, ORI. MINDORO'}
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            id="btn-close-mobile-sidebar"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${isMdrrmo
                ? 'text-orange-800 hover:text-orange-950 hover:bg-orange-100/70'
                : isLgu
                  ? 'text-emerald-900 hover:text-[#062612] hover:bg-emerald-100/80'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
              }`}
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Operating Jurisdiction info pill */}
      <div className="px-3 pt-3">
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${isMdrrmo
              ? 'bg-orange-50/70 border-orange-200/90 shadow-2xs'
              : isLgu
                ? 'bg-gradient-to-r from-emerald-50/90 to-amber-50/50 border-2 border-amber-400/70 shadow-2xs'
                : 'bg-emerald-50/70 border-emerald-200/80'
            }`}
        >
          <div className={`${isMdrrmo ? 'text-orange-700' : isLgu ? 'text-emerald-800' : 'text-emerald-700'} flex-shrink-0`}>
            {currentUser.agencyType === 'MDRRMO' ? (
              <img
                src="/mdrrmo_logo.png"
                alt="MDRRMO Seal"
                className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 border border-orange-300 shadow-2xs"
              />
            ) : currentUser.agencyType === 'LGU' ? (
              <img
                src="/lgu_logo.png"
                alt="LGU Roxas Seal"
                className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 border-2 border-amber-400 shadow-2xs"
              />
            ) : (
              <>
                {currentUser.agencyType === 'ADMIN' && <Settings className="w-4 h-4" />}
                {currentUser.agencyType === 'RESIDENT' && <UserPlus className="w-4 h-4" />}
              </>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-[11px] font-extrabold truncate ${isMdrrmo
                  ? 'text-slate-900'
                  : isLgu
                    ? 'text-[#062612]'
                    : 'text-emerald-950'
                }`}
            >
              {currentUser?.agencyName || 'Agency'}
            </div>
            <div
              className={`text-[10px] truncate font-semibold ${isMdrrmo
                  ? 'text-orange-800/90'
                  : isLgu
                    ? 'text-amber-800 font-bold'
                    : 'text-emerald-800/80'
                }`}
            >
              {currentUser?.position || ''}
            </div>
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
                className={`text-[10px] uppercase font-black px-3 mt-4 mb-1.5 tracking-widest ${isMdrrmo
                    ? 'text-orange-800/90'
                    : isLgu
                      ? 'text-[#0f532a]'
                      : 'text-emerald-800/70'
                  }`}
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
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${isActive
                  ? isMdrrmo
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white font-black shadow-md shadow-orange-600/20 border border-orange-500'
                    : isLgu
                      ? 'bg-gradient-to-r from-[#0b3d1f] via-[#0f532a] to-[#082e16] text-white font-black shadow-md border-2 border-amber-400/80 ring-1 ring-amber-300/30'
                      : 'bg-emerald-600 text-white font-bold shadow-xs'
                  : isMdrrmo
                    ? 'hover:bg-orange-50/80 text-slate-700 hover:text-orange-950 font-medium'
                    : isLgu
                      ? 'hover:bg-emerald-50/80 text-slate-700 hover:text-[#062612] font-medium'
                      : 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 font-medium'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-1 h-4 rounded-full flex-shrink-0 transition-colors ${isActive
                      ? isMdrrmo
                        ? 'bg-amber-300'
                        : isLgu
                          ? 'bg-amber-400'
                          : 'bg-white'
                      : isMdrrmo
                        ? 'bg-orange-200 group-hover:bg-orange-400'
                        : isLgu
                          ? 'bg-emerald-200 group-hover:bg-amber-400'
                          : 'bg-emerald-200 group-hover:bg-emerald-400'
                    }`}
                />
                <span
                  className={`transition-colors ${isActive
                      ? isLgu
                        ? 'text-amber-300'
                        : 'text-white'
                      : isMdrrmo
                        ? 'text-orange-600 group-hover:text-orange-800'
                        : isLgu
                          ? 'text-[#0f532a] group-hover:text-emerald-900'
                          : 'text-emerald-700 group-hover:text-emerald-900'
                    }`}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  {item.subtitle && (
                    <div
                      className={`text-[10px] truncate ${isActive
                          ? isMdrrmo
                            ? 'text-orange-100 font-medium'
                            : isLgu
                              ? 'text-amber-100/90 font-medium'
                              : 'text-emerald-100'
                          : 'text-slate-400'
                        }`}
                    >
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
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${item.badgeColor ||
                      (isActive
                        ? isMdrrmo
                          ? 'bg-orange-900/90 text-amber-200 border border-orange-400/40'
                          : isLgu
                            ? 'bg-amber-400 text-[#082e16] border border-amber-300'
                            : 'bg-emerald-700 text-white'
                        : isMdrrmo
                          ? 'bg-orange-100 text-orange-900 border border-orange-200'
                          : isLgu
                            ? 'bg-emerald-100 text-[#0f532a] border border-emerald-200'
                            : 'bg-emerald-100 text-emerald-800')
                      }`}
                  >
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

    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Laptop & Desktop screens >= 1024px) */}
      <aside
        id="bconnect-sidebar"
        className={`hidden lg:flex w-64 bg-white text-slate-700 flex-col border-r flex-shrink-0 select-none ${isMdrrmo ? 'border-orange-200/80' : isLgu ? 'border-emerald-200/90' : 'border-emerald-100'
          }`}
      >
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
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white text-slate-700 flex flex-col shadow-2xl border-r select-none transform transition-transform duration-300 ease-in-out lg:hidden ${isMdrrmo ? 'border-orange-200' : isLgu ? 'border-emerald-200' : 'border-emerald-200'
          } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};
