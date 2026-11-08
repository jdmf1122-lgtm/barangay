import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  User, 
  Building2, 
  Clock,
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
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Immutable Integrity Log • Chain of Custody</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight drop-shadow-xs">
              System Audit Trail & Accountability Logs
            </h2>
            <p className="text-xs text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              Real-time, non-repudiable audit logs recording all case registrations, status transitions, delay diagnoses, inter-agency endorsements, and DILG directives.
            </p>
          </div>
        </div>

        <div className="flex gap-2 z-10">
          <button
            onClick={handleExportCsv}
            className={`px-4 py-2 rounded-xl text-xs font-black shadow-md border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 border-amber-200 ${
              isMdrrmo ? 'text-[#0a1628]' : 'text-[#082e16]'
            }`}
          >
            <Download className={`w-4 h-4 ${isMdrrmo ? 'text-[#0a1628]' : 'text-[#082e16]'}`} />
            <span>Export Audit Log CSV</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, action, case ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 rounded border border-slate-300 text-xs focus:bg-white"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
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
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
          >
            <option value="ALL">All Agencies</option>
            <option value="Barangay">Barangay</option>

            <option value="Municipal">LGU / Municipal</option>
            <option value="DILG">DILG</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{filteredLogs.length}</strong> of <strong>{auditLogs.length}</strong> recorded audit events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor & Agency</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Event Details</th>
                <th className="py-3 px-3">Terminal Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans text-xs">
                    No audit log records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="py-2.5 px-3 font-sans max-w-xs">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole} • {log.userAgency}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-blue-700 whitespace-nowrap">
                      {log.caseId || 'SYSTEM'}
                    </td>

                    <td className="py-2.5 px-3 font-sans text-slate-700 max-w-md">
                      {log.details}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-[10px]">
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
