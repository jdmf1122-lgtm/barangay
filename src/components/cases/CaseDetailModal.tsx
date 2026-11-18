import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Printer, 
  Paperclip, 
  AlertCircle, 
  Landmark, 
  Trash2, 
  MapPin, 
  User, 
  Car, 
  Activity,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { StatusBadge, PriorityBadge, OfficialBadge } from '../common/StatusBadge';
import { CaseStatus } from '../../types';
import { formatDate, formatDateShort } from '../../utils/reportGenerators';
import { isConsolidatedCase } from '../../utils/duplicateReportDetector';

export const CaseDetailModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedCase, setSelectedCaseId, updateCaseStatus, recordLguInterventionAction, deleteCase } = useCases();

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
        className="fixed inset-0 z-50 bg-ink/75 flex items-center justify-center p-4"
      >
        <div className="bg-paper text-ink w-full max-w-lg rounded-xl shadow-xs border border-rule overflow-hidden">
          <div className="bg-paper-2 border-b border-rule text-ink p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-error/15 text-error border border-error/30">
                  Jurisdictional access restricted
                </span>
                <h3 className="font-bold text-sm sm:text-base text-ink mt-0.5">
                  403 Access restricted
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCaseId(null)}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-paper-3 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-paper-2 border border-rule rounded-xl space-y-2 text-ink">
              <p className="font-semibold leading-relaxed">
                You do not have authorization to view this incident docket ({selectedCase.id}).
              </p>
              <p className="text-muted leading-relaxed text-xs">
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

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-paper-2 border border-rule rounded-lg">
                <span className="text-muted font-medium block">Case location</span>
                <span className="font-semibold text-ink">Brgy. {selectedCase.barangay}</span>
              </div>
              <div className="p-2.5 bg-paper-2 border border-rule rounded-lg">
                <span className="text-muted font-medium block">Your assigned barangay</span>
                <span className="font-semibold text-accent">Brgy. {currentUser.barangay || 'San Aquilino'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCaseId(null)}
              className="w-full py-2.5 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule font-semibold rounded-lg transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Return to ledger</span>
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
      className="fixed inset-0 z-50 bg-ink/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div 
        id="case-dossier-card" 
        className="bg-paper text-ink w-full max-w-5xl rounded-xl shadow-xs border border-rule overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Modal Top Bar */}
        <div className="bg-paper-2 text-ink px-4 sm:px-5 py-3 flex items-center justify-between border-b border-rule flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <span className="font-mono text-xs sm:text-sm font-semibold bg-paper border border-rule px-2 py-0.5 rounded text-ink flex-shrink-0 num">
              {selectedCase.id}
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-ink tracking-tight truncate max-w-[170px] sm:max-w-md">
                {selectedCase.title}
              </h2>
              <div className="text-xs text-muted flex items-center gap-2 truncate">
                <span>Incident #{selectedCase.incidentId}</span>
                <span>, Brgy. {selectedCase.barangay}</span>
                <span className="hidden sm:inline num">({formatDate(selectedCase.dateReported)})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 ml-2">
            <button
              type="button"
              onClick={handlePrintDossier}
              title="Print case dossier"
              className="p-1.5 text-muted hover:text-ink hover:bg-paper-3 active:bg-paper rounded transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedCaseId(null)}
              className="p-1.5 text-muted hover:text-ink hover:bg-paper-3 active:bg-paper rounded transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Strip */}
        <div className="bg-paper px-5 py-2.5 border-b border-rule flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={selectedCase.status} />
            <PriorityBadge priority={selectedCase.priority} />
            {selectedCase.isInvolvingOfficial && (
              <OfficialBadge officialType={selectedCase.officialInvolvedType} />
            )}
            {isConsolidatedCase(selectedCase) && (
              <span className="px-2 py-0.5 bg-paper-2 border border-rule rounded-full font-semibold text-[10px] text-ink flex items-center gap-1 shadow-2xs">
                <CheckCircle className="w-3 h-3 text-success" />
                <span>Single unified report (Auto-consolidated)</span>
              </span>
            )}
          </div>

          {/* Interactive Case Action Triggers */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-update-case-status"
              type="button"
              onClick={() => {
                setSelectedNewStatus(selectedCase.status);
                setIsStatusModalOpen(true);
              }}
              className="px-2.5 py-1 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Update status</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs within Case Dossier */}
        <div className="px-5 border-b border-rule bg-paper flex space-x-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Case overview', count: undefined },
            { id: 'timeline', label: 'Chronological timeline', count: selectedCase.timeline?.length || 0 }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as 'overview' | 'timeline')}
              className={`py-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden ${
                activeTab === t.id
                  ? 'border-accent text-accent font-bold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="px-1.5 py-0.2 bg-paper-2 text-ink border border-rule rounded text-[10px] num">
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
              {/* Auto-Consolidated Single Report Banner */}
              {isConsolidatedCase(selectedCase) && (
                <div id="case-auto-deduplicated-callout" className="bg-paper-2 border border-rule rounded-xl p-4 space-y-2 text-ink shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-ink">
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      <span>Unified Report (Auto-Deduplicated & Consolidated Docket)</span>
                    </div>
                    <span className="bg-paper border border-rule text-ink text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      1 report retained
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    The system detected multiple reports for this incident with slight variations in details. Duplicate submissions were automatically removed and all information, photos, and records were merged into this single official dossier to prevent confusion and duplicate dispatch by MDRRMO and the Barangay.
                  </p>
                </div>
              )}

              {/* MDRRMO-to-LGU Automatic Escalation Callout & LGU Intervention Desk */}
              {selectedCase.isEscalatedToLgu && (
                <div id="case-escalated-lgu-callout" className="bg-paper-2 border-2 border-error rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-error font-bold text-sm">
                      <AlertOctagon className="w-4 h-4 text-error shrink-0" />
                      <span>Escalated to LGU: MDRRMO non-response timeout exceeded</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-error/15 border border-error/30 text-error text-[10px] font-semibold rounded-full">
                      Urgent action required
                    </span>
                  </div>

                  <p className="text-xs text-ink leading-relaxed">
                    This emergency report was automatically escalated to the <strong>LGU Executive Office</strong> because the MDRRMO did not acknowledge, respond to, or update the incident within the statutory response threshold (<strong>{selectedCase.escalationElapsedStr || 'Over 2 hours'}</strong>).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-paper p-3.5 rounded-lg border border-rule text-xs">
                    <div>
                      <span className="text-muted block">Date and time escalated:</span>
                      <strong className="text-ink font-semibold num">{formatDate(selectedCase.escalatedAt)}</strong>
                    </div>
                    <div>
                      <span className="text-muted block">Time elapsed without MDRRMO:</span>
                      <strong className="text-error font-mono font-semibold num">{selectedCase.escalationElapsedStr || '2+ Hours'}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted block">Designated LGU SMS dispatch status:</span>
                      <span className="font-semibold text-accent flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>SMS notification delivered to {selectedCase.escalationSmsRecipient || 'LGU Officials'} ({selectedCase.escalationSmsRecipientPhone || 'Designated Phone'})</span>
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted block">Recommended action:</span>
                      <span className="font-semibold text-error">LGU intervention and review required</span>
                    </div>
                  </div>

                  {/* If LGU directive has already been recorded */}
                  {selectedCase.lguActionTaken && (
                    <div className="bg-paper border border-rule rounded-lg p-3 text-xs text-ink space-y-1">
                      <div className="font-semibold flex items-center gap-1.5 text-accent">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Recorded LGU directive: {selectedCase.lguActionTaken}</span>
                      </div>
                      {selectedCase.lguInterventionNotes && (
                        <p className="text-xs text-muted leading-relaxed italic bg-paper-2 p-2 rounded border border-rule">
                          "{selectedCase.lguInterventionNotes}"
                        </p>
                      )}
                      <div className="text-[11px] text-muted pt-1 border-t border-rule flex justify-between">
                        <span>Issued by: <strong className="text-ink">{selectedCase.lguActionPersonnel || 'LGU Authorized Personnel'}</strong></span>
                        <span className="num">Date: {formatDate(selectedCase.lguActionDate)}</span>
                      </div>
                    </div>
                  )}

                  {/* LGU Executive Intervention Action Desk (Authorized for LGU Personnel) */}
                  {(currentUser?.agencyType === 'LGU' || currentUser?.role === 'LGU_ADMINISTRATOR' || currentUser?.role === 'LGU_OFFICER') && (
                    <form onSubmit={handleLguInterventionSubmit} className="bg-paper p-4 rounded-xl border border-accent space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-rule pb-2">
                        <h4 className="font-semibold text-xs text-ink flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-accent" />
                          <span>LGU executive intervention and decision desk</span>
                        </h4>
                        <span className="text-[10px] font-semibold text-accent bg-paper-2 px-2 py-0.5 rounded border border-rule">
                          Authorized action
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        The system has notified the LGU of this unresolved emergency. As authorized LGU personnel, determine and issue the appropriate official response below:
                      </p>

                      <div>
                        <label className="text-xs font-semibold text-ink block mb-1">Select LGU action to take *</label>
                        <select
                          value={lguActionType}
                          onChange={(e) => setLguActionType(e.target.value as 'Under Review' | 'MDRRMO Mobilized' | 'Municipal Team Dispatched' | 'Resolved by LGU' | 'Dismissed')}
                          className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule font-medium text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
                        >
                          <option value="MDRRMO Mobilized">Direct MDRRMO immediate mobilization and rescue</option>
                          <option value="Municipal Team Dispatched">Dispatch municipal response, traffic, or health team</option>
                          <option value="Under Review">Mark under formal LGU executive review and investigation</option>
                          <option value="Resolved by LGU">Resolve and conclude under municipal LGU directives</option>
                          <option value="Dismissed">Inquire and conclude (no further municipal action required)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ink block mb-1">Official LGU directive or intervention notes *</label>
                        <textarea
                          required
                          rows={2}
                          value={lguDirectiveNotes}
                          onChange={(e) => setLguDirectiveNotes(e.target.value)}
                          placeholder="State the formal directive, orders given to MDRRMO or municipal responders, or terms of LGU intervention..."
                          className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {isLguActionSubmitted ? (
                          <span className="text-xs font-semibold text-accent flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Official directive recorded and audit logged</span>
                          </span>
                        ) : <span className="text-[10px] text-muted">Action will be logged in system audit trail</span>}

                        <button
                          type="submit"
                          className="px-4 py-2 bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-ink rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="whitespace-nowrap">Submit LGU action</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Official Involvement Neutrality Callout */}
              {selectedCase.isInvolvingOfficial && (
                <div className="bg-paper-2 border border-rule rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-ink font-semibold text-xs">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span>Special classification: complaint involving public official</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    This inquiry involves <strong>{selectedCase.officialInvolvedName || selectedCase.officialInvolvedPosition}</strong> ({selectedCase.officialInvolvedAgency}). As per DILG protocols, the record is maintained under neutral administrative classification without presumed guilt, subject to formal conciliation and MLGOO oversight.
                  </p>
                </div>
              )}

              {/* PRIMARY ACCIDENT & CASE OVERVIEW CARD */}
              <div className="bg-paper rounded-xl border border-rule p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-paper-2 text-accent border border-rule flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-ink tracking-tight">
                        {selectedCase.title}
                      </h3>
                      <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-ink">{selectedCase.category || 'Accident incident'}</span>
                        <span>·</span>
                        <span className="font-mono text-accent font-semibold num">{selectedCase.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedCase.status} />
                    <PriorityBadge priority={selectedCase.priority} />
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-1">
                    <div className="text-muted font-medium text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-warning shrink-0" />
                      <span>Incident location</span>
                    </div>
                    <div className="font-semibold text-ink text-xs">
                      {selectedCase.sitio ? `Sitio ${selectedCase.sitio}, ` : ''}Brgy. {selectedCase.barangay}
                    </div>
                    {selectedCase.specificLocation && (
                      <div className="text-xs text-muted truncate" title={selectedCase.specificLocation}>
                        {selectedCase.specificLocation}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-1">
                    <div className="text-muted font-medium text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>Date of accident</span>
                    </div>
                    <div className="font-semibold text-ink text-xs num">
                      {selectedCase.incidentDate || formatDate(selectedCase.dateReported)}
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1 num">
                      <Clock className="w-3 h-3 text-muted" />
                      <span>{selectedCase.incidentTime || 'No specified time'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-1">
                    <div className="text-muted font-medium text-xs flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>Reported by</span>
                    </div>
                    <div className="font-semibold text-ink text-xs">
                      {selectedCase.reporterName || 'Resident citizen (Roxas)'}
                    </div>
                    <div className="text-xs text-muted font-medium">
                      {selectedCase.isCitizenReport ? 'Citizen portal report' : 'Verified resident'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-1">
                    <div className="text-muted font-medium text-xs flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-warning shrink-0" />
                      <span>MDRRMO response</span>
                    </div>
                    <div className="font-semibold text-xs">
                      {selectedCase.emergencyFirstRespondersDispatched ? (
                        <span className="text-accent flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Responders dispatched</span>
                        </span>
                      ) : (
                        <span className="text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{selectedCase.status === 'Resolved' ? 'Completed' : 'Standby for dispatch'}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {selectedCase.respondingAmbulanceUnit || 'MDRRMO Roxas Command'}
                    </div>
                  </div>
                </div>

                {/* Narrative / Description */}
                <div className="space-y-2 pt-2 border-t border-rule">
                  <h4 className="font-semibold text-xs text-ink flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted" />
                    <span>Incident narrative and summary</span>
                  </h4>
                  <div className="bg-paper-2 p-4 rounded-lg border border-rule text-xs text-ink leading-relaxed font-normal whitespace-pre-wrap">
                    {selectedCase.initialNarrative || selectedCase.description || 'No additional narrative recorded.'}
                  </div>
                </div>

                {/* Additional Accident Specifics (Vehicles / Hospital) */}
                {(selectedCase.accidentVehicleDetails || selectedCase.hospitalTransported) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-rule">
                    {selectedCase.accidentVehicleDetails && (
                      <div className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-1">
                        <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-muted" />
                          <span>Vehicles involved</span>
                        </span>
                        <p className="text-xs text-muted font-medium">
                          {selectedCase.accidentVehicleDetails}
                        </p>
                      </div>
                    )}
                    {selectedCase.hospitalTransported && (
                      <div className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-1">
                        <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted" />
                          <span>Hospital or transport facility</span>
                        </span>
                        <p className="text-xs text-muted font-medium">
                          {selectedCase.hospitalTransported}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Evidence & Attached Photos */}
              {selectedCase.imageUrls && selectedCase.imageUrls.length > 0 && (
                <div className="bg-paper rounded-xl border border-rule p-4 space-y-3 shadow-xs">
                  <h3 className="font-semibold text-ink text-xs flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-muted" />
                    <span>Attached evidence and photos</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedCase.imageUrls.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-rule hover:border-accent transition-colors shadow-xs w-32 h-32 sm:w-40 sm:h-40 bg-paper-2 relative group focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
                      >
                        <img 
                          src={url} 
                          alt={`Evidence ${i + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-paper text-xs font-semibold bg-ink/75 px-2 py-1 rounded whitespace-nowrap">View full</span>
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
              <div>
                <h3 className="font-semibold text-ink text-xs">
                  Full case chronology and audit chain
                </h3>
                <p className="text-xs text-muted">Every action, hearing, referral, and status update</p>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-rule">
                {(!selectedCase.timeline || selectedCase.timeline.length === 0) ? (
                  <div className="text-muted py-4">No timeline events recorded.</div>
                ) : (
                  selectedCase.timeline.map((event, idx) => (
                    <div key={event.id ? `${event.id}-${idx}` : `event-${idx}`} className="relative group">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-paper bg-accent shadow-xs" />
                      <div className="bg-paper-2 p-3 rounded-lg border border-rule space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-ink">{event.title}</span>
                          <span className="text-xs text-muted font-mono num">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{event.description}</p>
                        <div className="text-[11px] text-muted flex items-center gap-2 pt-1 border-t border-rule">
                          <span className="font-medium text-ink">Action by: {event.actorName}</span>
                          <span>·</span>
                          <span>{event.actorRole}</span>
                          <span>·</span>
                          <span className="text-accent font-semibold">{event.actorAgency}</span>
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
        <div className="bg-paper-2 px-5 py-3 border-t border-rule flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-muted">
          <span className="num">Last updated: {formatDate(selectedCase.dateLastUpdated)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete case ${selectedCase.id} ("${selectedCase.title}")? This action cannot be undone.`)) {
                  deleteCase(selectedCase.id);
                  setSelectedCaseId(null);
                }
              }}
              className="px-3 py-1.5 bg-paper hover:bg-paper-3 active:bg-paper-2 text-error border border-rule rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
              title="Delete this case permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Delete case</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCaseId(null)}
              className="px-4 py-1.5 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule rounded-lg font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Close dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-MODAL 1: STATUS CHANGE */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-60 bg-ink/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleStatusSubmit} className="bg-paper rounded-xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xs border border-rule my-auto">
            <div className="flex items-start justify-between border-b border-rule pb-3">
              <div>
                <h3 className="font-bold text-base text-ink flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Update case status</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  <span className="font-mono num">{selectedCase.id}</span> · {selectedCase.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-lg hover:bg-paper-3 active:bg-paper-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Status Visual Banner */}
            <div className="p-3 rounded-lg border border-rule bg-paper-2 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
              <div>
                <div className="font-semibold text-ink">
                  {selectedNewStatus === 'Resolved' && 'Case outcome: Resolved and settled (Completed)'}
                  {selectedNewStatus === 'Unresolved' && 'Status: Unresolved incident'}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {selectedNewStatus === 'Resolved'
                    ? 'The case will be marked completed. Automatically counted toward the Official Governance & LTIA Resolution Rate.'
                    : 'The case remains unresolved.'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">
                Select new case status *
              </label>
              <select
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value as CaseStatus)}
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden transition-colors cursor-pointer disabled:opacity-50"
              >
                <option value="Unresolved">Unresolved incident</option>
                <option value="Resolved">Resolved (Amicable settlement or solved)</option>
              </select>
            </div>

            {/* Mandatory Reason Input */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Mandatory reason for status change *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g., Complainant and respondent reached an agreement before the Lupon and signed the settlement document."
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1">Additional remarks or terms of agreement (Optional)</label>
              <textarea
                placeholder="Optional details of the agreement, conditions, next hearing date, or specific instructions..."
                value={statusChangeRemarks}
                onChange={(e) => setStatusChangeRemarks(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-rule">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-paper-3 active:bg-paper-2 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Cancel</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-ink rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="whitespace-nowrap">Save audit entry</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
