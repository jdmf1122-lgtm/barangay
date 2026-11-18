import React from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MapPin
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { StatusBadge, PriorityBadge, OfficialBadge } from '../common/StatusBadge';
import { ROXAS_BARANGAYS } from '../../types';
import { formatDateShort, exportToCsv } from '../../utils/reportGenerators';
import { isConsolidatedCase } from '../../utils/duplicateReportDetector';

export const CaseList: React.FC = () => {
  const { currentUser } = useAuth();
  const { cases, setSelectedCaseId } = useCases();
  const { 
    searchQuery, 
    setSearchQuery, 
    filterBarangay, 
    setFilterBarangay, 
    filterStatus, 
    setFilterStatus, 
    filterCategory, 
    setFilterCategory, 
    filterOfficialInvolved, 
    setFilterOfficialInvolved 
  } = useUI();

  const isBarangayOfficer = (currentUser?.agencyType as string) === 'BARANGAY' && !!currentUser?.barangay;
  const userBarangay = currentUser?.barangay;

  const safeCases = cases || [];

  // Filter logic
  const filteredCases = safeCases.filter((c) => {
    if (!c) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (c.id || '').toLowerCase().includes(q);
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchBarangay = (c.barangay || '').toLowerCase().includes(q);
      const matchCategory = (c.category || '').toLowerCase().includes(q);
      const matchPersons = (c.personsInvolved || []).some((p) => (p?.name || '').toLowerCase().includes(q));
      const matchOfficial = c.officialInvolvedName?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchBarangay && !matchCategory && !matchPersons && !matchOfficial) {
        return false;
      }
    }

    // Barangay filter (Strict single barangay for Barangay accounts and Residents)
    if (isBarangayOfficer) {
      if (c.barangay !== userBarangay && !(c.originatingAgency && c.originatingAgency.includes(userBarangay!))) {
        return false;
      }
    } else if (currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT') {
      if (!currentUser?.id || c.residentReporterId !== currentUser.id) {
        return false;
      }
    } else if (filterBarangay !== 'ALL' && c.barangay !== filterBarangay) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'Unresolved' && (c.status === 'Resolved' || (c.status as string) === 'Closed')) return false;
      if (filterStatus === 'Resolved' && c.status !== 'Resolved' && (c.status as string) !== 'Closed') return false;
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
      (c.complainants || []).map((p) => p?.name || '').join('; '),
      (c.respondents || []).map((p) => p?.name || '').join('; ')
    ]);

    exportToCsv(`B-CONNECT_Cases_Roxas_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div id="case-ledger-view" className="space-y-4">
      {/* Top Header & Actions */}
      <section
        aria-label="Case ledger overview"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper p-4 rounded-xl border border-rule shadow-xs"
      >
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent" />
            <span>Central case and incident ledger</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Full record of complaints, incidents, referrals, and outcomes in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-cases-csv"
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink rounded-lg text-xs font-semibold border border-rule shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Filter Control Bar */}
      <section
        aria-label="Case filters and search"
        className="bg-paper p-4 rounded-xl border border-rule shadow-xs space-y-3"
      >
        <div className="flex items-center space-x-2 text-xs font-semibold text-ink">
          <Filter className="w-3.5 h-3.5 text-accent" />
          <span>Case filtering and search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search case ID, vehicles, plate, names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-paper-2 text-ink rounded-lg border border-rule focus-visible:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50"
            />
          </div>

          {/* Barangay Filter */}
          <div>
            {(isBarangayOfficer || currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT') ? (
              <div 
                className="w-full py-1.5 px-2.5 text-xs bg-paper-2 text-ink rounded-lg border border-rule font-medium flex items-center justify-between"
                title={`Jurisdiction locked to Barangay ${currentUser?.barangay || userBarangay || 'San Aquilino'}`}
              >
                <span className="truncate">Brgy. {currentUser?.barangay || userBarangay || 'San Aquilino'}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-paper text-muted rounded border border-rule font-medium">Locked</span>
              </div>
            ) : (
              <select
                value={filterBarangay}
                onChange={(e) => setFilterBarangay(e.target.value)}
                className="w-full py-1.5 px-2 text-xs bg-paper-2 text-ink rounded-lg border border-rule focus-visible:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
              >
                <option value="ALL">All barangays ({ROXAS_BARANGAYS.length})</option>
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
              className="w-full py-1.5 px-2 text-xs bg-paper-2 text-ink rounded-lg border border-rule focus-visible:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden font-medium cursor-pointer disabled:opacity-50"
            >
              <option value="ALL">All crash categories</option>
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
              className="w-full py-1.5 px-2 text-xs bg-paper-2 text-ink rounded-lg border border-rule focus-visible:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
            >
              <option value="ALL">All statuses</option>
              <option value="Unresolved">Unresolved</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Official Involved Filter */}
          <div>
            <select
              value={filterOfficialInvolved}
              onChange={(e) => setFilterOfficialInvolved(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-paper-2 text-ink rounded-lg border border-rule focus-visible:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
            >
              <option value="ALL">All parties</option>
              <option value="YES">Public official involved</option>
              <option value="NO">Standard citizens only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted pt-1">
          <span>Showing <strong className="text-ink font-semibold num">{filteredCases.length}</strong> of <strong className="text-ink font-semibold num">{cases.length}</strong> total records</span>
          {(filterBarangay !== 'ALL' || filterStatus !== 'ALL' || filterCategory !== 'ALL' || filterOfficialInvolved !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterBarangay('ALL');
                setFilterStatus('ALL');
                setFilterCategory('ALL');
                setFilterOfficialInvolved('ALL');
              }}
              className="text-accent hover:underline active:opacity-70 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden text-xs font-semibold whitespace-nowrap"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Case Data List: Dual Responsive Mode (Mobile Card Feed for Phones, Table for Tablets/Laptops) */}
      <section aria-label="Case records list" className="bg-paper rounded-xl border border-rule shadow-xs overflow-hidden">
        
        {/* Mobile View: High-density touch-friendly cards (Phones < 640px) */}
        <div className="sm:hidden divide-y divide-rule">
          {filteredCases.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs px-4">
              No cases match the selected filters or search query.
            </div>
          ) : (
            filteredCases.map((c) => (
              <div
                key={`mobile-${c.id}`}
                onClick={() => setSelectedCaseId(c.id)}
                className="p-4 space-y-2.5 hover:bg-paper-2 active:bg-paper-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-ink bg-paper-2 border border-rule px-2 py-0.5 rounded num">
                      {c.id}
                    </span>
                    <span className="text-xs text-muted num">
                      {formatDateShort(c.dateReported || c.dateCreated || c.incidentDate)}
                    </span>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-ink leading-snug line-clamp-2">
                    {c.title}
                  </h4>
                  <div className="text-xs text-muted mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Brgy. {c.barangay}</span>
                    {c.specificLocation && (
                      <span className="truncate max-w-[160px] text-muted">· {c.specificLocation}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rule">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-paper-2 text-ink border border-rule px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                    {c.isInvolvingOfficial && (
                      <span className="text-[10px] font-semibold bg-error/15 text-error border border-error/30 px-1.5 py-0.5 rounded">
                        Official
                      </span>
                    )}
                    {isConsolidatedCase(c) && (
                      <span className="text-[10px] font-medium bg-paper-2 text-ink border border-rule px-1.5 py-0.5 rounded">
                        Unified
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCaseId(c.id);
                    }}
                    className="text-xs font-semibold text-accent hover:underline active:opacity-70 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted" />
                    <span className="whitespace-nowrap">View docket</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tablet & Desktop View: Central Data Table (Screens >= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-rule">
            <thead className="bg-paper-2 text-muted font-semibold text-xs border-b border-rule">
              <tr>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Incident title</th>
                <th className="py-3 px-3">Barangay</th>
                <th className="py-3 px-3">Persons involved</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Handling agency</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted text-xs">
                    No cases match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-paper-2 transition-colors cursor-pointer"
                    onClick={() => setSelectedCaseId(c.id)}
                  >
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="font-mono font-semibold text-ink num">{c.id}</div>
                      <div className="text-xs text-muted font-normal num">
                        {formatDateShort(c.dateReported || c.dateCreated || c.incidentDate)}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs">
                      <div className="font-semibold text-ink line-clamp-1 flex items-center gap-1.5">
                        <span>{c.title}</span>
                        {isConsolidatedCase(c) && (
                          <span className="text-[10px] font-medium bg-paper-2 text-ink border border-rule px-1 py-0.2 rounded shrink-0">
                            Unified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <span className="bg-paper-2 px-1.5 py-0.5 rounded border border-rule text-[10px]">{c.category}</span>
                        <PriorityBadge priority={c.priority} />
                      </div>
                      {c.isInvolvingOfficial && (
                        <div className="mt-1">
                          <OfficialBadge officialType={c.officialInvolvedType} />
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span className="font-medium text-ink">Brgy. {c.barangay}</span>
                      <div className="text-xs text-muted truncate max-w-[140px]">
                        {c.specificLocation}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs text-xs">
                      <div className="text-ink">
                        <span className="font-semibold text-muted">Complainant:</span>{' '}
                        {c.complainants.map((p) => p.name).join(', ') || 'N/A'}
                      </div>
                      <div className="text-muted mt-0.5">
                        <span className="font-semibold text-muted">Respondent:</span>{' '}
                        {c.respondents.map((p) => p.name).join(', ') || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 align-top text-xs max-w-[160px]">
                      <div className="font-medium text-ink truncate">
                        {c.isRemainedAtBarangay ? `Barangay ${c.barangay}` : c.currentHandlingAgency}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {c.assignedPersonnel || 'Unassigned'}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top text-xs max-w-xs">
                      {c.status === 'Resolved' || (c.status as string) === 'Closed' ? (
                        <div className="text-success font-medium">
                          {c.outcomeType || 'Resolved'}
                        </div>
                      ) : (
                        <span className="text-muted text-xs">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseId(c.id);
                        }}
                        className="px-2.5 py-1 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted" />
                        <span className="whitespace-nowrap">Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
