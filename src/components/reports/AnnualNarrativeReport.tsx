import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Download, 
  Printer, 
  Calendar
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { useAuth } from '../../hooks/useAuth';
import { generateAnnualStatistics, exportToCsv, formatDateShort } from '../../utils/reportGenerators';
import { StatusBadge } from '../common/StatusBadge';

export const AnnualNarrativeReport: React.FC = () => {
  const { cases } = useCases();
  const { currentUser } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedBarangay] = useState<string>('ALL');

  const isMdrrmo = currentUser?.agencyType === 'MDRRMO';
  const safeCases = cases || [];
  const stats = generateAnnualStatistics(safeCases, selectedYear);

  const filteredCases = safeCases.filter((c) => {
    if (!c) return false;
    const dateStr = c.dateReported || c.dateCreated;
    if (!dateStr) return false;
    const yr = new Date(dateStr).getFullYear();
    if (yr !== selectedYear) return false;
    if (selectedBarangay !== 'ALL' && c.barangay !== selectedBarangay) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCsv = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Reporting Year', selectedYear],
      ['Total Incidents / Complaints Logged', stats.totalCases],
      ['Resolved / Amicably Settled Cases', stats.totalResolvedCases],
      ['Ongoing / Unresolved Cases', stats.totalOngoingCases],
      ['Average Resolution Days', stats.averageResolutionDays],
      ['Complaints Involving Officials', stats.casesInvolvingOfficials]
    ];
    exportToCsv(`B-CONNECT_Case_Narrative_Summary_${selectedYear}`, headers, rows);
  };

  return (
    <div id="annual-narrative-report-view" className="space-y-4">
      {/* Top Banner with Official Agency Seal */}
      <section
        aria-label="Annual narrative report header"
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
                <BookOpenCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{isMdrrmo ? 'MDRRMO statutory emergency & incident documentation' : 'End-of-year statutory documentation'}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-ink tracking-tight leading-tight">
              {isMdrrmo ? 'Comprehensive incident & dispatch narrative report' : 'Comprehensive incident & case narrative report'} ({selectedYear})
            </h2>
            <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
              {isMdrrmo
                ? 'Formal narrative summary of emergency dispatch operations, road traffic collisions, and public safety responses for Roxas, Oriental Mindoro.'
                : 'Formal narrative summary of public safety incidents, Katarungang Pambarangay settlements, and inter-agency referrals for Roxas, Oriental Mindoro.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="px-3.5 py-2 bg-paper-2 hover:bg-paper-3 text-ink rounded-lg text-xs font-semibold border border-rule transition-colors active:scale-[0.98] flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>Export summary CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-accent text-accent-ink hover:opacity-90 rounded-lg text-xs font-bold shadow-xs transition-opacity active:scale-[0.98] flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>Print official report</span>
          </button>
        </div>
      </section>

      {/* Filter Selector */}
      <div className="bg-paper p-3.5 rounded-xl border border-rule shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-ink">
            <Calendar className="w-4 h-4 text-accent" />
            <span>Calendar year:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-1.5 bg-paper-2 rounded-lg border border-rule font-medium text-ink text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value={2026}>CY 2026 (Current active period)</option>
            <option value={2025}>CY 2025 (Historical archive)</option>
            <option value={2024}>CY 2024 (Historical archive)</option>
          </select>
        </div>

        <span className="text-muted text-xs tabular-nums">
          Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
        </span>
      </div>

      {/* Official Printable Report Document Card */}
      <article className="bg-paper rounded-xl border border-rule shadow-xs p-6 sm:p-8 space-y-6 text-ink max-w-4xl mx-auto">
        {/* Formal Republic Header */}
        <div className="text-center pb-6 border-b border-rule space-y-1">
          <div className="text-xs font-medium text-muted">
            Republic of the Philippines
          </div>
          <div className="text-xs font-medium text-muted">
            Province of Oriental Mindoro
          </div>
          <div className="text-sm font-bold text-ink">
            Municipality of Roxas
          </div>
          <div className="pt-2 text-xs font-semibold text-accent">
            B-CONNECT Multi-Agency Coordination & Transparency System
          </div>
          <h1 className="text-base sm:text-lg font-bold text-ink pt-1 tracking-tight">
            Narrative report on incidents, complaints, and case resolutions
          </h1>
          <div className="text-xs text-muted">
            For the calendar year ended December 31, {selectedYear}
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section aria-label="Executive summary" className="space-y-3">
          <h3 className="text-xs font-bold text-ink border-b border-rule pb-1.5">
            1. Executive summary and key statistical highlights
          </h3>
          <p className="text-xs text-ink leading-relaxed">
            During the calendar year {selectedYear}, the Municipality of Roxas recorded a total resolution rate of{' '}
            <strong className="tabular-nums">
              {stats.totalCases > 0
                ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100)
                : 0}%
            </strong> across all logged public safety and katarungang pambarangay dockets.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="bg-paper-2 p-3 rounded-lg border border-rule text-center">
              <span className="text-xs text-muted font-medium block">Total logged</span>
              <span className="text-xl font-bold tabular-nums text-ink">{stats.totalCases}</span>
            </div>
            <div className="bg-paper-2 p-3 rounded-lg border border-rule text-center">
              <span className="text-xs text-muted font-medium block">Settled cases</span>
              <span className="text-xl font-bold tabular-nums text-accent">
                {stats.totalResolvedCases}
              </span>
            </div>
            <div className="bg-paper-2 p-3 rounded-lg border border-rule text-center">
              <span className="text-xs text-muted font-medium block">Ongoing cases</span>
              <span className="text-xl font-bold tabular-nums text-ink">{stats.totalOngoingCases}</span>
            </div>
            <div className="bg-paper-2 p-3 rounded-lg border border-rule text-center">
              <span className="text-xs text-muted font-medium block">Average duration</span>
              <span className="text-xl font-bold tabular-nums text-ink">{stats.averageResolutionDays} days</span>
            </div>
          </div>
        </section>

        {/* Section 2: Narrative Log of Primary Cases */}
        <section aria-label="Narrative docket" className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-ink border-b border-rule pb-1.5">
            2. Narrative docket of selected cases and systemic outcomes
          </h3>

          <div className="divide-y divide-rule">
            {filteredCases.slice(0, 8).map((c) => (
              <div key={c.id} className="py-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent tabular-nums">{c.id}</span>
                    <span className="font-semibold text-ink">{c.title}</span>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <div className="text-xs text-muted flex flex-wrap items-center gap-2">
                  <span className="pr-2 border-r border-rule">Brgy. {c.barangay}</span>
                  <span className="pr-2 border-r border-rule">Agency: {c.currentHandlingAgency}</span>
                  <span className="tabular-nums">Reported: {formatDateShort(c.dateReported)}</span>
                </div>
                <p className="text-ink text-xs leading-relaxed">
                  {c.initialNarrative}
                </p>
                {c.outcomeType && (
                  <div className="text-xs text-ink bg-paper-2 p-2 rounded-lg border border-rule">
                    <span className="font-semibold">Final action / outcome:</span> {c.outcomeType}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Official Signatories */}
        <section aria-label="Official signatories" className="pt-8 border-t border-rule grid grid-cols-2 gap-8 text-xs text-center">
          <div className="space-y-4">
            <div className="font-medium text-muted">Prepared and verified by:</div>
            <div>
              <div className="font-bold text-sm text-ink">MDRRMO Operations</div>
              <div className="text-xs text-muted">Municipal Disaster Risk Reduction & Management Office</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-medium text-muted">Reviewed and monitored by:</div>
            <div>
              <div className="font-bold text-sm text-ink">LGU Municipal Administrator</div>
              <div className="text-xs text-muted">Municipality of Roxas, Oriental Mindoro</div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};
