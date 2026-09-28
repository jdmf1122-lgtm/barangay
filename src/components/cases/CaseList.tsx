import React from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  PlusCircle, 
  Download, 
  Eye, 
  Clock, 
  Building2, 
  ShieldAlert, 
  AlertCircle,
  ArrowRightLeft,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { StatusBadge, PriorityBadge, OfficialBadge } from '../common/StatusBadge';
import { ROXAS_BARANGAYS, IncidentCategory } from '../../types';
import { formatDateShort, exportToCsv } from '../../utils/reportGenerators';

export const CaseList: React.FC = () => {
  const { currentUser } = useAuth();
  const { cases, setSelectedCaseId } = useCases();
  const { setIsNewCaseModalOpen, searchQuery, setSearchQuery, filterBarangay, setFilterBarangay, filterStatus, setFilterStatus, filterCategory, setFilterCategory, filterOfficialInvolved, setFilterOfficialInvolved } = useUI();

  const isBarangayOfficer = currentUser?.agencyType === 'MDRRMO' && !!currentUser?.barangay;
  const userBarangay = currentUser?.barangay;

  // Filter logic
  const filteredCases = cases.filter((c) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchBarangay = c.barangay.toLowerCase().includes(q);
      const matchCategory = c.category.toLowerCase().includes(q);
      const matchPersons = c.personsInvolved.some((p) => p.name.toLowerCase().includes(q));
      const matchOfficial = c.officialInvolvedName?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchBarangay && !matchCategory && !matchPersons && !matchOfficial) {
        return false;
      }
    }

    // Barangay filter (Strict single barangay for Barangay accounts and Residents)
    if (isBarangayOfficer) {
      if (c.barangay !== userBarangay && !c.originatingAgency.includes(userBarangay!)) {
        return false;
      }
    } else if (currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') {
      if (c.barangay !== (currentUser.barangay || 'San Aquilino') && c.residentReporterId !== currentUser.id) {
        return false;
      }
    } else if (filterBarangay !== 'ALL' && c.barangay !== filterBarangay) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'Unresolved' && (c.status === 'Resolved' || c.status === 'Closed' as any)) return false;
      if (filterStatus === 'Resolved' && c.status !== 'Resolved' && c.status !== 'Closed' as any) return false;
    }

    // Category filter
    if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;

    // Official involved filter
    if (filterOfficialInvolved === 'YES' && !c.isInvolvingOfficial) return false;
    if (filterOfficialInvolved === 'NO' && c.isInvolvingOfficial) return false;



    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'Case ID',
      'Incident ID',
      'Title',
      'Category',
      'Barangay',
      'Date Reported',
      'Status',
      'Priority',
      'Current Agency',
      'Is Official Involved',
      'Official Name/Role',
      'Complainants',
      'Respondents'
    ];

    const rows = filteredCases.map((c) => [
      c.id,
      c.incidentId,
      c.title,
      c.category,
      c.barangay,
      c.dateReported,
      c.status,
      c.priority,
      c.currentHandlingAgency,
      c.isInvolvingOfficial ? 'YES' : 'NO',
      c.officialInvolvedName || c.officialInvolvedPosition || '',
      c.complainants.map((p) => p.name).join('; '),
      c.respondents.map((p) => p.name).join('; ')
    ]);

    exportToCsv(`B-CONNECT_Cases_Roxas_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div id="case-ledger-view" className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            Central Case & Incident Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full record of complaints, incidents, referrals, and outcomes in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-cases-csv"
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            id="btn-case-list-new-case"
            onClick={() => setIsNewCaseModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Incident / Case
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Advanced Case Filtering & Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Case ID, vehicles, plate, names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Barangay Filter */}
          <div>
            {(isBarangayOfficer || currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') ? (
              <div 
                className="w-full py-1.5 px-2 text-xs bg-emerald-50 text-emerald-950 rounded border border-emerald-300 font-bold flex items-center justify-between"
                title={`Jurisdiction locked to Barangay ${currentUser.barangay || userBarangay || 'San Aquilino'}`}
              >
                <span className="truncate">Brgy. {currentUser.barangay || userBarangay || 'San Aquilino'}</span>
                <span className="text-[9px] px-1 py-0.2 bg-emerald-200 text-emerald-900 rounded font-semibold">Jurisdiction Locked</span>
              </div>
            ) : (
              <select
                value={filterBarangay}
                onChange={(e) => setFilterBarangay(e.target.value)}
                className="w-full py-1.5 px-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Barangays (6)</option>
                {ROXAS_BARANGAYS.map((b) => (
                  <option key={b} value={b}>Brgy. {b}</option>
                ))}
              </select>
            )}
          </div>

          {/* Accident Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="ALL">All Crash Categories</option>
              <option value="Motorcycle vs Motorcycle Collision">Motorcycle vs Motorcycle</option>
              <option value="Motorcycle vs Car / SUV Collision">Motorcycle vs Car/SUV</option>
              <option value="Motorcycle vs Tricycle Collision">Motorcycle vs Tricycle</option>
              <option value="Car / 4-Wheeled Vehicle Collision">Car vs 4-Wheeled</option>
              <option value="Tricycle Collision / Rollover">Tricycle Rollover/Crash</option>
              <option value="Truck / Bus / Heavy Vehicle Crash">Truck/Bus Heavy Crash</option>
              <option value="PUV / Jeepney / Multicab Accident">PUV/Jeepney Accident</option>
              <option value="Pedestrian Hit by Vehicle / Motorcycle">Pedestrian Hit-and-Run/Crash</option>
              <option value="Bicycle / E-Bike / E-Trike Crash">E-Bike/Bicycle Crash</option>
              <option value="Single-Vehicle Road Skid / Fixed Object Crash">Road Skid / Ditch Crash</option>
              <option value="Multi-Vehicle Pileup Collision">Multi-Vehicle Pileup</option>
              <option value="Hit-and-Run Vehicular Crash">Hit-and-Run Crash</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Unresolved">Unresolved</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> total records</span>
          {(filterBarangay !== 'ALL' || filterStatus !== 'ALL' || filterOfficialInvolved !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBarangay('ALL');
                setFilterStatus('ALL');
                setFilterCategory('ALL');
                setFilterOfficialInvolved('ALL');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Case Data List: Dual Responsive Mode (Mobile Card Feed for Phones, Table for Tablets/Laptops) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Mobile View: High-density touch-friendly cards (Phones < 640px) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredCases.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs px-4">
              No cases match the selected filters or search query.
            </div>
          ) : (
            filteredCases.map((c) => (
              <div
                key={`mobile-${c.id}`}
                onClick={() => setSelectedCaseId(c.id)}
                className="p-4 space-y-2.5 hover:bg-emerald-50/30 active:bg-emerald-50/60 transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateShort(c.dateReported)}
                    </span>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                    {c.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>📍 Brgy. {c.barangay}</span>
                    {c.specificLocation && (
                      <span className="truncate max-w-[160px] text-slate-400">• {c.specificLocation}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                    {c.isInvolvingOfficial && (
                      <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1 py-0.5 rounded">
                        Official
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCaseId(c.id);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Docket →</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tablet & Desktop View: Central Data Table (Screens >= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Incident / Title</th>
                <th className="py-3 px-3">Barangay</th>
                <th className="py-3 px-3">Persons Involved</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Agency Handling</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No cases match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/40 transition cursor-pointer"
                    onClick={() => setSelectedCaseId(c.id)}
                  >
                    <td className="py-3 px-3 align-top font-mono font-bold text-blue-700 whitespace-nowrap">
                      {c.id}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {formatDateShort(c.dateReported)}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">{c.category}</span>
                        <PriorityBadge priority={c.priority} />
                      </div>
                      {c.isInvolvingOfficial && (
                        <div className="mt-1">
                          <OfficialBadge officialType={c.officialInvolvedType} />
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span className="font-medium text-slate-800">Brgy. {c.barangay}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {c.specificLocation}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs text-[11px]">
                      <div className="text-slate-800">
                        <span className="font-semibold text-slate-600">Complainant:</span>{' '}
                        {c.complainants.map((p) => p.name).join(', ') || 'N/A'}
                      </div>
                      <div className="text-slate-700 mt-0.5">
                        <span className="font-semibold text-slate-600">Respondent:</span>{' '}
                        {c.respondents.map((p) => p.name).join(', ') || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 align-top text-[11px] max-w-[160px]">
                      <div className="font-medium text-slate-800 truncate">
                        {c.isRemainedAtBarangay ? `Barangay ${c.barangay}` : c.currentHandlingAgency}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {c.assignedPersonnel || 'Unassigned'}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top text-[11px] max-w-xs">
                      {c.status === 'Resolved' || c.status === 'Closed' as any ? (
                        <div className="text-emerald-700 font-medium">
                          {c.outcomeType || 'Resolved'}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseId(c.id);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Dossier</span>
                      </button>
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
