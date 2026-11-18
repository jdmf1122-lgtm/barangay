import React from 'react';
import { 
  Landmark, 
  FileText, 
  MapPin, 
  ArrowUpRight, 
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { ROXAS_BARANGAYS } from '../../types';

export const LguDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { cases, setSelectedCaseId } = useCases();
  const { setActiveTab } = useUI();

  const isAdministrator = currentUser?.role === 'LGU_ADMINISTRATOR';

  const safeCases = cases || [];
  const totalCases = safeCases.length;
  const resolvedCases = safeCases.filter((c) => c.status === 'Resolved' || (c.status as string) === 'Closed').length;
  const pendingCases = safeCases.filter((c) => c.isPending || (c.status as string) === 'Pending').length;

  // MDRRMO to LGU Escalated Incidents (MDRRMO non-response timeout reached)
  const escalatedToLguCases = safeCases.filter(
    (c) => c && c.isEscalatedToLgu && c.status !== 'Resolved' && (c.status as string) !== 'Closed'
  );

  // Barangay case distribution
  const barangayCounts: Record<string, number> = {};
  safeCases.forEach((c) => {
    if (c?.barangay) {
      barangayCounts[c.barangay] = (barangayCounts[c.barangay] || 0) + 1;
    }
  });

  return (
    <div id="lgu-dashboard-view" className="space-y-6">
      {/* Top Banner with Official LGU Roxas Seal */}
      <section
        aria-label="LGU executive overview"
        className="bg-paper border border-rule rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-paper-2 border border-rule p-1.5 shrink-0 flex items-center justify-center">
            <img
              src="/lgu_logo.png"
              alt="Municipal Government of Roxas official seal"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-2 text-ink text-xs font-semibold border border-rule">
                <Landmark className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{isAdministrator ? 'Executive & administrative oversight' : 'Departmental action & public service'} &middot; LGU Roxas</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-ink tracking-tight leading-tight">
              {isAdministrator ? 'Municipal executive and public service console' : 'LGU departmental action and grievance desk'}
            </h2>
            <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
              Municipality of Roxas, Oriental Mindoro. Cross-departmental coordination and statutory escalation oversight across all 20 component barangays.
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto z-10">
          <button
            type="button"
            data-testid="btn-lgu-municipal-report"
            onClick={() => setActiveTab('standard_reports')}
            className="w-full sm:w-auto justify-center px-4 py-2 bg-paper-2 hover:bg-paper-3 active:bg-paper-3 text-ink rounded-lg text-xs font-semibold border border-rule transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4 text-ink shrink-0" />
            <span>Municipal reports</span>
          </button>
        </div>
      </section>

      {/* Prominent Escalated Incidents Section (MDRRMO Non-Response Timeout) */}
      {escalatedToLguCases.length > 0 && (
        <section
          id="lgu-escalated-incidents-section"
          aria-label="Statutory escalations requiring executive intervention"
          className="bg-paper border-2 border-error/70 rounded-xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <ShieldAlert className="w-4 h-4 text-error" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-ink">
                    Incidents escalated to LGU ({escalatedToLguCases.length})
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30">
                    Action required
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  MDRRMO response deadline was exceeded without acknowledgment. Automated SMS alert dispatched to designated LGU officials. Executive review and directive required.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-paper-2 border border-rule text-ink rounded-lg self-start sm:self-auto">
              Statutory escalation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {escalatedToLguCases.map((c) => (
              <div 
                key={c.id} 
                data-testid={`escalated-case-card-${c.id}`}
                className="bg-paper-2 border border-rule hover:border-error/50 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors motion-reduce:transition-none space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-outlier text-xs font-semibold px-2 py-0.5 bg-paper text-ink rounded border border-rule tabular-nums">
                      #{c.id}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                      <span>Escalated to LGU</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink leading-snug line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="truncate">Location: {c.specificLocation || `Brgy. ${c.barangay}`}</span>
                    </p>
                  </div>

                  <div className="bg-paper p-2.5 rounded-lg border border-rule text-xs space-y-1.5">
                    <div className="flex justify-between text-muted">
                      <span>Emergency type:</span>
                      <span className="text-ink font-semibold">{c.category || 'Accident incident'}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Reported date &amp; time:</span>
                      <span className="text-ink font-semibold font-outlier tabular-nums">
                        {c.incidentDate || c.dateReported?.split('T')[0]} {c.incidentTime || ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Elapsed without MDRRMO:</span>
                      <span className="text-error font-semibold font-outlier tabular-nums">
                        {c.escalationElapsedStr || 'Over 2 hours'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Current status:</span>
                      <span className="font-semibold text-ink">{c.status || 'Escalated to LGU'}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Recommended action:</span>
                      <span className="text-error font-semibold">Executive directive required</span>
                    </div>
                  </div>

                  {c.escalationSmsRecipient && (
                    <div className="text-xs text-ink bg-paper p-2 rounded-lg border border-rule flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                      <span>SMS delivered to <strong>{c.escalationSmsRecipient}</strong> ({c.escalationSmsRecipientPhone})</span>
                    </div>
                  )}

                  {c.lguActionTaken && (
                    <div className="text-xs text-ink bg-paper p-2 rounded-lg border border-rule space-y-0.5">
                      <div>Current directive: <strong>{c.lguActionTaken}</strong></div>
                      {c.lguInterventionNotes && (
                        <p className="text-muted italic line-clamp-1">&ldquo;{c.lguInterventionNotes}&rdquo;</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-rule flex items-center justify-between gap-2">
                  <span className="text-xs text-muted font-outlier tabular-nums">
                    Escalated: {c.escalatedAt ? new Date(c.escalatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                  <button
                    type="button"
                    data-testid={`btn-intervene-case-${c.id}`}
                    onClick={() => setSelectedCaseId(c.id)}
                    className="px-3 py-1.5 bg-accent hover:bg-accent/90 active:bg-accent/90 text-accent-ink rounded-lg text-xs font-semibold shadow-xs transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <span>Take action</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Metrics Row */}
      <section aria-label="Municipal case statistics" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Municipality total cases</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-ink font-outlier tabular-nums">{totalCases}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            <span>Across 20 barangays</span>
            <div className="h-px flex-1 bg-rule"></div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs transition-colors motion-reduce:transition-none ${
          escalatedToLguCases.length > 0 
            ? 'bg-paper-2 border-error/50' 
            : 'bg-paper border-rule'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium ${escalatedToLguCases.length > 0 ? 'text-error font-semibold' : 'text-muted'}`}>
              Escalated to LGU
            </p>
            {escalatedToLguCases.length > 0 && <span className="w-2 h-2 rounded-full bg-error"></span>}
          </div>
          <p className={`text-2xl sm:text-3xl font-semibold mt-1 font-outlier tabular-nums ${
            escalatedToLguCases.length > 0 ? 'text-error' : 'text-ink'
          }`}>
            {escalatedToLguCases.length}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className={escalatedToLguCases.length > 0 ? 'text-error font-medium' : 'text-muted'}>
              {escalatedToLguCases.length > 0 ? 'Timeout exceeded' : 'Zero escalations'}
            </span>
            <div className="h-px flex-1 bg-rule"></div>
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Active monitoring</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-ink font-outlier tabular-nums">{pendingCases}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            <span>Pending and in progress</span>
            <div className="h-px flex-1 bg-rule"></div>
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Resolved cases</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-success font-outlier tabular-nums">{resolvedCases}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            <span>Settled and completed</span>
            <div className="h-px flex-1 bg-rule"></div>
          </div>
        </div>
      </section>

      {/* Two columns: Municipal Case Monitoring & Barangay Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Municipal Incident & Case Monitoring */}
        <section aria-label="Municipal case monitoring feed" className="lg:col-span-2 bg-paper rounded-xl border border-rule shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <div>
              <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <span>Municipal incident &amp; case monitoring</span>
              </h3>
              <p className="text-xs text-muted mt-0.5">Cross-barangay incident oversight across 20 barangays</p>
            </div>
            <span className="text-xs text-ink bg-paper-2 px-2.5 py-1 rounded-full font-semibold border border-rule font-outlier tabular-nums">
              {safeCases.length} total monitored
            </span>
          </div>

          <div className="mt-3 divide-y divide-rule">
            {safeCases.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted space-y-1">
                <FileText className="w-8 h-8 mx-auto text-muted/60 mb-2" />
                <p className="font-semibold text-ink">No incident records currently logged</p>
                <p>Municipal incident reports will appear here as they are received.</p>
              </div>
            ) : (
              safeCases.slice(0, 8).map((c) => (
                <div
                  key={c.id}
                  data-testid={`case-row-${c.id}`}
                  onClick={() => setSelectedCaseId(c.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCaseId(c.id);
                    }
                  }}
                  className="py-3 px-2 hover:bg-paper-2 rounded-lg cursor-pointer transition-colors motion-reduce:transition-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-outlier text-xs font-semibold text-ink px-1.5 py-0.5 bg-paper-2 rounded border border-rule tabular-nums">
                        {c.caseNumber || c.id}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} />
                      <span className="text-xs text-muted bg-paper-2 px-2 py-0.5 rounded border border-rule flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>Brgy. {c.barangay}</span>
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-ink">{c.title}</div>
                    {c.description && (
                      <div className="text-xs text-muted line-clamp-1">{c.description}</div>
                    )}
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-xs shrink-0">
                    <span className="text-xs text-muted font-outlier tabular-nums">
                      {c.dateReported || c.dateCreated ? new Date(c.dateReported || c.dateCreated!).toLocaleDateString() : 'Recent'}
                    </span>
                    <span className="text-xs font-semibold text-accent hover:text-accent/80 mt-1 flex items-center gap-1">
                      <span>View details</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Col: 20 Barangays Distribution */}
        <section aria-label="Barangay incident distribution" className="bg-paper rounded-xl border border-rule shadow-xs p-4 sm:p-5">
          <div className="pb-3 border-b border-rule">
            <h3 className="font-semibold text-sm text-ink flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <span>Barangay incident distribution</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">Incident load across 20 barangays</p>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 mt-3">
            {ROXAS_BARANGAYS.map((bgy) => {
              const count = barangayCounts[bgy] || 0;
              const percent = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;

              return (
                <div key={bgy} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-ink">Brgy. {bgy}</span>
                    <span className="text-muted font-outlier tabular-nums">
                      {count} {count === 1 ? 'case' : 'cases'}
                    </span>
                  </div>
                  <div className="w-full bg-paper-3 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-accent h-1.5 rounded-full"
                      style={{ width: `${percent || (count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
