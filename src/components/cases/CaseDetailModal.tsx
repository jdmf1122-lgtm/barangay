import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Clock, 
  ArrowRightLeft, 
  FileCheck2, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Shield, 
  Calendar, 
  Printer, 
  Paperclip, 
  MessageSquare,
  AlertCircle,
  Landmark,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { StatusBadge, PriorityBadge, OfficialBadge } from '../common/StatusBadge';
import { CaseStatus, TimelineEvent, AGENCIES_LIST } from '../../types';
import { formatDate, formatDateShort } from '../../utils/reportGenerators';

export const CaseDetailModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedCase, setSelectedCaseId, updateCaseStatus, addCaseTimelineEvent, recordLguInterventionAction, deleteCase } = useCases();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  
  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<CaseStatus>('Unresolved');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [statusChangeRemarks, setStatusChangeRemarks] = useState('');

  // LGU Escalation Intervention state
  const [lguActionType, setLguActionType] = useState<'Under Review' | 'MDRRMO Mobilized' | 'Municipal Team Dispatched' | 'Resolved by LGU' | 'Dismissed'>('MDRRMO Mobilized');
  const [lguDirectiveNotes, setLguDirectiveNotes] = useState('');
  const [isLguActionSubmitted, setIsLguActionSubmitted] = useState(false);

  const handleLguInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    recordLguInterventionAction(selectedCase.id, lguActionType, lguDirectiveNotes);
    setIsLguActionSubmitted(true);
    setTimeout(() => setIsLguActionSubmitted(false), 3000);
  };

  if (!selectedCase) return null;

  // Strict Role-Based Access Control (RBAC) jurisdictional check
  const isBarangayOfficer = (currentUser?.agencyType as string) === 'BARANGAY' && !!currentUser?.barangay;
  const isResidentUser = currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT';

  const isBarangayUnauthorized = isBarangayOfficer && 
    selectedCase.barangay !== currentUser.barangay && 
    !selectedCase.originatingAgency?.includes(currentUser.barangay!);

  const isResidentUnauthorized = isResidentUser && 
    selectedCase.barangay !== (currentUser.barangay || 'San Aquilino') && 
    selectedCase.residentReporterId !== currentUser.id;

  if (isBarangayUnauthorized || isResidentUnauthorized) {
    return (
      <div 
        id="case-detail-modal-backdrop" 
        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-rose-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest bg-rose-900/80 px-2 py-0.5 rounded text-rose-200">
                  SECURITY & PRIVACY FIREWALL
                </span>
                <h3 className="font-extrabold text-sm sm:text-base">
                  403 JURISDICTIONAL ACCESS RESTRICTED
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedCaseId(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
              <p className="font-bold leading-relaxed">
                You do not have authorization to view this incident docket ({selectedCase.id}).
              </p>
              <p className="text-rose-700 leading-relaxed text-[11px]">
                {isBarangayOfficer ? (
                  <>
                    Pursuant to <strong>Republic Act 7160 (Local Government Code)</strong> and the <strong>Data Privacy Act of 2012 (RA 10173)</strong>, Barangay Officials of <strong>Barangay {currentUser.barangay}</strong> are strictly restricted from accessing confidential blotter entries and dockets of other barangays (<strong>Barangay {selectedCase.barangay}</strong>).
                  </>
                ) : (
                  <>
                    Registered residents of <strong>Barangay {currentUser.barangay || 'San Aquilino'}</strong> can only access community incidents and reports filed within their own barangay jurisdiction.
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-bold block">Case Location</span>
                <span className="font-bold text-slate-800">Brgy. {selectedCase.barangay}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-bold block">Your Assigned Barangay</span>
                <span className="font-bold text-emerald-700">Brgy. {currentUser.barangay || 'San Aquilino'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCaseId(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
            >
              Return to Safe Ledger View
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeReason.trim()) {
      alert('Please specify the mandatory reason for changing the case status.');
      return;
    }
    updateCaseStatus(selectedCase.id, selectedNewStatus, statusChangeReason, statusChangeRemarks);
    setIsStatusModalOpen(false);
    setStatusChangeReason('');
    setStatusChangeRemarks('');
  };



  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div 
      id="case-detail-modal-backdrop" 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div 
        id="case-dossier-card" 
        className="bg-white text-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <span className="font-mono text-xs sm:text-sm font-bold bg-blue-600 px-2 py-0.5 rounded text-white flex-shrink-0">
              {selectedCase.id}
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-white tracking-tight truncate max-w-[170px] sm:max-w-md">
                {selectedCase.title}
              </h2>
              <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                <span>Incident #{selectedCase.incidentId}</span>
                <span>•</span>
                <span>Brgy. {selectedCase.barangay}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Reported: {formatDate(selectedCase.dateReported)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 ml-2">
            <button
              onClick={handlePrintDossier}
              title="Print Case Dossier"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedCaseId(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Strip */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={selectedCase.status} />
            <PriorityBadge priority={selectedCase.priority} />
            {selectedCase.isInvolvingOfficial && (
              <OfficialBadge officialType={selectedCase.officialInvolvedType} />
            )}

          </div>

          {/* Interactive Case Action Triggers */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-update-case-status"
              onClick={() => {
                setSelectedNewStatus(selectedCase.status);
                setIsStatusModalOpen(true);
              }}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold transition cursor-pointer"
            >
              Update Status
            </button>


          </div>
        </div>

        {/* Navigation Tabs within Case Dossier */}
        <div className="px-5 border-b border-slate-200 bg-white flex space-x-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Case Overview', count: undefined },
            { id: 'timeline', label: 'Chronological Timeline', count: selectedCase.timeline?.length || 0 }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {/* TAB 1: OVERVIEW & PARTIES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* MDRRMO-to-LGU Automatic Escalation Callout & LGU Intervention Desk */}
              {selectedCase.isEscalatedToLgu && (
                <div id="case-escalated-lgu-callout" className="bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-500 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                      </span>
                      <span>🚨 ESCALATED TO LGU: MDRRMO Non-Response Timeout Exceeded</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase">
                      Urgent Action Required
                    </span>
                  </div>

                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    This emergency report was automatically escalated to the <strong>LGU Executive Office</strong> because the MDRRMO did not acknowledge, respond to, or update the incident within the statutory response threshold (<strong>{selectedCase.escalationElapsedStr || 'Over 2 hours'}</strong>).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3.5 rounded-lg border border-rose-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Date & Time Escalated:</span>
                      <strong className="text-slate-800">{formatDate(selectedCase.escalatedAt)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Time Elapsed without MDRRMO:</span>
                      <strong className="text-rose-700 font-mono font-bold">{selectedCase.escalationElapsedStr || '2+ Hours'}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Designated LGU SMS Dispatch Status:</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>SMS Notification Delivered to {selectedCase.escalationSmsRecipient || 'LGU Officials'} ({selectedCase.escalationSmsRecipientPhone || 'Designated Phone'})</span>
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Recommended Action:</span>
                      <span className="font-bold text-rose-800">LGU intervention/review required</span>
                    </div>
                  </div>

                  {/* If LGU directive has already been recorded */}
                  {selectedCase.lguActionTaken && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Recorded LGU Directive: {selectedCase.lguActionTaken}</span>
                      </div>
                      {selectedCase.lguInterventionNotes && (
                        <p className="text-[11px] text-emerald-900 leading-relaxed italic bg-white/70 p-2 rounded border border-emerald-200">
                          "{selectedCase.lguInterventionNotes}"
                        </p>
                      )}
                      <div className="text-[10px] text-emerald-700 pt-1 border-t border-emerald-200 flex justify-between">
                        <span>Issued by: <strong>{selectedCase.lguActionPersonnel || 'LGU Authorized Personnel'}</strong></span>
                        <span>Date: {formatDate(selectedCase.lguActionDate)}</span>
                      </div>
                    </div>
                  )}

                  {/* LGU Executive Intervention Action Desk (Authorized for LGU Personnel) */}
                  {(currentUser?.agencyType === 'LGU' || currentUser?.role === 'LGU_ADMINISTRATOR' || currentUser?.role === 'LGU_OFFICER') && (
                    <form onSubmit={handleLguInterventionSubmit} className="bg-white p-4 rounded-xl border-2 border-emerald-500 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-emerald-700" />
                          <span>LGU Executive Intervention & Decision Desk</span>
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Authorized Action
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        The system has notified the LGU of this unresolved emergency. As authorized LGU personnel, determine and issue the appropriate official response below:
                      </p>

                      <div>
                        <label className="text-[11px] font-bold text-slate-800 block mb-1">Select LGU Action to Take *</label>
                        <select
                          value={lguActionType}
                          onChange={(e) => setLguActionType(e.target.value as any)}
                          className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-lg border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="MDRRMO Mobilized">🚨 Direct MDRRMO Immediate Mobilization & Rescue</option>
                          <option value="Municipal Team Dispatched">🚒 Dispatch Municipal Response / Traffic / Health Team</option>
                          <option value="Under Review">📋 Mark Under Formal LGU Executive Review & Investigation</option>
                          <option value="Resolved by LGU">✅ Resolve & Conclude under Municipal LGU Directives</option>
                          <option value="Dismissed">⚠️ Inquire & Conclude (No Further Municipal Action Required)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-800 block mb-1">Official LGU Directive / Intervention Notes *</label>
                        <textarea
                          required
                          rows={2}
                          value={lguDirectiveNotes}
                          onChange={(e) => setLguDirectiveNotes(e.target.value)}
                          placeholder="State the formal directive, orders given to MDRRMO/Municipal responders, or terms of LGU intervention..."
                          className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {isLguActionSubmitted ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Official Directive recorded & audit logged!
                          </span>
                        ) : <span className="text-[10px] text-slate-400">Action will be logged in system audit trail</span>}

                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Submit Official LGU Action</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Official Involvement Neutrality Callout */}
              {selectedCase.isInvolvingOfficial && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Special Classification: Complaint Involving Public Official</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    This inquiry involves <strong>{selectedCase.officialInvolvedName || selectedCase.officialInvolvedPosition}</strong> ({selectedCase.officialInvolvedAgency}). As per DILG protocols, the record is maintained under neutral administrative classification without presumed guilt, subject to formal conciliation and MLGOO oversight.
                  </p>
                </div>
              )}


              {/* Evidence & Attached Photos */}
              {selectedCase.imageUrls && selectedCase.imageUrls.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    Attached Evidence / Photos
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedCase.imageUrls.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition shadow-xs w-32 h-32 sm:w-40 sm:h-40 bg-slate-50 relative group"
                      >
                        <img 
                          src={url} 
                          alt={`Evidence ${i + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">View Full</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Full Case Chronology & Audit Chain
                  </h3>
                  <p className="text-[11px] text-slate-500">Every action, hearing, referral, and status update</p>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(!selectedCase.timeline || selectedCase.timeline.length === 0) ? (
                  <div className="text-slate-400 py-4">No timeline events recorded.</div>
                ) : (
                  selectedCase.timeline.map((event, idx) => (
                    <div key={event.id ? `${event.id}-${idx}` : `event-${idx}`} className="relative group">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 shadow" />
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900">{event.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{event.description}</p>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                          <span className="font-medium text-slate-700">Action by: {event.actorName}</span>
                          <span>•</span>
                          <span>{event.actorRole}</span>
                          <span>•</span>
                          <span className="text-blue-700 font-semibold">{event.actorAgency}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Last Updated: {formatDate(selectedCase.dateLastUpdated)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete case ${selectedCase.id} ("${selectedCase.title}")? This action cannot be undone.`)) {
                  deleteCase(selectedCase.id);
                  setSelectedCaseId(null);
                }
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="Delete this case permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Case</span>
            </button>
            <button
              onClick={() => setSelectedCaseId(null)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold transition cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* SUB-MODAL 1: STATUS CHANGE */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleStatusSubmit} className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Update Case Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {selectedCase.id} • {selectedCase.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Status Visual Banner */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              selectedNewStatus === 'Resolved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-current opacity-80" />
              <div>
                <div className="font-bold">
                  {selectedNewStatus === 'Resolved' && '✅ Case Outcome: RESOLVED / SETTLED (Completed)'}
                  {selectedNewStatus === 'Unresolved' && '🆕 Status: Unresolved Incident'}
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {selectedNewStatus === 'Resolved'
                    ? 'The case will be marked completed. Automatically counted toward the Official Governance & LTIA Resolution Rate.'
                    : 'The case remains unresolved.'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Select New Case Status *</span>
              </label>
              <select
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value as CaseStatus)}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              >
                <option value="Unresolved">🆕 Unresolved</option>
                <option value="Resolved">✅ Resolved (Amicable Settlement / Solved)</option>
              </select>
            </div>

            {/* Mandatory Reason Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mandatory Reason for Status Change *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Complainant and respondent reached an agreement before the Lupon and signed the settlement document."
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Additional Remarks / Terms of Agreement (Optional)</label>
              <textarea
                placeholder="Optional details of the agreement, conditions, next hearing date, or specific instructions..."
                value={statusChangeRemarks}
                onChange={(e) => setStatusChangeRemarks(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Save & Record Audit Entry
              </button>
            </div>
          </form>
        </div>
      )}


    </div>
  );
};
