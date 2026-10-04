import React from 'react';
import { 
  Landmark, 
  Building, 
  FileText, 
  TrendingUp, 
  MapPin, 
  ArrowUpRight, 
  Users, 
  CheckCircle,
  Clock
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
  const lguReferredCases = safeCases.filter((c) => c.isReferredToLgu || (c.currentHandlingAgency && c.currentHandlingAgency.includes('Municipal')));
  const resolvedCases = safeCases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const pendingCases = safeCases.filter((c) => c.isPending || c.status === 'Pending').length;

  // MDRRMO to LGU Escalated Incidents (MDRRMO non-response timeout reached)
  const escalatedToLguCases = safeCases.filter(
    (c) => c && c.isEscalatedToLgu && c.status !== 'Resolved' && c.status !== 'Closed'
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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800/40">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-100 text-xs font-semibold">
              <Landmark className="w-3.5 h-3.5" />
              <span>{isAdministrator ? 'Executive & Administrative Oversight' : 'Departmental Action & Public Service'} • LGU Roxas</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 text-[10px] font-mono font-bold border border-emerald-700/50">
              POV: {isAdministrator ? 'LGU Administrator' : 'Department Desk Officer'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            {isAdministrator ? 'Municipal Government Executive & Public Service Dashboard' : 'LGU Departmental Action & Grievance Desk Dashboard'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
            Coordinating municipal departments (MENRO, Market Operations, Municipal Legal, Engineering, MSWDO) across the 5 Barangays of Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex w-full md:w-auto">
          <button
            onClick={() => setActiveTab('standard_reports')}
            className="w-full sm:w-auto justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Municipal Report</span>
          </button>
        </div>
      </div>

      {/* Prominent Escalated Incidents Alert Card (MDRRMO Non-Response Timeout) */}
      {escalatedToLguCases.length > 0 && (
        <div id="lgu-escalated-incidents-section" className="bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-500/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
              </span>
              <div>
                <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide flex items-center gap-2">
                  <span>🚨 Incidents Escalated to LGU ({escalatedToLguCases.length})</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-rose-800/90 font-medium">
                  MDRRMO response deadline was exceeded without acknowledgment. Automated SMS alert dispatched to designated LGU Officials. LGU review and intervention is required.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-rose-300 text-rose-800 rounded-lg shadow-2xs self-start sm:self-auto">
              Automated Statutory Escalation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {escalatedToLguCases.map((c) => (
              <div 
                key={c.id} 
                className="bg-white border-2 border-rose-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-rose-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 bg-rose-100 text-rose-900 rounded border border-rose-200">
                      #{c.id}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                      Escalated to LGU
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">Location: {c.specificLocation || `Brgy. ${c.barangay}`}</span>
                    </p>
                  </div>

                  <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Emergency Type:</span>
                      <strong className="text-slate-900">{c.category || 'Accident Incident'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Reported Date & Time:</span>
                      <strong className="text-slate-900">{c.incidentDate || c.dateReported?.split('T')[0]} {c.incidentTime || ''}</strong>
                    </div>
                    <div className="flex justify-between text-rose-800 font-bold">
                      <span>Elapsed without MDRRMO:</span>
                      <span className="text-rose-700 font-mono underline decoration-rose-300">
                        {c.escalationElapsedStr || 'Over 2 hours'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Current Status:</span>
                      <span className="font-bold text-amber-800">{c.status || 'Escalated to LGU'}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Recommended Action:</span>
                      <strong className="text-rose-700">LGU intervention/review required</strong>
                    </div>
                  </div>

                  {c.escalationSmsRecipient && (
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>SMS delivered to: <strong>{c.escalationSmsRecipient}</strong> ({c.escalationSmsRecipientPhone})</span>
                    </div>
                  )}

                  {c.lguActionTaken && (
                    <div className="text-[10px] text-sky-800 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                      <span>Current LGU Directive: <strong>{c.lguActionTaken}</strong></span>
                      {c.lguInterventionNotes && <p className="text-slate-600 italic mt-0.5 line-clamp-1">"{c.lguInterventionNotes}"</p>}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Escalated: {c.escalatedAt ? new Date(c.escalatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                  <button
                    onClick={() => setSelectedCaseId(c.id)}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Intervene & Take Action</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Municipality Total</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{totalCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Across 5 Barangays</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs transition ${
          escalatedToLguCases.length > 0 
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/40' 
            : 'bg-white border-slate-200'
        }`}>
          <p className="text-xs text-rose-700 uppercase font-black tracking-tight flex items-center justify-between">
            <span>Escalated to LGU</span>
            {escalatedToLguCases.length > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
          </p>
          <h3 className="text-3xl font-black mt-1 text-rose-700">{escalatedToLguCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-rose-700 font-bold">
            <span>{escalatedToLguCases.length > 0 ? 'MDRRMO Timeout Exceeded' : 'Zero Escalations'}</span>
            <div className="h-px flex-1 bg-rose-200"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Resolved Cases</p>
          <h3 className="text-3xl font-bold mt-1 text-emerald-600">{resolvedCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-bold">
            <span>Settled / Completed</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">LGU Endorsements</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">{lguReferredCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>MENRO / Legal / Market</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Two columns: LGU Endorsements & Barangay Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: LGU Endorsed Cases */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                LGU Department Action Queue (MENRO / Legal / Market)
              </h3>
              <p className="text-xs text-slate-500">Matters referred to the Municipal Government</p>
            </div>
            <button
              onClick={() => setActiveTab('referrals')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Referrals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {lguReferredCases.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active cases currently referred to LGU departments.
              </div>
            ) : (
              lguReferredCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="py-3 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-800">{c.id}</span>
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} />
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                        Brgy. {c.barangay}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{c.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{c.description}</div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-xs">
                    <span className="text-[11px] font-medium text-emerald-800">
                      {c.assignedPersonnel || c.currentHandlingAgency}
                    </span>
                    {c.isPending && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium mt-1">
                        Pending: {c.pendingReason}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: 5 Barangays Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            5 Barangays Incident Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-3">Case load across Roxas, Oriental Mindoro</p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {ROXAS_BARANGAYS.map((bgy) => {
              const count = barangayCounts[bgy] || 0;
              const percent = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;

              return (
                <div key={bgy} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">Brgy. {bgy}</span>
                    <span className="font-mono text-slate-500">{count} case{count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${percent || (count > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
