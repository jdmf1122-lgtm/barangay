import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Clock, 
  FileText, 
  Lock,
  Search,
  MapPin,
  ArrowUpRight,
  TrendingUp,
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

      // Status filter (fixed TS2367 type narrowing comparison)
      if (selectedStatus === 'RESOLVED') {
        if (c.status !== 'Resolved') return false;
      } else if (selectedStatus === 'ACTIVE') {
        if (c.status === 'Resolved') return false;
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
      {/* Top Banner with Official Agency Seal & Civic Tokens */}
      <section
        aria-label="Public transparency and governance overview"
        className="bg-paper border border-rule rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-paper-2 border border-rule p-1.5 shrink-0 flex items-center justify-center">
            <img
              src={isMdrrmo ? '/mdrrmo_logo.png' : '/lgu_logo.png'}
              alt={isMdrrmo ? 'MDRRMO Roxas official seal' : 'Municipal Government of Roxas official seal'}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-2 text-ink text-xs font-semibold border border-rule mb-1.5">
              <Eye className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Public sector accountability &amp; transparency portal</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-ink tracking-tight leading-tight">
              Cross-agency governance and incident transparency
            </h2>
            <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
              Consolidated incident metrics and real-time public reporting aggregated across all {ROXAS_BARANGAYS.length} Barangays, Municipal LGU, and MDRRMO Roxas.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-rule bg-paper-2 text-xs text-ink max-w-xs z-10 space-y-1">
          <div className="flex items-center gap-1.5 text-ink font-semibold">
            <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Data privacy safeguards active</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Compliant with RA 10173 (Data Privacy Act of 2012). Sensitive citizen records, blotter narratives, and witness identities are strictly role-gated.
          </p>
        </div>
      </section>

      {/* Aggregate Transparency KPIs */}
      <section aria-label="Transparency key performance indicators" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Total incidents reported</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-ink font-outlier tabular-nums">{stats.totalCases}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            <span>Recorded in {currentYear}</span>
            <div className="h-px flex-1 bg-rule"></div>
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Resolution rate</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-success font-outlier tabular-nums">
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%
          </p>
          <p className="text-xs text-muted mt-1 font-outlier tabular-nums">
            {stats.totalResolvedCases} of {stats.totalCases} incidents settled
          </p>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Active and ongoing incidents</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-warning font-outlier tabular-nums">
            {stats.totalOngoingCases}
          </p>
          <p className="text-xs text-muted mt-1">
            Currently unresolved or in response
          </p>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Average resolution time</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 text-ink font-outlier tabular-nums">
            {stats.averageResolutionDays} days
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            <span>Intake to full resolution</span>
            <div className="h-px flex-1 bg-rule"></div>
          </div>
        </div>
      </section>

      {/* Two Column Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Distribution by Barangay Jurisdiction */}
        <section aria-label="Incident distribution by barangay" className="bg-paper rounded-xl border border-rule shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>Incidents by barangay jurisdiction ({currentYear})</span>
              </h3>
              <p className="text-xs text-muted mt-0.5">Distribution of reported incidents across Roxas</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-paper-2 text-ink border border-rule rounded-md font-outlier tabular-nums">
              {activeBarangayCounts.length} active {activeBarangayCounts.length === 1 ? 'barangay' : 'barangays'}
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activeBarangayCounts.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted">
                No incidents reported across barangays yet for {currentYear}.
              </div>
            ) : (
              activeBarangayCounts.map(([brgy, count]) => {
                const pct = stats.totalCases > 0 ? Math.round((count / stats.totalCases) * 100) : 0;
                return (
                  <div key={brgy} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-ink font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
                        <span>Brgy. {brgy}</span>
                      </span>
                      <span className="text-muted font-outlier tabular-nums">
                        {count} {count === 1 ? 'incident' : 'incidents'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-paper-3 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Response & Resolution Summary */}
        <section aria-label="Response and resolution overview" className="bg-paper rounded-xl border border-rule shadow-xs p-5 space-y-4">
          <div className="border-b border-rule pb-3">
            <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent shrink-0" />
              <span>Response &amp; status performance overview</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">Municipal case handling and inter-agency dispatch status</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-paper-2 border border-rule rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Resolved cases</span>
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              </div>
              <p className="text-2xl font-semibold text-success font-outlier tabular-nums">{stats.totalResolvedCases}</p>
              <p className="text-xs text-muted">Settled amicably or closed by responders</p>
            </div>

            <div className="bg-paper-2 border border-rule rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Active ongoing</span>
                <Clock className="w-4 h-4 text-warning shrink-0" />
              </div>
              <p className="text-2xl font-semibold text-warning font-outlier tabular-nums">{stats.totalOngoingCases}</p>
              <p className="text-xs text-muted">Under response or Lupon conciliation</p>
            </div>
          </div>

          <div className="p-3 bg-paper-2 rounded-xl border border-rule space-y-2 text-xs">
            <div className="flex items-center justify-between text-ink font-semibold">
              <span>Overall case clearance rate</span>
              <span className="font-outlier font-semibold text-success tabular-nums">
                {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-paper-3 rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-2 rounded-full"
                style={{ width: `${stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted leading-relaxed pt-1">
              Transparency tracking ensures every incident reported by residents is acknowledged, dispatched, and resolved with official accountability.
            </p>
          </div>
        </section>
      </div>

      {/* Public Incident Reports & Transparency Feed */}
      <section aria-label="Citizen reports and transparency registry" className="bg-paper rounded-xl border border-rule shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
          <div>
            <h3 className="font-semibold text-base text-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent shrink-0" />
              <span>Resident incident reports &amp; transparency registry</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Live record of citizen reports filed directly by residents across Roxas
            </p>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-paper-2 text-ink border border-rule self-start sm:self-center font-outlier tabular-nums">
            {filteredFeedCases.length} {filteredFeedCases.length === 1 ? 'report logged' : 'reports logged'}
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              aria-label="Search reports"
              placeholder="Search reports by title, sitio, or Case ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink placeholder:text-muted focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none transition-colors motion-reduce:transition-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by barangay"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="px-3 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none transition-colors motion-reduce:transition-none cursor-pointer"
            >
              <option value="ALL">All barangays</option>
              {ROXAS_BARANGAYS.map((b) => (
                <option key={b} value={b}>Brgy. {b}</option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 bg-paper-2 border border-rule rounded-lg text-xs text-ink font-medium focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none transition-colors motion-reduce:transition-none cursor-pointer"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active &amp; ongoing</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Incident Reports Table */}
        <div className="overflow-x-auto border border-rule rounded-xl">
          <table className="w-full text-left text-xs divide-y divide-rule">
            <thead className="bg-paper-2 text-muted font-semibold text-xs">
              <tr>
                <th className="py-3 px-3.5">Case code</th>
                <th className="py-3 px-3.5">Incident title &amp; details</th>
                <th className="py-3 px-3.5">Jurisdiction / location</th>
                <th className="py-3 px-3.5">Date reported</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule bg-paper">
              {filteredFeedCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <FileText className="w-8 h-8 mx-auto text-muted/60 mb-2" />
                    <p className="font-semibold text-ink">No incident reports found</p>
                    <p className="text-xs text-muted mt-1">
                      {searchTerm || selectedBarangay !== 'ALL' || selectedStatus !== 'ALL'
                        ? 'Try adjusting your search keywords or filters.'
                        : 'Resident incident reports will automatically appear here once filed.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFeedCases.map((c: Case) => {
                  return (
                    <tr key={c.id} className="hover:bg-paper-2 transition-colors motion-reduce:transition-none">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-outlier font-semibold tabular-nums text-xs px-2 py-0.5 bg-paper-2 text-ink rounded border border-rule">
                          #{c.id}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-ink leading-snug line-clamp-1 max-w-sm">
                          {c.title}
                        </div>
                        {c.description && c.description !== c.title && (
                          <div className="text-xs text-muted line-clamp-1 max-w-sm mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-semibold text-ink">
                          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span>Brgy. {c.barangay}</span>
                        </div>
                        {c.sitio && (
                          <div className="text-xs text-muted pl-4.5">
                            Sitio {c.sitio}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-muted">
                        <div className="flex items-center gap-1 font-outlier tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-muted shrink-0" />
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
                          data-testid={`btn-view-transparency-case-${c.id}`}
                          onClick={() => setSelectedCaseId(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-accent hover:text-accent/80 active:bg-paper-3 bg-paper-2 hover:bg-paper-3 rounded-md transition-colors motion-reduce:transition-none border border-rule focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>View details</span>
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
