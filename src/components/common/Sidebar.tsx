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
      const myReports = safeCases.filter(c =>
        Boolean(currentUser?.id && c.residentReporterId === currentUser.id)
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
          label: 'Emergency Incident Queue',
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
          label: 'MDRRMO incident reports'
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
          label: 'Governance & statistical reports'
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
          label: 'System & integrity'
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
        label: 'Governance & statistical reports'
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
        label: 'System & integrity'
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
      <div className="p-4 border-b border-rule flex items-center justify-between bg-paper transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-paper-2 rounded-md p-0.5 flex items-center justify-center border border-rule">
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
              className="w-full h-full object-contain rounded-sm"
            />
          </div>
          <div>
            <h1 className="font-bold text-sm text-ink leading-tight">
              {currentUser.agencyType === 'MDRRMO'
                ? 'MDRRMO Roxas'
                : currentUser.agencyType === 'LGU'
                  ? 'LGU Roxas'
                  : 'B-CONNECT'}
            </h1>
            <span className="text-xs text-muted block font-medium">
              {currentUser.agencyType === 'MDRRMO'
                ? 'Disaster risk & rescue'
                : currentUser.agencyType === 'LGU'
                  ? 'Municipal government'
                  : 'Roxas, Oriental Mindoro'}
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            id="btn-close-mobile-sidebar"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Operating Jurisdiction info pill */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-2.5 p-2 rounded-md border border-rule bg-paper-2 transition-colors">
          <div className="flex-shrink-0">
            {currentUser.agencyType === 'MDRRMO' ? (
              <img
                src="/mdrrmo_logo.png"
                alt="MDRRMO Seal"
                className="w-6 h-6 rounded-md object-contain bg-paper p-0.5 border border-rule"
              />
            ) : currentUser.agencyType === 'LGU' ? (
              <img
                src="/lgu_logo.png"
                alt="LGU Roxas Seal"
                className="w-6 h-6 rounded-md object-contain bg-paper p-0.5 border border-rule"
              />
            ) : (
              <div className="w-6 h-6 rounded-md bg-paper border border-rule flex items-center justify-center text-ink">
                {currentUser.agencyType === 'ADMIN' ? <Settings className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-ink truncate">
              {currentUser?.agencyName || 'Agency'}
            </div>
            <div className="text-xs text-muted truncate">
              {currentUser?.position || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div
                key={`header-${index}`}
                className="text-xs font-medium text-muted px-2.5 mt-3 mb-1"
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
              className={`w-full min-h-[36px] text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between group cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-paper-3 text-ink font-semibold border border-rule'
                  : 'text-ink-2 hover:bg-paper-2 hover:text-ink border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`transition-colors flex-shrink-0 ${
                    isActive ? 'text-accent' : 'text-muted group-hover:text-ink'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  {item.subtitle && (
                    <div className={`text-xs truncate ${isActive ? 'text-muted' : 'text-muted/80'}`}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {item.urgentAlert && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-1.5 py-0.5 rounded bg-paper-3 text-error border border-rule">
                    <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                    <span>{item.urgentAlert}</span>
                  </span>
                )}
                {item.badge !== undefined && !item.urgentAlert && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium border border-rule num ${
                      isActive
                        ? 'bg-accent text-accent-ink'
                        : 'bg-paper-2 text-ink'
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
          <div className="p-2.5 bg-paper-2 border border-rule rounded-md text-xs">
            <div className="flex items-center space-x-1.5 text-error font-semibold text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-error" />
              <span>Official complaints radar</span>
            </div>
            <p className="text-xs text-muted mt-1 leading-snug">
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
        className="hidden lg:flex w-64 bg-paper text-ink flex-col border-r border-rule flex-shrink-0 select-none"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Tablet Backdrop Overlay (< 1024px) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-50 lg:hidden motion-safe:transition-opacity motion-reduce:transition-none duration-300"
        />
      )}

      {/* Mobile & Tablet Slide-Over Drawer (< 1024px) */}
      <aside
        id="bconnect-sidebar-mobile"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-paper text-ink flex flex-col shadow-card border-r border-rule select-none transform motion-safe:transition-transform motion-reduce:transition-none duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};
