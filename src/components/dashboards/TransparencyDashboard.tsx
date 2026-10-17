import React from 'react';
import { 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Building2, 
  FileText, 
  Lock
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { useAuth } from '../../hooks/useAuth';
import { generateAnnualStatistics } from '../../utils/reportGenerators';
import { ROXAS_BARANGAYS } from '../../types';

export const TransparencyDashboard: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();
  const currentYear = 2026;
  const isMdrrmo = currentUser?.agencyType === 'MDRRMO';
  const stats = generateAnnualStatistics(cases, currentYear);

  return (
    <div id="transparency-dashboard-view" className="space-y-6">
      {/* Top Banner with Official Agency Seal & Dynamic Palette */}
      <div className={`text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 relative overflow-hidden ${
        isMdrrmo
          ? 'bg-gradient-to-r from-[#0a1628] via-[#142642] to-[#1c1208] border-orange-500/80 ring-1 ring-amber-400/30'
          : 'bg-gradient-to-r from-[#0b3d1f] via-[#0f532a] to-[#082e16] border-amber-400/80 ring-1 ring-amber-300/30'
      }`}>
        {/* Subtle background seal watermark */}
        <img
          src={isMdrrmo ? '/mdrrmo_logo.png' : '/lgu_logo.png'}
          alt=""
          className={`absolute -right-6 -bottom-6 w-48 h-48 opacity-15 pointer-events-none select-none object-contain brightness-110 ${
            isMdrrmo ? 'drop-shadow-[0_0_15px_rgba(249,115,22,0.25)]' : 'drop-shadow-[0_0_15px_rgba(250,204,21,0.25)]'
          }`}
        />

        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 z-10">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-md border-2 flex-shrink-0 flex items-center justify-center ${
            isMdrrmo ? 'border-orange-500 ring-2 ring-amber-400/50' : 'border-amber-400 ring-2 ring-[#0f532a]/60'
          }`}>
            <img
              src={isMdrrmo ? '/mdrrmo_logo.png' : '/lgu_logo.png'}
              alt={isMdrrmo ? 'MDRRMO Roxas Official Seal' : 'Municipal Government of Roxas Official Seal'}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-bold border shadow-xs mb-1.5 ${
              isMdrrmo
                ? 'bg-[#06101e]/90 text-amber-300 border-orange-500/60'
                : 'bg-[#062612]/90 text-amber-300 border-amber-400/60'
            }`}>
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Public Sector Accountability & Transparency Portal</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight drop-shadow-xs">
              Cross-Agency Governance & Case Performance Transparency
            </h2>
            <p className="text-xs text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              Controlled transparency metrics aggregated across Barangay Local Governments, Municipal LGU, and DILG Roxas.
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border text-xs text-amber-100/90 max-w-xs z-10 shadow-sm backdrop-blur-xs ${
          isMdrrmo
            ? 'bg-[#06101e]/85 border-orange-500/50'
            : 'bg-[#062612]/85 border-amber-400/50'
        }`}>
          <div className="flex items-center space-x-1.5 text-amber-300 font-bold mb-1">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Privacy Safeguards Active</span>
          </div>
          <p className="text-[11px] text-emerald-100/80 leading-relaxed">
            Compliant with RA 10173 (Data Privacy Act of 2012). Sensitive personal records, blotter narratives, and witness identities are strictly role-gated.
          </p>
        </div>
      </div>

      {/* Aggregate Transparency KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Complaints Received</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{stats.totalCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Recorded in {currentYear}</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Resolution Rate</p>
          <h3 className="text-3xl font-bold mt-1 text-emerald-600">
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%
          </h3>
          <p className="text-[10px] text-teal-600 font-medium mt-1">
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}% settlement rate
          </p>
        </div>

        <div className="bg-amber-600 rounded-lg shadow-sm border border-amber-700 p-4 flex flex-col justify-center items-center text-white">
          <span className="text-xs uppercase font-bold tracking-wider opacity-90 mb-1 text-center">Active & Ongoing Cases</span>
          <span className="text-4xl font-extrabold">{stats.totalOngoingCases}</span>
          <p className="text-[10px] text-amber-100 font-medium mt-1 text-center">
            Currently unresolved
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Avg Duration</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">{stats.averageResolutionDays} days</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>Intake to Resolution</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Two Column Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Category */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-bold text-sm text-slate-800 mb-1">
            Case Categories & Incident Types ({currentYear})
          </h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of community disputes and reports</p>

          <div className="space-y-3">
            {Object.entries(stats.casesByCategory).map(([cat, count]) => {
              const pct = stats.totalCases > 0 ? Math.round((count / stats.totalCases) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-[260px]">{cat}</span>
                    <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inter-Agency Transfer & Oversight Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">

        </div>
      </div>
    </div>
  );
};
