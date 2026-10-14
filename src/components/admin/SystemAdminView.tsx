import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Shield, 
  Landmark, 
  CheckCircle2, 
  Users, 
  Database, 
  RotateCcw, 
  Download, 
  Server,
  Key,
  UserPlus,
  UserCheck,
  Trash2,
  Edit3,
  Clock,
  PhoneCall,
  AlertTriangle,
  Siren,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { AGENCIES_LIST, ROXAS_BARANGAYS, Case } from '../../types';
import { 
  getEscalationConfig, 
  saveEscalationConfig, 
  EscalationConfig 
} from '../../utils/escalationService';

export const SystemAdminView: React.FC = () => {
  const { users, currentUser, setCurrentUser, resetToDefaults, deleteUser, clearAllUsers } = useAuth();
  const { cases, auditLogs, escalateIncidentToLgu, createCase } = useCases();
  const { setIsCreateAccountModalOpen, openEditAccountModal } = useUI();

  const [escalationConfig, setEscalationConfigState] = useState<EscalationConfig>(() => getEscalationConfig());
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSaveEscalationConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEscalationConfig(escalationConfig);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  const handleSimulateEscalation = async () => {
    setIsSimulating(true);
    setSimulationNotice(null);
    try {
      const testCaseId = `INC-ESC-${Date.now().toString().slice(-4)}`;
      const testCaseData: Partial<Case> & Record<string, any> = {
        id: testCaseId,
        title: 'Severe Multi-Vehicle Collision at Strong Republic Nautical Hwy',
        category: 'Motorcycle vs Tricycle Collision' as any,
        barangay: 'San Aquilino',
        specificLocation: 'Morente Ave. cor. Nautical Highway, Brgy. San Aquilino',
        description: 'Severe collision between motorcycle and tricycle with injuries reported. Unattended and unacknowledged within response threshold.',
        priority: 'Urgent',
        isAccidentEmergency: true,
        isCitizenReport: true,
        status: 'Unresolved',
        emergencyAlarmAcknowledged: false,
        reporterName: 'Resident Citizen (via Portal)',
        reporterContact: '0917-555-9123',
        dateReported: new Date(Date.now() - (escalationConfig.thresholdMinutes * 60 * 1000 + 300000)).toISOString(),
        dateCreated: new Date(Date.now() - (escalationConfig.thresholdMinutes * 60 * 1000 + 300000)).toISOString()
      };

      await escalateIncidentToLgu(
        testCaseId, 
        `${(escalationConfig.thresholdMinutes / 60).toFixed(1)} hours (Simulation Trigger)`,
        `Automated Simulation: Response deadline of ${escalationConfig.thresholdMinutes} minutes reached without MDRRMO acknowledgment. Escalated to LGU with automated SMS dispatch.`,
        testCaseData
      );

      setSimulationNotice(`🚨 Escalation Triggered! Incident #${testCaseId} has been escalated to LGU. SMS dispatched to ${escalationConfig.designatedLguName} (${escalationConfig.designatedLguPhone}). Check the LGU Executive Dashboard.`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportFullJson = () => {
    const fullBackup = {
      system: 'B-CONNECT Roxas Oriental Mindoro',
      exportDate: new Date().toISOString(),
      cases,
      auditLogs,
      users
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `B-CONNECT_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="system-admin-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold mb-2">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Master Governance Node & Agency Control</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            System Administration & Inter-Agency Node Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Managing agency access credentials, 5 barangay master registries, graph relationship engine configs, and data retention policies for Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-admin-create-account-top"
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
          <button
            onClick={handleExportFullJson}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export System JSON Backup
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the default seed state?')) {
                resetToDefaults();
              }
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* MDRRMO to LGU Automatic Escalation Policy & Threshold Configuration */}
      <div id="escalation-policy-config-card" className="bg-white rounded-xl border-2 border-emerald-500/80 shadow-md p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-200">
              <Clock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Automatic Incident Escalation Policy (MDRRMO ➔ LGU)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Active Statutory Daemon
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Monitors all emergency reports submitted to MDRRMO. If MDRRMO does not acknowledge, respond to, or update the report within the configured deadline, the system automatically escalates the case to the LGU Executive Office and dispatches an automated SMS alert to designated LGU officials.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulateEscalation}
            className="self-start sm:self-auto px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
            title="Simulate MDRRMO response deadline timeout and trigger immediate auto-escalation to LGU"
          >
            <Siren className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Timeout & Escalate'}</span>
          </button>
        </div>

        {simulationNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{simulationNotice}</span>
            </div>
            <button 
              type="button"
              onClick={() => setSimulationNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSaveEscalationConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Configurable Response Threshold */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                MDRRMO Response Deadline Threshold *
              </label>
              <select
                value={escalationConfig.thresholdMinutes}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, thresholdMinutes: Number(e.target.value) }))}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={1}>⚡ 1 Minute (Live Testing & Quick Demo Mode)</option>
                <option value={5}>⏱️ 5 Minutes (Fast Verification Mode)</option>
                <option value={60}>⏱️ 1 Hour (60 minutes)</option>
                <option value={120}>⏱️ 2 Hours (120 minutes) — Standard Default</option>
                <option value={150}>⏱️ 2.5 Hours (150 minutes)</option>
                <option value={180}>⏱️ 3 Hours (180 minutes) — Maximum Window</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {escalationConfig.thresholdMinutes <= 5 
                  ? '⚡ Test mode selected: ideal for demonstrating escalation immediately.'
                  : 'Statutory 2–3 hour window for MDRRMO emergency triage response.'}
              </span>
            </div>

            {/* 2. Designated LGU Official Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Designated LGU Official Recipient *
              </label>
              <input
                type="text"
                required
                value={escalationConfig.designatedLguName}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, designatedLguName: e.target.value }))}
                placeholder="e.g. Atty. Clarissa Reyes"
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Official authorized to receive escalation notifications.</span>
            </div>

            {/* 3. Designated LGU Official Role */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Official Designation / Title *
              </label>
              <input
                type="text"
                required
                value={escalationConfig.designatedLguRole}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, designatedLguRole: e.target.value }))}
                placeholder="e.g. Municipal Administrator"
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Municipal governance position.</span>
            </div>

            {/* 4. Designated Official SMS Phone */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Designated SMS Alert Number *</span>
              </label>
              <input
                type="tel"
                required
                value={escalationConfig.designatedLguPhone}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, designatedLguPhone: e.target.value }))}
                placeholder="e.g. 0920-988-4411"
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Receives automated carrier SMS on deadline breach.</span>
            </div>
          </div>

          {/* SMS Broadcast Format Preview Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Standard Carrier SMS Payload Preview:
            </span>
            <p className="font-mono text-[11px] text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed select-all">
              URGENT ALERT: Incident #[ID] reported at [LOCATION] has not received a response or acknowledgment from the MDRRMO for more than {(escalationConfig.thresholdMinutes / 60).toFixed(1)} hours. LGU intervention is required. Please review the incident and take the appropriate action immediately. [Details: Type: [EMERGENCY] | Date/Time: [TIMESTAMP] | Current Status: Escalated to LGU | Recommended Action: LGU intervention/review required]
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={escalationConfig.enabled}
                  onChange={(e) => setEscalationConfigState(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Enable Automated MDRRMO-to-LGU Escalation & SMS Broadcasts</span>
              </label>
              {isSavedNotice && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Policy Saved!
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Escalation Policy</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4 Connected Agencies Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Integrated Government Agencies (Roxas, Oriental Mindoro)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENCIES_LIST.map((ag) => (
            <div key={ag.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{ag.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500">{ag.description}</p>
              <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 flex justify-between">
                <span>Scope: <strong>{ag.jurisdictionScope}</strong></span>
                <span className="text-emerald-700 font-bold">Live Gateway</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered User Accounts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Authorized Multi-Agency Personnel & Officer Accounts ({(users || []).length} Active)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-based access credentials mapped to Philippine public safety and local governance statutes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {users && users.length > 0 && (
              <button
                id="btn-admin-clear-all-users"
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete ALL existing accounts? You can register your new officer accounts right after.')) {
                    clearAllUsers();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All Accounts</span>
              </button>
            )}

            <button
              id="btn-admin-create-account"
              onClick={() => setIsCreateAccountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Officer Account</span>
            </button>
          </div>
        </div>

        {(!users || users.length === 0) ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No Registered Accounts</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All previous accounts have been deleted. You can create new officer accounts now or restore defaults.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsCreateAccountModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Account</span>
              </button>
              <button
                onClick={() => resetToDefaults()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Seed Accounts</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Official Name</th>
                  <th className="py-2.5 px-3">Position / Designation</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3">Role Tier</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(users || []).map((u) => {
                  const isActive = currentUser && u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition ${isActive ? 'bg-blue-50/50' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{u.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {(u.name || 'U').charAt(0)}
                        </div>
                        <span>{u.name || 'Unnamed User'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{u.position}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="font-medium text-slate-800">{u.agencyName}</span>
                        {u.barangay && <span className="text-[10px] text-sky-700 block font-semibold">Brgy. {u.barangay}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-purple-800">{u.role}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Logged In
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5">
                              Offline
                            </span>
                          )}
                          <button
                            id={`btn-admin-edit-${u.id}`}
                            title={`Rename / Edit account of ${u.name}`}
                            onClick={() => openEditAccountModal(u)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-admin-delete-${u.id}`}
                            title={`Delete account of ${u.name}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete account: ${u.name} (${u.position})?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5 Barangays Master List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-sky-700" />
          Master Barangay Registry (5 Barangays of Roxas, Oriental Mindoro)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ROXAS_BARANGAYS.map((b) => (
            <div key={b} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-800 block truncate">Barangay {b}</span>
              <span className="text-[10px] text-emerald-600 font-medium">● Unit Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

