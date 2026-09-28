import React from 'react';
import {
  ShieldAlert,
  FileCheck,
  Clock,
  ArrowUpRight,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Siren,
  Ambulance,
  Activity,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { formatDateShort } from '../../utils/reportGenerators';
import { sendAutomatedResponderSMS, startSmsResendInterval } from '../../utils/smsService';

export const MdrrmoDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { cases, setSelectedCaseId } = useCases();
  const { triggerNotification } = useNotifications();
  const { setIsNewCaseModalOpen, setActiveTab } = useUI();

  const currentBarangay = currentUser.barangay;

  // MDRRMO monitors all incidents municipal-wide or targeted to a specific barangay if assigned
  const mdrrmoCases = currentBarangay
    ? cases.filter((c) => c.barangay === currentBarangay || c.originatingAgency.includes(currentBarangay))
    : cases;

  const totalIncidents = mdrrmoCases.length;
  const resolvedCount = mdrrmoCases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const pendingCount = mdrrmoCases.filter((c) => c.isPending || c.status === 'Pending').length;
  const accidentCases = mdrrmoCases.filter((c) => c.isAccidentEmergency || c.category === 'Traffic / Vehicular Incident' || c.vehicleDetails?.length);
  const ambulanceDispatches = mdrrmoCases.filter((c) => c.respondingAmbulanceUnit && c.respondingAmbulanceUnit !== 'None');
  const urgentCrashes = mdrrmoCases.filter((c) => c.priority === 'Urgent' || c.priority === 'High');

  const handleTestAccidentAlarm = () => {
    const testCaseId = `INC-EMG-${Date.now().toString().slice(-4)}`;

    const payload = {
      id: testCaseId,
      title: 'Severe Vehicular Collision at Morente Avenue Crossing',
      incidentType: 'Motorcycle vs Tricycle Collision',
      location: `Morente Ave. cor. Strong Republic Nautical Hwy, Brgy. ${currentBarangay || 'San Aquilino'}`,
      category: 'Motorcycle vs Tricycle Collision',
      barangay: currentBarangay || 'San Aquilino',
      sitio: 'Sitio Centro',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      reporterName: currentUser.name || 'Resident Citizen',
      priority: 'URGENT'
    };

    // Automatically generate and dispatch SMS alert to MDRRMO account & start interval resend
    sendAutomatedResponderSMS(payload, users);
    startSmsResendInterval(payload, users, 30000);

    triggerNotification(
      `🚨 EMERGENCY ALERT: Vehicular Collision in Roxas`,
      `SIMULATED CRASH DISPATCH: Motorcycle vs Tricycle severe collision logged. Automated SMS broadcast dispatched to MDRRMO account. Re-sending at regular intervals until Marked as Seen/Responded (SMS text only)!`,
      'pending_alert',
      testCaseId,
      'MDRRMO',
      'urgent',
      {
        targetAgencyTypes: ['MDRRMO'],
        targetBarangay: currentBarangay || 'San Aquilino',
        isAccidentEmergency: true,
        isMdrrmoEmergency: true
      }
    );
  };

  const isOfficer = currentUser.role === 'MDRRMO_OFFICER';

  return (
    <div id="mdrrmo-dashboard-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-orange-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-800/80 text-orange-200 text-xs font-bold border border-orange-700/50">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              <span>MDRRMO Roxas • Emergency Medical & Rescue Operations</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-700/60 text-orange-200 text-[10px] font-mono font-bold border border-orange-600/40">
              POV: {isOfficer ? 'Responder & Field Triage' : 'Operations Head & Dispatch Chief'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isOfficer ? 'MDRRMO Incident Response & Triage Operations' : 'MDRRMO Disaster Risk & Emergency Incident Operations'}
          </h2>
          <p className="text-xs text-orange-100/90 mt-1 max-w-2xl leading-relaxed">
            Real-time emergency dispatch coordination, road traffic crash triage, rescue ambulance mobilization, and inter-barangay public safety network in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            id="btn-mdrrmo-test-alarm"
            onClick={handleTestAccidentAlarm}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-2 cursor-pointer ring-2 ring-rose-400/50 active:scale-95"
            title="Simulate incoming accident report to test automated SMS broadcast and dispatch popup"
          >
            <Siren className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>🚨 Test SMS Alert</span>
          </button>
          <button
            id="btn-mdrrmo-new-case"
            onClick={() => setIsNewCaseModalOpen(true)}
            className="px-4 py-2.5 bg-white text-orange-950 hover:bg-orange-50 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>Log Emergency / Incident</span>
          </button>
          <button
            id="btn-mdrrmo-view-annual"
            onClick={() => setActiveTab('annual_narrative')}
            className="px-3.5 py-2.5 bg-orange-950/60 hover:bg-orange-900 text-orange-100 border border-orange-700/60 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Incident Logs</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Total Logged</p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">{totalIncidents}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-semibold">
            <span>All Incidents</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Vehicular Crashes</p>
          <h3 className="text-3xl font-black mt-1 text-amber-600">{accidentCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-semibold">
            <span>Road Incidents</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Ambulance Trips</p>
          <h3 className="text-3xl font-black mt-1 text-rose-600">{ambulanceDispatches.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-rose-600 font-semibold">
            <span>Rescue Dispatched</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Active Investigations</p>
          <h3 className="text-3xl font-black mt-1 text-sky-600">{pendingCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-sky-600 font-semibold">
            <span>Ongoing Triage</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Resolved / Cleared</p>
          <h3 className="text-3xl font-black mt-1 text-emerald-600">{resolvedCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-semibold">
            <span>Closed Cases</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Urgent Severity</p>
          <h3 className="text-3xl font-black mt-1 text-red-600">{urgentCrashes.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-red-600 font-semibold">
            <span>High Risk / Trauma</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Incident & Dispatch Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Active Incident Stream & Dispatch Queue
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('cases')}
            className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Cases</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Location (Barangay)</th>
                <th className="py-3 px-4">Responding Unit</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mdrrmoCases.slice(0, 8).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="hover:bg-orange-50/40 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-orange-950">{c.caseNumber || c.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{c.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      Brgy. {c.barangay}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-700">
                      {c.respondingAmbulanceUnit || c.assignedPersonnel || 'MDRRMO Operations'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {formatDateShort(c.createdAt)}
                  </td>
                </tr>
              ))}
              {mdrrmoCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No active incident records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Also export as BarangayDashboard for backwards compatibility
export const BarangayDashboard = MdrrmoDashboard;
