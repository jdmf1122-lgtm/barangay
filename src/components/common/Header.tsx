import React, { useState } from 'react';
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
  Menu
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
  const { setIsNewCaseModalOpen, openEditAccountModal, setActiveTab, searchQuery, setSearchQuery, activeTab, isMobileMenuOpen, setIsMobileMenuOpen } = useUI();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCreateNotifModalOpen, setIsCreateNotifModalOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!currentUser) return null;

  const roleMeta = getRoleNotificationMeta(currentUser.agencyType, currentUser.barangay);

  const displayedNotifs = (userNotifications || []).filter((n) => {
    if (notifFilter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getAgencyColor = (agency: string) => {
    switch (agency) {
      case 'RESIDENT':
        return 'bg-emerald-600 text-white';
      case 'MDRRMO':
        return 'bg-orange-600 text-white';
      case 'LGU':
        return 'bg-emerald-700 text-white';
      case 'ADMIN':
        return 'bg-purple-700 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const getAgencyIcon = (agency: string) => {
    switch (agency) {
      case 'RESIDENT':
        return <UserCheck className="w-4 h-4" />;
      case 'MDRRMO':
        return <ShieldAlert className="w-4 h-4" />;
      case 'LGU':
        return <Landmark className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const getTabLabel = (tab: string) => {
    if (currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') {
      switch (tab) {
        case 'submit_report': return 'Incident & Photo Submission Form';
        case 'my_reports': return 'My Reports & Real-Time Status Tracker';

        default: return `Resident Citizen Portal • Brgy. ${currentUser.barangay || 'San Aquilino'}`;
      }
    }

    switch (tab) {
      case 'resident_portal': return 'Resident Citizen Reporting Portal';
      case 'submit_report': return 'Citizen Incident Report & Evidence Submission';
      case 'my_reports': return 'Citizen Reports & Resolution Tracker';

      case 'dashboard': 
        if (currentUser.agencyType === 'MDRRMO') {
          return currentUser.role === 'MDRRMO_ADMIN' 
            ? 'MDRRMO Operations Hub & Emergency Dispatch' 
            : 'MDRRMO Incident Response & Triage';
        }
        if (currentUser.agencyType === 'LGU') {
          return currentUser.role === 'LGU_ADMINISTRATOR' 
            ? 'LGU Executive Administration Dashboard' 
            : 'LGU Departmental Action & Grievance Desk';
        }
      case 'cases': 
        if (currentUser.agencyType === 'MDRRMO') return 'Crash Blotter & Emergency Incident Queue';
        return 'Incident & Complaint Ledger';
      case 'transparency': return 'Inter-Agency Transparency & Oversight';
      case 'annual_narrative': return 'Case Narrative & Governance Report';
      case 'standard_reports': return 'Standard Operational & KP Reports';
      case 'audit_trail': return 'System Audit Trail & Integrity Logs';
      case 'admin': return 'System Administration & Master Config';
      default: return 'B-CONNECT Management System';
    }
  };

  return (
    <header id="bconnect-main-header" className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-2xs">
      {/* Left: Mobile hamburger menu & view title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="btn-toggle-mobile-sidebar"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 -ml-1 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70 rounded-xl transition cursor-pointer flex-shrink-0"
          aria-label="Open navigation menu"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-emerald-700" />
        </button>

        <h2 className="font-extrabold text-emerald-950 text-xs sm:text-sm md:text-base tracking-tight truncate max-w-[130px] sm:max-w-xs md:max-w-md">
          {getTabLabel(activeTab)}
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-bold uppercase tracking-wider flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online
        </span>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-5 flex-shrink-0">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search Case ID or Person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-emerald-50/50 border border-emerald-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-800 placeholder-emerald-700/50 w-44 lg:w-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Action Button: Record Incident */}
        <button
          id="btn-register-new-case"
          onClick={() => {
            if (currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') {
              setActiveTab('submit_report');
            } else {
              setIsNewCaseModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">
            {(currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') ? 'Submit Report' : 'New Incident'}
          </span>
        </button>

        {/* Notification Bell with Role Badge */}
        <div className="relative">
          <button
            id="btn-notifications-bell"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full transition cursor-pointer relative border border-emerald-200/60"
            title={`${roleMeta.centerTitle} (${currentUser.agencyType})`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div 
              id="notifications-popover" 
              className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-emerald-200 z-50 overflow-hidden"
            >
              {/* Header Box Tailored to Role */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white border-b border-emerald-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-emerald-800/80 text-emerald-300">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs leading-tight text-white">
                        {roleMeta.centerTitle}
                      </h4>
                      <p className="text-[10px] text-emerald-300">
                        {roleMeta.badgeLabel}
                      </p>
                    </div>
                  </div>

                  {unreadNotifCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500/90 text-white text-[10px] font-black rounded-full">
                      {unreadNotifCount} new
                    </span>
                  )}
                </div>

                {/* Sub-header text */}
                <p className="text-[10px] text-emerald-200/70 mt-1.5 line-clamp-1">
                  {roleMeta.subHeader}
                </p>

                {/* Quick actions row */}
                <div className="mt-2.5 pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setNotifFilter('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                        notifFilter === 'ALL'
                          ? 'bg-white text-emerald-950 font-black'
                          : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      All ({userNotifications?.length || 0})
                    </button>
                    <button
                      onClick={() => setNotifFilter('UNREAD')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                        notifFilter === 'UNREAD'
                          ? 'bg-white text-emerald-950 font-black'
                          : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      Unread ({unreadNotifCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadNotifCount > 0 && (
                      <button
                        id="btn-mark-all-read"
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-emerald-300 hover:text-white font-semibold cursor-pointer underline underline-offset-2"
                      >
                        Mark read
                      </button>
                    )}

                    {currentUser.agencyType !== 'RESIDENT' && (
                      <button
                        id="btn-open-dispatch-notif"
                        onClick={() => {
                          setIsNotifOpen(false);
                          setIsCreateNotifModalOpen(true);
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1 transition cursor-pointer shadow-xs"
                        title="Send / Dispatch Alert for this Role"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Dispatch</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                {(!displayedNotifs || displayedNotifs.length === 0) ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Bell className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{roleMeta.emptyMessage}</p>
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
                      className={`p-3 text-xs hover:bg-emerald-50/60 cursor-pointer transition flex items-start gap-2.5 bg-white ${
                        !n.isRead ? 'border-l-3 border-l-emerald-600 bg-emerald-50/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'pending_alert' ? (
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'recommendation' ? (
                          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'referral' ? (
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'hearing' ? (
                          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px] line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                          <span>{formatDate(n.timestamp)}</span>
                          {n.caseId && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600 font-bold">
                              #{n.caseId}
                            </span>
                          )}
                          {n.priority === 'urgent' && (
                            <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-700 font-bold uppercase text-[9px]">
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
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-between text-[11px] text-slate-500 px-3">
                <span className="text-[10px]">
                  Role Scope: <strong className="text-slate-800">{currentUser.agencyType}</strong>
                </span>
                {currentUser.agencyType !== 'RESIDENT' && (
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsCreateNotifModalOpen(true);
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                  >
                    + Create Alert
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Profile */}
        <div className="relative">
          <button
            id="btn-role-switcher"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/60 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer text-left"
            title="View Logged-in Profile"
          >
            <div className={`p-1 rounded-lg ${getAgencyColor(currentUser.agencyType)}`}>
              {getAgencyIcon(currentUser.agencyType)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-emerald-950 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-800/70 font-medium truncate max-w-[120px]">
                {currentUser.agencyType}
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-emerald-800 font-mono font-bold border border-emerald-200">
              {currentUser.agencyType}
            </span>
          </button>

          {isRoleDropdownOpen && (
            <div
              id="role-switcher-dropdown"
              className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-80 bg-white text-slate-900 rounded-2xl shadow-xl border border-emerald-200 z-50 overflow-hidden"
            >
              <div className="p-3.5 bg-emerald-950 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-tight text-emerald-100">Official Account Profile</span>
                  <p className="text-[10px] text-emerald-300">Authenticated Session</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>

              {/* Logged in User Card */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl text-white shadow-xs ${getAgencyColor(currentUser.agencyType)}`}>
                    {getAgencyIcon(currentUser.agencyType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 leading-snug">{currentUser.name}</div>
                    <div className="text-xs text-slate-600 font-medium">{currentUser.position}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{currentUser.agencyName}</div>
                    {currentUser.barangay && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        📍 Brgy. {currentUser.barangay}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Agency Role:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {currentUser.agencyType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Email:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{currentUser.email}</span>
                  </div>
                </div>

                <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5 leading-relaxed">
                  <Shield className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>To access another agency or user account, click <strong>Log Out</strong> and sign in with the respective credentials.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-2.5 bg-emerald-50/50 border-t border-emerald-100 space-y-1.5">
                <button
                  id="btn-role-dropdown-edit-current"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    openEditAccountModal(currentUser);
                  }}
                  className="w-full py-2 px-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Edit My Profile</span>
                </button>
                <button
                  id="btn-role-dropdown-logout"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    logout();
                  }}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Explicit Header Logout button */}
        <button
          id="btn-header-logout"
          onClick={logout}
          className="hidden sm:inline-flex items-center gap-1.5 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 text-xs font-bold cursor-pointer"
          title="Log Out of System"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xl:inline">Log Out</span>
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
