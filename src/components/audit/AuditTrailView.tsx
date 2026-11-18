import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Lock
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, exportToCsv } from '../../utils/reportGenerators';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useCases();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [agencyFilter, setAgencyFilter] = useState('ALL');

  const isMdrrmo = currentUser?.agencyType === 'MDRRMO';

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (agencyFilter !== 'ALL' && !log.userAgency.includes(agencyFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const mCase = log.caseId?.toLowerCase().includes(q);
      const mUser = log.userName.toLowerCase().includes(q);
      const mAction = log.action.toLowerCase().includes(q);
      const mDetails = log.details.toLowerCase().includes(q);
      if (!mCase && !mUser && !mAction && !mDetails) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Agency', 'Action', 'Case ID', 'Details', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userName,
      l.userRole,
      l.userAgency,
      l.action,
      l.caseId || '',
      l.details,
      l.ipAddress || '127.0.0.1'
    ]);
    exportToCsv(`B-CONNECT_Audit_Trail_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div id="audit-trail-view" className="space-y-4">
      {/* Top Banner with Official Agency Seal */}
      <section
        aria-label="Audit trail overview"
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
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-2 text-ink text-xs font-semibold border border-rule">
                <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Immutable integrity log &middot; Chain of custody</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-ink tracking-tight leading-tight">
              System Audit Trail & Accountability Logs
            </h2>
            <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
              Real-time, non-repudiable audit logs recording all case registrations, status transitions, delay diagnoses, inter-agency endorsements, and DILG directives.
            </p>
          </div>
        </div>

        <div className="flex gap-2 z-10">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg text-xs font-bold shadow-xs bg-accent text-accent-ink hover:opacity-90 active:scale-[0.98] transition-opacity flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Log CSV</span>
          </button>
        </div>
      </section>

      {/* Control Bar */}
      <div className="bg-paper p-3.5 rounded-xl border border-rule shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, action, case ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-paper-2 rounded-lg border border-rule text-xs text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-1.5 bg-paper-2 rounded-lg border border-rule font-medium text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="CASE_CREATED">Case Created</option>
            <option value="STATUS_UPDATED">Status Updated</option>
            <option value="PENDING_REASON_UPDATED">Pending Reason Updated</option>
            <option value="CASE_REFERRED">Case Referred</option>
            <option value="REFERRAL_ACCEPTED">Referral Accepted</option>
            <option value="DILG_RECOMMENDATION_ISSUED">DILG Recommendation Issued</option>
            <option value="DILG_RECOMMENDATION_RESPONDED">DILG Recommendation Responded</option>
            <option value="DILG_RECOMMENDATION_COMPLETED">DILG Recommendation Completed</option>
            <option value="ATTACHMENT_ADDED">Attachment Added</option>
          </select>

          <select
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="p-1.5 bg-paper-2 rounded-lg border border-rule font-medium text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="ALL">All Agencies</option>
            <option value="Barangay">Barangay</option>
            <option value="Municipal">LGU / Municipal</option>
            <option value="DILG">DILG</option>
          </select>
        </div>

        <div className="text-xs text-muted font-medium">
          Showing <strong className="text-ink tabular-nums">{filteredLogs.length}</strong> of <strong className="text-ink tabular-nums">{auditLogs.length}</strong> recorded audit events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-paper rounded-xl border border-rule shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-rule">
            <thead className="bg-paper-2 text-muted font-medium text-xs">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor & agency</th>
                <th className="py-2.5 px-3">Action type</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Event details</th>
                <th className="py-2.5 px-3">Terminal node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted font-sans text-xs">
                    No audit log records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="hover:bg-paper-2 transition-colors">
                    <td className="py-2.5 px-3 text-muted whitespace-nowrap font-mono text-[11px] tabular-nums">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-semibold text-ink">{log.userName}</div>
                      <div className="text-[11px] text-muted">{log.userRole} &middot; {log.userAgency}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-paper-2 text-ink border border-rule">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-accent whitespace-nowrap">
                      {log.caseId || 'SYSTEM'}
                    </td>

                    <td className="py-2.5 px-3 text-ink max-w-md leading-relaxed">
                      {log.details}
                    </td>

                    <td className="py-2.5 px-3 text-muted font-mono text-[11px] tabular-nums">
                      {log.ipAddress || '192.168.1.104'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
