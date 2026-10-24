import React, { useState } from 'react';
import { 
  Layers, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  Shield, 
  Landmark, 
  CheckCircle,
  FileSpreadsheet
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-700" />
            Standard Governance & Operational Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Routine administrative summaries for desk officers, Liga ng mga Barangay, and Mayor's Office.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Selected CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-semibold">
        {[
          { id: 'DAILY', label: 'Daily Incident Blotter Report' },
          { id: 'QUARTERLY_KP', label: 'Quarterly Katarungang Pambarangay Compliance' },
          { id: 'MONTHLY', label: 'Monthly 16-Barangay Comparative Summary' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id as any)}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              reportType === t.id
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Report Table Display */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        {reportType === 'DAILY' && (
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Daily Master Incident Blotter</h3>
            <p className="text-xs text-slate-500 mb-3">All records logged in sequence across Roxas</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Title / Subject</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{c.id}</td>
                      <td className="py-2 px-3 text-slate-500">{formatDateShort(c.dateReported)}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">Brgy. {c.barangay}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{c.title}</td>
                      <td className="py-2 px-3 text-slate-600">{c.category}</td>
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
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Quarterly Katarungang Pambarangay Performance Matrix (RA 7160)
            </h3>
            <p className="text-xs text-slate-500 mb-3">Conciliation and mediation output across all {ROXAS_BARANGAYS.length} Barangays</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Total Disputes</th>
                    <th className="py-2.5 px-3">Amicably Settled</th>
                    <th className="py-2.5 px-3">Pending Lupon</th>
                    <th className="py-2.5 px-3">Settlement Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROXAS_BARANGAYS.map((bgy) => {
                    const bCases = cases.filter((c) => c.barangay === bgy);
                    const settled = bCases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
                    const pending = bCases.filter((c) => c.isPending || c.status === 'Pending').length;
                    const rate = bCases.length > 0 ? Math.round((settled / bCases.length) * 100) : 0;

                    return (
                      <tr key={bgy} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">Brgy. {bgy}</td>
                        <td className="py-2.5 px-3 font-mono">{bCases.length}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{settled}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-700">{pending}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-800">
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
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Monthly 16-Barangay Incident Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-3">Cross-barangay incident metrics for executive planning</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROXAS_BARANGAYS.map((bgy) => {
                const bCount = cases.filter((c) => c.barangay === bgy).length;
                return (
                  <div key={bgy} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-xs text-slate-800 block">Brgy. {bgy}</span>
                    <span className="text-xl font-black text-blue-800 mt-1 block">{bCount}</span>
                    <span className="text-[10px] text-slate-400">Total recorded reports</span>
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
