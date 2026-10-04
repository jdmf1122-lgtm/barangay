import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Download, 
  Printer, 
  Building2, 
  Shield, 
  Landmark, 
  CheckCircle2, 
  FileText, 
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { generateAnnualStatistics, exportToCsv, formatDateShort } from '../../utils/reportGenerators';
import { StatusBadge } from '../common/StatusBadge';

export const AnnualNarrativeReport: React.FC = () => {
  const { cases, setSelectedCaseId } = useCases();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('ALL');

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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-200 text-xs font-semibold mb-2">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>End-of-Year Statutory Documentation</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Comprehensive Incident & Case Narrative Report ({selectedYear})
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Formal narrative summary of public safety incidents, Katarungang Pambarangay settlements, and inter-agency referrals for Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportSummaryCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Summary CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Official Report
          </button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Calendar Year:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-bold text-slate-800 text-xs"
          >
            <option value={2026}>CY 2026 (Current Active Period)</option>
            <option value={2025}>CY 2025 (Historical Archive)</option>
            <option value={2024}>CY 2024 (Historical Archive)</option>
          </select>
        </div>

        <span className="text-slate-500 text-[11px]">
          Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
        </span>
      </div>

      {/* Official Printable Report Document Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-slate-900 max-w-4xl mx-auto">
        {/* Formal Republic Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Republic of the Philippines
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Province of Oriental Mindoro
          </div>
          <div className="text-sm font-black uppercase tracking-wider text-slate-900">
            Municipality of Roxas
          </div>
          <div className="pt-2 text-xs font-bold uppercase tracking-widest text-blue-900">
            B-CONNECT Multi-Agency Coordination & Transparency System
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold uppercase text-slate-950 pt-1 tracking-tight">
            NARRATIVE REPORT ON INCIDENTS, COMPLAINTS & CASE RESOLUTIONS
          </h1>
          <div className="text-xs font-semibold text-slate-600">
            For the Calendar Year Ended December 31, {selectedYear}
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            I. EXECUTIVE SUMMARY & KEY STATISTICAL HIGHLIGHTS
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            During the calendar year {selectedYear}, the Municipality of Roxas recorded a total of{' '}
            <strong>
              {stats.totalCases > 0
                ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100)
                : 0}%
            </strong>.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Logged</span>
              <span className="text-xl font-extrabold text-slate-900">{stats.totalCases}</span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Settled</span>
              <span className="text-xl font-extrabold text-emerald-800">
                {stats.totalResolvedCases}
              </span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Ongoing Cases</span>
              <span className="text-xl font-extrabold text-amber-800">{stats.totalOngoingCases}</span>
            </div>
            <div className="bg-purple-50 p-2.5 rounded border border-purple-200 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">Avg Duration</span>
              <span className="text-xl font-extrabold text-purple-800">{stats.averageResolutionDays} Days</span>
            </div>
          </div>
        </div>

        {/* Section 2: Narrative Log of Primary Cases */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            II. NARRATIVE DOCKET OF SELECTED CASES & SYSTEMIC OUTCOMES
          </h3>

          <div className="divide-y divide-slate-200">
            {filteredCases.slice(0, 8).map((c) => (
              <div key={c.id} className="py-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-blue-900 font-mono">
                    {c.id} • {c.title}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500">
                  Brgy. {c.barangay} • Handled by: {c.currentHandlingAgency} • Reported: {formatDateShort(c.dateReported)}
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {c.initialNarrative}
                </p>
                {c.outcomeType && (
                  <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50/60 p-1.5 rounded">
                    <strong>Final Action / Outcome:</strong> {c.outcomeType}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Official Signatories */}
        <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs text-center">
          <div className="space-y-6">
            <div>Prepared & Verified by:</div>
            <div>
              <div className="font-bold uppercase text-slate-900">HON. MARIA SANTOS</div>
              <div className="text-[11px] text-slate-600">President, Liga ng mga Barangay - Roxas</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>Reviewed & Monitored by:</div>
            <div>
              <div className="font-bold uppercase text-slate-900">DIR. EDUARDO DEL ROSARIO, DPA</div>
              <div className="text-[11px] text-slate-600">Municipal Local Government Operations Officer (MLGOO)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
