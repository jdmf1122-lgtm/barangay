import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Building2, 
  FileText, 
  Lock,
  Search,
  Filter,
  MapPin,
  ArrowUpRight,
  AlertTriangle,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { useAuth } from '../../hooks/useAuth';
import { generateAnnualStatistics, formatDate } from '../../utils/reportGenerators';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { ROXAS_BARANGAYS, Case } from '../../types';

export const TransparencyDashboard: React.FC = () => {
  const { cases, setSelectedCaseId } = useCases();
  const { currentUser } = useAuth();
  const currentYear = 2026;
  const isMdrrmo = currentUser?.agencyType === 'MDRRMO';
  const stats = generateAnnualStatistics(cases, currentYear);

  // Filter state for Public Incident Registry
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  // Filter cases for the live transparency feed
  const filteredFeedCases = useMemo(() => {
    const list = cases || [];
    return list.filter((c: Case) => {
      // Search filter (title, case id, sitio, specific location)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = (c.title || '').toLowerCase().includes(query);
        const matchesId = (c.id || '').toLowerCase().includes(query);
        const matchesSitio = (c.sitio || '').toLowerCase().includes(query);
        const matchesLocation = (c.specificLocation || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesSitio && !matchesLocation) {
          return false;
        }
      }

      // Barangay filter
      if (selectedBarangay !== 'ALL' && c.barangay !== selectedBarangay) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'RESOLVED') {
        if (c.status !== 'Resolved' && c.status !== 'Closed') return false;
      } else if (selectedStatus === 'ACTIVE') {
        if (c.status === 'Resolved' || c.status === 'Closed') return false;
      }

      return true;
    });
  }, [cases, searchTerm, selectedBarangay, selectedStatus]);

  // Barangays that actually have incidents logged
  const activeBarangayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (cases || []).forEach((c) => {
      if (c.barangay) {
        counts[c.barangay] = (counts[c.barangay] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [cases]);

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
              Cross-Agency Governance & Incident Transparency
            </h2>
            <p className="text-xs text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              Consolidated incident metrics and real-time public reporting aggregated across all {ROXAS_BARANGAYS.length} Barangays, Municipal LGU, and MDRRMO Roxas.
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
            Compliant with RA 10173 (Data Privacy Act of 2012). Sensitive citizen records, blotter narratives, and witness identities are strictly role-gated.
          </p>
        </div>
      </div>

      {/* Aggregate Transparency KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Total Incidents Reported</p>
          <h3 className="text-3xl font-extrabold mt-1 text-slate-900">{stats.totalCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Recorded in {currentYear}</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Resolution Rate</p>
          <h3 className="text-3xl font-extrabold mt-1 text-emerald-600">
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">
            {stats.totalResolvedCases} of {stats.totalCases} incidents settled
          </p>
        </div>

        <div className="bg-amber-600 rounded-xl shadow-sm border border-amber-700 p-4 flex flex-col justify-center items-center text-white">
          <span className="text-xs uppercase font-bold tracking-wider opacity-90 mb-1 text-center">Active & Ongoing Incidents</span>
          <span className="text-3xl sm:text-4xl font-extrabold">{stats.totalOngoingCases}</span>
          <p className="text-[10px] text-amber-100 font-medium mt-1 text-center">
            Currently unresolved / in response
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Avg Resolution Time</p>
          <h3 className="text-3xl font-extrabold mt-1 text-blue-600">{stats.averageResolutionDays} days</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>Intake to Full Resolution</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Two Column Visual Analytics (Replaced rigid collision categories with Barangay distribution & Performance overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Distribution by Barangay Jurisdiction */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Incidents by Barangay Jurisdiction ({currentYear})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of reported incidents across Roxas</p>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              {activeBarangayCounts.length} Active {activeBarangayCounts.length === 1 ? 'Barangay' : 'Barangays'}
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activeBarangayCounts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No incidents reported across barangays yet for {currentYear}.
              </div>
            ) : (
              activeBarangayCounts.map(([brgy, count]) => {
                const pct = stats.totalCases > 0 ? Math.round((count / stats.totalCases) * 100) : 0;
                return (
                  <div key={brgy} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Brgy. {brgy}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold">{count} {count === 1 ? 'incident' : 'incidents'} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Response & Resolution Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Response & Status Performance Overview</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Municipal case handling and inter-agency dispatch status</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">Resolved Cases</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-900">{stats.totalResolvedCases}</p>
              <p className="text-[10px] text-emerald-700">Settled amicably or closed by responders</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">Active Ongoing</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-900">{stats.totalOngoingCases}</p>
              <p className="text-[10px] text-amber-700">Under response or Lupon conciliation</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span>Overall Case Clearance Rate</span>
              <span className="font-mono font-bold text-emerald-700">
                {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
              Transparency tracking ensures every incident reported by residents is acknowledged, dispatched, and resolved with official accountability.
            </p>
          </div>
        </div>
      </div>

      {/* Public Incident Reports & Transparency Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Resident Incident Reports & Transparency Registry</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live record of citizen reports filed directly by residents across Roxas
            </p>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 self-start sm:self-center">
            {filteredFeedCases.length} {filteredFeedCases.length === 1 ? 'Report Logged' : 'Reports Logged'}
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title, sitio, or Case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Barangays</option>
              {ROXAS_BARANGAYS.map((b) => (
                <option key={b} value={b}>Brgy. {b}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active / Ongoing</option>
              <option value="RESOLVED">Resolved / Closed</option>
            </select>
          </div>
        </div>

        {/* Incident Reports Table / Feed */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Case Code</th>
                <th className="py-3 px-3.5">Incident Title & Details</th>
                <th className="py-3 px-3.5">Jurisdiction / Location</th>
                <th className="py-3 px-3.5">Date Reported</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredFeedCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No incident reports found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm || selectedBarangay !== 'ALL' || selectedStatus !== 'ALL'
                        ? 'Try adjusting your search keywords or filters.'
                        : 'Resident incident reports will automatically appear here once filed.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFeedCases.map((c: Case) => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          #{c.id}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 leading-snug line-clamp-1 max-w-sm">
                          {c.title}
                        </div>
                        {c.description && c.description !== c.title && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Brgy. {c.barangay}</span>
                        </div>
                        {c.sitio && (
                          <div className="text-[11px] text-slate-500 pl-4.5">
                            Sitio {c.sitio}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(c.dateReported || c.dateCreated)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={c.status} size="sm" />
                          <PriorityBadge priority={c.priority} />
                        </div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCaseId(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
