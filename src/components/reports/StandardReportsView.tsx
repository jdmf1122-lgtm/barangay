import React, { useState } from 'react';
import { 
  Layers, 
  Download, 
  Printer
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { exportToCsv, formatDateShort } from '../../utils/reportGenerators';
import { StatusBadge } from '../common/StatusBadge';
import { ROXAS_BARANGAYS } from '../../types';

export const StandardReportsView: React.FC = () => {
  const { cases, setSelectedCaseId } = useCases();
  const [reportType, setReportType] = useState<'DAILY' | 'MONTHLY' | 'QUARTERLY_KP' | 'LGU_LOG'>('DAILY');

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'DAILY') {
      headers = ['Case ID', 'Date Reported', 'Barangay', 'Title', 'Category', 'Status', 'Complainant', 'Respondent'];
      rows = cases.map((c) => [
        c.id,
        c.dateReported,
        c.barangay,
        c.title,
        c.category,
        c.status,
        c.complainants.map((p) => p.name).join(', '),
        c.respondents.map((p) => p.name).join(', ')
      ]);
    } else {
      headers = ['Barangay', 'Total Cases', 'Resolved', 'Pending', 'LGU Referred'];
      rows = ROXAS_BARANGAYS.map((bgy) => {
        const bCases = cases.filter((c) => c.barangay === bgy);
        return [
          `Brgy. ${bgy}`,
          bCases.length,
          bCases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
          bCases.filter((c) => c.isPending || c.status === 'Pending').length,
          bCases.filter((c) => c.isReferredToLgu).length
        ];
      });
    }

    exportToCsv(`B-CONNECT_Standard_Report_${reportType}_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div id="standard-reports-view" className="space-y-4">
      {/* Header */}
      <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            Standard Governance & Operational Reports
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Routine administrative summaries for desk officers, Liga ng mga Barangay, and Mayor’s Office.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-paper-2 hover:bg-paper-3 text-ink rounded-lg text-xs font-semibold border border-rule transition-colors active:scale-[0.98] flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            Export Selected CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-accent hover:opacity-90 active:scale-[0.98] text-accent-ink rounded-lg text-xs font-bold shadow-xs transition-opacity flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="bg-paper p-2.5 rounded-xl border border-rule shadow-xs flex flex-wrap gap-2 text-xs font-semibold">
        {[
          { id: 'DAILY', label: 'Daily incident report' },
          { id: 'QUARTERLY_KP', label: 'Quarterly barangay justice compliance' },
          { id: 'MONTHLY', label: `Monthly ${ROXAS_BARANGAYS.length}-barangay comparative summary` }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setReportType(t.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed ${
              reportType === t.id
                ? 'bg-accent text-accent-ink font-bold shadow-xs'
                : 'bg-paper-2 text-muted hover:text-ink hover:bg-paper-3'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Report Table Display */}
      <div className="bg-paper rounded-xl border border-rule shadow-xs p-5 space-y-4">
        {reportType === 'DAILY' && (
          <div>
            <h3 className="font-bold text-sm text-ink mb-1">Daily master incident report</h3>
            <p className="text-xs text-muted mb-3">All records logged in sequence across Roxas</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-rule">
                <thead className="bg-paper-2 text-muted text-xs font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Title / Subject</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {cases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className="hover:bg-paper-2 transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-3 font-mono font-bold text-accent">{c.id}</td>
                      <td className="py-2 px-3 text-muted tabular-nums">{formatDateShort(c.dateReported)}</td>
                      <td className="py-2 px-3 font-medium text-ink">Brgy. {c.barangay}</td>
                      <td className="py-2 px-3 font-medium text-ink">{c.title}</td>
                      <td className="py-2 px-3 text-muted">{c.category}</td>
                      <td className="py-2 px-3"><StatusBadge status={c.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'QUARTERLY_KP' && (
          <div>
            <h3 className="font-bold text-sm text-ink mb-1">
              Quarterly barangay justice performance matrix (RA 7160)
            </h3>
            <p className="text-xs text-muted mb-3">Conciliation and mediation output across all {ROXAS_BARANGAYS.length} Barangays</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-rule">
                <thead className="bg-paper-2 text-muted text-xs font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Total disputes</th>
                    <th className="py-2.5 px-3">Amicably settled</th>
                    <th className="py-2.5 px-3">Pending Lupon</th>
                    <th className="py-2.5 px-3">Settlement rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {ROXAS_BARANGAYS.map((bgy) => {
                    const bCases = cases.filter((c) => c.barangay === bgy);
                    const settled = bCases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
                    const pending = bCases.filter((c) => c.isPending || c.status === 'Pending').length;
                    const rate = bCases.length > 0 ? Math.round((settled / bCases.length) * 100) : 0;

                    return (
                      <tr key={bgy} className="hover:bg-paper-2 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-ink">Brgy. {bgy}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-ink">{bCases.length}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-accent font-bold">{settled}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-muted">{pending}</td>
                        <td className="py-2.5 px-3 font-bold tabular-nums text-ink">
                          {bCases.length > 0 ? `${rate}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'MONTHLY' && (
          <div>
            <h3 className="font-bold text-sm text-ink mb-1">
              Monthly {ROXAS_BARANGAYS.length}-barangay incident distribution
            </h3>
            <p className="text-xs text-muted mb-3">Cross-barangay incident metrics for executive planning</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROXAS_BARANGAYS.map((bgy) => {
                const bCount = cases.filter((c) => c.barangay === bgy).length;
                return (
                  <div key={bgy} className="p-3 bg-paper-2 rounded-lg border border-rule">
                    <span className="font-bold text-xs text-ink block">Brgy. {bgy}</span>
                    <span className="text-xl font-bold tabular-nums text-accent mt-1 block">{bCount}</span>
                    <span className="text-xs text-muted">Total recorded reports</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
