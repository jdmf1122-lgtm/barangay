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

  const isAdministrator = currentUser.role === 'LGU_ADMINISTRATOR';

  const totalCases = cases.length;
  const lguReferredCases = cases.filter((c) => c.isReferredToLgu || c.currentHandlingAgency.includes('Municipal'));
  const resolvedCases = cases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const pendingCases = cases.filter((c) => c.isPending || c.status === 'Pending').length;

  // Barangay case distribution
  const barangayCounts: Record<string, number> = {};
  cases.forEach((c) => {
    barangayCounts[c.barangay] = (barangayCounts[c.barangay] || 0) + 1;
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

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Pending Cases</p>
          <h3 className="text-3xl font-bold mt-1 text-amber-500">{pendingCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-bold">
            <span>Awaiting Action</span>
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
