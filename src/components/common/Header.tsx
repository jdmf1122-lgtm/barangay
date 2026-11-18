import React, { useState, useEffect } from 'react';
import {
  Bell,
  Shield,
  ShieldAlert,
  UserCheck,
  Building2,
  Landmark,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  LogOut,
  Edit3,
  Send,
  Radio,
  Clock,
  Sparkles,
  Menu,
  X,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';
import { formatDate } from '../../utils/reportGenerators';
import { getRoleNotificationMeta } from '../../utils/notificationHelpers';
import { CreateNotificationModal } from './CreateNotificationModal';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = () => {
  const { currentUser, logout } = useAuth();
  const { setSelectedCaseId } = useCases();
  const { unreadNotifCount, userNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useNotifications();
  const { isDark, toggleTheme, setIsNewCaseModalOpen, openEditAccountModal, setActiveTab, searchQuery, setSearchQuery, activeTab, isMobileMenuOpen, setIsMobileMenuOpen } = useUI();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCreateNotifModalOpen, setIsCreateNotifModalOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  // Close modals/popovers on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsRoleDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleNotif = () => {
    setIsRoleDropdownOpen(false);
    setIsNotifOpen((prev) => !prev);
  };

  const toggleRoleDropdown = () => {
    setIsNotifOpen(false);
    setIsRoleDropdownOpen((prev) => !prev);
  };

  if (!currentUser) return null;

  const isMdrrmo = currentUser.agencyType === 'MDRRMO';
  const isLgu = currentUser.agencyType === 'LGU';
  const roleMeta = getRoleNotificationMeta(currentUser.agencyType, currentUser.barangay);

  const displayedNotifs = (userNotifications || []).filter((n) => {
    if (notifFilter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getTabLabel = (tab: string) => {
    if (currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') {
      switch (tab) {
        case 'submit_report': return 'Incident & photo submission form';
        case 'my_reports': return 'My reports & real-time status tracker';
        default: return `Resident citizen portal • Brgy. ${currentUser.barangay || 'San Aquilino'}`;
      }
    }

    switch (tab) {
      case 'resident_portal': return 'Resident citizen reporting portal';
      case 'submit_report': return 'Citizen incident report & evidence submission';
      case 'my_reports': return 'Citizen reports & resolution tracker';
      case 'dashboard':
        if (currentUser.agencyType === 'MDRRMO') {
          return currentUser.role === 'MDRRMO_ADMIN'
            ? 'MDRRMO operations hub & emergency dispatch'
            : 'MDRRMO incident response & triage';
        }
        if (currentUser.agencyType === 'LGU') {
          return currentUser.role === 'LGU_ADMINISTRATOR'
            ? 'LGU executive administration dashboard'
            : 'LGU departmental action & grievance desk';
        }
        return 'System dashboard';
      case 'cases':
        if (currentUser.agencyType === 'MDRRMO') return 'Emergency incident queue & dispatch';
        return 'Incident & complaint ledger';
      case 'incident_graph': return 'MDRRMO resident incident reports graph';
      case 'transparency': return 'Inter-agency transparency & oversight';
      case 'annual_narrative': return 'Case narrative & governance report';
      case 'standard_reports': return 'Standard operational & KP reports';
      case 'audit_trail': return 'System audit trail & integrity logs';
      case 'admin': return 'System administration & master config';
      default: return 'B-CONNECT management system';
    }
  };

  return (
    <header
      id="bconnect-main-header"
      className="h-14 bg-paper border-b border-rule flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-40 transition-colors"
    >
      {/* Left: Mobile hamburger menu & view title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="btn-toggle-mobile-sidebar"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 -ml-1 rounded-md text-ink hover:bg-paper-2 transition-colors cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-focus"
          aria-label="Open navigation menu"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-ink" />
        </button>

        {currentUser.agencyType === 'MDRRMO' ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <img
              src="/mdrrmo_logo.png"
              alt="MDRRMO"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full border border-rule bg-paper"
            />
          </div>
        ) : currentUser.agencyType === 'LGU' ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <img
              src="/lgu_logo.png"
              alt="LGU Roxas"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full border border-rule bg-paper"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <img
              src="/bconnect_logo_transparent.png"
              alt="B-CONNECT"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full border border-rule bg-paper"
            />
          </div>
        )}

        <h2 className="font-bold text-xs sm:text-sm md:text-base text-ink tracking-tight truncate max-w-[130px] sm:max-w-xs md:max-w-md">
          {getTabLabel(activeTab)}
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border border-rule bg-paper-2 text-ink font-medium flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse"></span>
          System online
        </span>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-5 flex-shrink-0">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search Case ID or Person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-rule rounded-md pl-8 pr-4 py-1.5 text-xs text-ink bg-paper-2 placeholder:text-muted w-44 lg:w-60 focus:bg-paper focus:outline-hidden focus:ring-2 focus:ring-focus transition-colors"
          />
        </div>

        {/* Action Button: Submit Incident Report (Residents ONLY) */}
        {(currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') && (
          <button
            id="btn-register-new-case"
            onClick={() => setActiveTab('submit_report')}
            className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 text-accent-ink rounded-md text-xs font-semibold bg-accent hover:opacity-90 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            <span>Submit report</span>
          </button>
        )}

        {/* Theme Mode Toggle (Light / Dark) */}
        <button
          id="btn-theme-toggle-header"
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-full transition-colors cursor-pointer relative border bg-paper-2 hover:bg-paper-3 text-ink border-rule active:translate-y-px focus-visible:ring-2 focus-visible:ring-focus"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-ink-2" />
          )}
        </button>

        {/* Notification Bell with Role Badge */}
        <div className="relative">
          <button
            id="btn-notifications-bell"
            onClick={toggleNotif}
            className={`p-2 rounded-full transition-colors cursor-pointer relative border active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-focus ${
              isNotifOpen
                ? 'bg-accent text-accent-ink border-accent'
                : 'bg-paper-2 hover:bg-paper-3 text-ink border-rule'
            }`}
            title={`${roleMeta.centerTitle} (${currentUser.agencyType})`}
            aria-expanded={isNotifOpen}
            aria-haspopup="dialog"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center motion-safe:animate-pulse num">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              {/* Backdrop for closing popover on mobile/desktop outside click */}
              <div
                className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
                onClick={() => setIsNotifOpen(false)}
                aria-hidden="true"
              />

              <div
                id="notifications-popover"
                className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-none mx-auto sm:mx-0 bg-paper text-ink rounded-lg shadow-card border border-rule z-50 overflow-hidden flex flex-col max-h-[calc(100dvh-4.5rem)] sm:max-h-[34rem] animate-in fade-in duration-150"
              >
                {/* Header Box Tailored to Role */}
                <div className="p-3.5 bg-paper-2 text-ink border-b border-rule flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-md bg-paper-3 text-ink flex-shrink-0 border border-rule">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs leading-tight text-ink truncate">
                          {roleMeta.centerTitle}
                        </h4>
                        <p className="text-xs text-muted truncate">
                          {roleMeta.badgeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {unreadNotifCount > 0 && (
                        <span className="px-2 py-0.5 bg-error text-white text-[10px] font-semibold rounded-full num">
                          {unreadNotifCount} new
                        </span>
                      )}
                      <button
                        id="btn-close-notifications"
                        type="button"
                        onClick={() => setIsNotifOpen(false)}
                        className="p-1 rounded-md text-muted hover:text-ink hover:bg-paper-3 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                        aria-label="Close notification panel"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-header text */}
                  <p className="text-xs text-muted mt-1.5 line-clamp-1">
                    {roleMeta.subHeader}
                  </p>

                  {/* Quick actions row */}
                  <div className="mt-2.5 pt-2 border-t border-rule flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNotifFilter('ALL')}
                        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus ${
                          notifFilter === 'ALL'
                            ? 'bg-accent text-accent-ink font-semibold'
                            : 'bg-paper text-muted hover:text-ink hover:bg-paper-3 border border-rule'
                        }`}
                      >
                        All ({userNotifications?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('UNREAD')}
                        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus ${
                          notifFilter === 'UNREAD'
                            ? 'bg-accent text-accent-ink font-semibold'
                            : 'bg-paper text-muted hover:text-ink hover:bg-paper-3 border border-rule'
                        }`}
                      >
                        Unread ({unreadNotifCount})
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {unreadNotifCount > 0 && (
                        <button
                          id="btn-mark-all-read"
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-muted hover:text-ink cursor-pointer underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-focus"
                        >
                          Mark read
                        </button>
                      )}

                      {currentUser.agencyType !== 'RESIDENT' && (
                        <button
                          id="btn-open-dispatch-notif"
                          type="button"
                          onClick={() => {
                            setIsNotifOpen(false);
                            setIsCreateNotifModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-accent-ink bg-accent hover:opacity-90 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                          title="Send / dispatch alert for this role"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto divide-y divide-rule bg-paper min-h-0 overscroll-contain">
                  {(!displayedNotifs || displayedNotifs.length === 0) ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-paper-2 text-muted flex items-center justify-center mx-auto border border-rule">
                        <Bell className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted font-medium">{roleMeta.emptyMessage}</p>
                    </div>
                  ) : (
                    displayedNotifs.map((n, idx) => (
                      <div
                        key={n.id ? `${n.id}-${idx}` : `notif-${idx}`}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.caseId) {
                            setSelectedCaseId(n.caseId);
                            if (currentUser.agencyType === 'RESIDENT') {
                              setActiveTab('my_reports');
                            } else if (currentUser.agencyType === 'MDRRMO') {
                              setActiveTab('cases');
                            } else {
                              setActiveTab('dashboard');
                            }
                          }
                          setIsNotifOpen(false);
                        }}
                        className={`p-3 text-xs hover:bg-paper-2 cursor-pointer transition-colors flex items-start gap-2.5 bg-paper ${
                          !n.isRead ? 'border-l-2 border-l-accent bg-paper-2/60' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <div className="p-1.5 rounded-md bg-paper-2 text-ink border border-rule">
                            {n.type === 'pending_alert' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                            ) : n.type === 'recommendation' ? (
                              <FileText className="w-3.5 h-3.5 text-ink" />
                            ) : n.type === 'referral' ? (
                              <Shield className="w-3.5 h-3.5 text-ink" />
                            ) : n.type === 'hearing' ? (
                              <Clock className="w-3.5 h-3.5 text-ink" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-accent" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-xs ${!n.isRead ? 'font-bold text-ink' : 'font-medium text-ink-2'}`}>
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-muted mt-0.5 leading-relaxed text-xs line-clamp-2">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
                            <span className="num">{formatDate(n.timestamp)}</span>
                            {n.caseId && (
                              <span className="px-1.5 py-0.5 rounded bg-paper-2 text-ink font-medium border border-rule num">
                                #{n.caseId}
                              </span>
                            )}
                            {n.priority === 'urgent' && (
                              <span className="px-1.5 py-0.5 rounded bg-paper-3 text-error border border-rule font-medium text-xs">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2.5 bg-paper-2 border-t border-rule flex items-center justify-between text-xs text-muted px-3 flex-shrink-0">
                  <span className="text-xs">
                    Role scope: <strong className="text-ink font-semibold">{currentUser.agencyType}</strong>
                  </span>
                  {currentUser.agencyType !== 'RESIDENT' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false);
                        setIsCreateNotifModalOpen(true);
                      }}
                      className="text-xs text-accent hover:underline font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      + Create alert
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs text-muted hover:text-ink font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Account Profile */}
        <div className="relative">
          <button
            id="btn-role-switcher"
            onClick={toggleRoleDropdown}
            className={`flex items-center gap-2.5 px-3 py-1.5 border rounded-md transition-colors cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-focus ${
              isRoleDropdownOpen
                ? 'bg-paper-3 border-rule ring-2 ring-focus'
                : 'bg-paper-2 hover:bg-paper-3 border-rule'
            }`}
            title="View logged-in profile"
            aria-expanded={isRoleDropdownOpen}
            aria-haspopup="dialog"
          >
            <div className="rounded-md overflow-hidden flex items-center justify-center bg-paper border border-rule w-7 h-7 p-0.5">
              <img
                src={
                  currentUser.agencyType === 'MDRRMO'
                    ? '/mdrrmo_logo.png'
                    : currentUser.agencyType === 'LGU'
                      ? '/lgu_logo.png'
                      : '/bconnect_logo_transparent.png'
                }
                alt={currentUser.agencyType}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-ink leading-tight">
                {currentUser.name}
              </div>
              <div className="text-xs text-muted truncate max-w-[120px]">
                {currentUser.agencyType}
              </div>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded bg-paper text-ink font-medium border border-rule">
              {currentUser.agencyType}
            </span>
          </button>

          {isRoleDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
                onClick={() => setIsRoleDropdownOpen(false)}
                aria-hidden="true"
              />

              <div
                id="role-switcher-dropdown"
                className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] mx-auto sm:mx-0 bg-paper text-ink rounded-lg shadow-card border border-rule z-50 overflow-hidden flex flex-col max-h-[calc(100dvh-4.5rem)] sm:max-h-[34rem] animate-in fade-in duration-150"
              >
                <div className="p-3.5 bg-paper-2 border-b border-rule flex items-center justify-between flex-shrink-0">
                  <div>
                    <span className="text-xs font-bold text-ink">Official account profile</span>
                    <p className="text-xs text-muted">Authenticated session</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-ink bg-paper px-2 py-0.5 rounded-md border border-rule">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse"></span>
                      Active
                    </span>
                    <button
                      id="btn-close-role-dropdown"
                      type="button"
                      onClick={() => setIsRoleDropdownOpen(false)}
                      className="p-1 text-muted hover:text-ink hover:bg-paper-3 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                      aria-label="Close profile menu"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Logged in User Card */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto min-h-0">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-paper p-1 border border-rule flex-shrink-0 flex items-center justify-center">
                      <img
                        src={
                          currentUser.agencyType === 'MDRRMO'
                            ? '/mdrrmo_logo.png'
                            : currentUser.agencyType === 'LGU'
                              ? '/lgu_logo.png'
                              : '/bconnect_logo_transparent.png'
                        }
                        alt={currentUser.agencyType}
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-ink leading-snug">{currentUser.name}</div>
                      <div className="text-xs text-muted font-medium">{currentUser.position}</div>
                      <div className="text-xs text-accent font-semibold mt-0.5">{currentUser.agencyName}</div>
                      {currentUser.barangay && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-muted bg-paper-2 px-1.5 py-0.5 rounded border border-rule">
                          <MapPin className="w-3 h-3 text-accent" />
                          <span>Brgy. {currentUser.barangay}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-paper-2 rounded-md border border-rule space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-muted">
                      <span>Agency role:</span>
                      <span className="font-semibold text-ink bg-paper px-1.5 py-0.5 rounded border border-rule">
                        {currentUser.agencyType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <span>Email:</span>
                      <span className="font-medium text-ink truncate max-w-[170px]">{currentUser.email}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-paper-2 border border-rule rounded-md text-xs text-muted flex items-start gap-1.5 leading-relaxed">
                    <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    <span>To access another agency or user account, click <strong>Log out</strong> and sign in with the respective credentials.</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-2.5 bg-paper-2 border-t border-rule space-y-1.5 flex-shrink-0">
                  <button
                    id="btn-role-dropdown-edit-current"
                    type="button"
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      openEditAccountModal(currentUser);
                    }}
                    className="w-full py-2 px-3 bg-paper hover:bg-paper-3 border border-rule text-ink rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-muted" />
                    <span>Edit my profile</span>
                  </button>
                  <button
                    id="btn-role-dropdown-logout"
                    type="button"
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full py-2 px-3 bg-error text-white rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out / switch account</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Explicit Header Logout button */}
        <button
          id="btn-header-logout"
          onClick={logout}
          className="hidden sm:inline-flex items-center gap-1.5 p-2 text-muted hover:text-error hover:bg-paper-2 rounded-md transition-colors border border-transparent hover:border-rule text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-focus"
          title="Log out of system"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xl:inline">Log out</span>
        </button>
      </div>

      {/* Role-Based Notification Dispatcher Modal */}
      <CreateNotificationModal
        isOpen={isCreateNotifModalOpen}
        onClose={() => setIsCreateNotifModalOpen(false)}
      />
    </header>
  );
};
