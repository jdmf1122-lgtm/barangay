import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  RotateCcw, 
  Download, 
  Server,
  UserPlus,
  Trash2,
  Edit3,
  Clock,
  PhoneCall,
  Siren,
  CheckCircle
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
  const { users, currentUser, resetToDefaults, deleteUser, clearAllUsers } = useAuth();
  const { cases, auditLogs, escalateIncidentToLgu } = useCases();
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

      setSimulationNotice(`Escalation triggered: Incident #${testCaseId} has been escalated to LGU. SMS dispatched to ${escalationConfig.designatedLguName} (${escalationConfig.designatedLguPhone}). Check the LGU Executive Dashboard.`);
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

  const isMdrrmo = currentUser?.agencyType === 'MDRRMO';

  return (
    <div id="system-admin-view" className="space-y-6">
      {/* Top Banner with Official Agency Seal */}
      <section
        aria-label="System administration header"
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
                <Server className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Master governance node & agency control</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-ink tracking-tight leading-tight">
              System Administration & Inter-Agency Node Configuration
            </h2>
            <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
              Managing agency access credentials, 20 barangay master registries, graph relationship engine configs, and data retention policies for Roxas, Oriental Mindoro.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            type="button"
            id="btn-admin-create-account-top"
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="px-3.5 py-2 bg-accent text-accent-ink hover:opacity-90 active:scale-[0.98] transition-opacity rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            onClick={handleExportFullJson}
            className="px-3 py-2 bg-paper-2 hover:bg-paper-3 text-ink border border-rule rounded-lg text-xs font-semibold transition-colors active:scale-[0.98] flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span className="whitespace-nowrap">Export JSON backup</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the default seed state?')) {
                resetToDefaults();
              }
            }}
            className="px-3 py-2 bg-paper-2 hover:bg-paper-3 text-error border border-rule rounded-lg text-xs font-semibold transition-colors active:scale-[0.98] flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seed Data</span>
          </button>
        </div>
      </section>

      {/* MDRRMO to LGU Automatic Escalation Policy & Threshold Configuration */}
      <section id="escalation-policy-config-card" aria-label="Escalation policy configuration" className="bg-paper rounded-xl border border-rule shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-paper-2 rounded-xl text-accent border border-rule">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-ink">
                  Automatic incident escalation policy (MDRRMO to LGU)
                </h3>
                <span className="text-xs font-medium text-accent bg-paper-2 px-2.5 py-0.5 rounded-full border border-rule">
                  Active statutory daemon
                </span>
              </div>
              <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                Monitors all emergency reports submitted to MDRRMO. If MDRRMO does not acknowledge, respond to, or update the report within the configured deadline, the system automatically escalates the case to the LGU Executive Office and dispatches an automated SMS alert to designated LGU officials.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulateEscalation}
            className="self-start sm:self-auto px-3.5 py-2 bg-paper-2 hover:bg-paper-3 text-error border border-rule disabled:opacity-50 rounded-lg text-xs font-bold shadow-xs transition-colors active:scale-[0.98] flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            title="Simulate MDRRMO response deadline timeout and trigger immediate auto-escalation to LGU"
          >
            <Siren className="w-4 h-4 text-error" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Timeout & Escalate'}</span>
          </button>
        </div>

        {simulationNotice && (
          <div className="bg-paper-2 border border-rule text-ink p-3 rounded-lg text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent shrink-0" />
              <span>{simulationNotice}</span>
            </div>
            <button 
              type="button"
              onClick={() => setSimulationNotice(null)}
              className="text-muted hover:text-ink font-bold text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSaveEscalationConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Configurable Response Threshold without Emojis (Gate 30a) */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                MDRRMO response deadline threshold *
              </label>
              <select
                value={escalationConfig.thresholdMinutes}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, thresholdMinutes: Number(e.target.value) }))}
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value={1}>1 minute (Testing and quick demo mode)</option>
                <option value={5}>5 minutes (Fast verification mode)</option>
                <option value={60}>1 hour (60 minutes)</option>
                <option value={120}>2 hours (120 minutes) — Standard default</option>
                <option value={150}>2.5 hours (150 minutes)</option>
                <option value={180}>3 hours (180 minutes) — Maximum window</option>
              </select>
              <span className="text-xs text-muted mt-1 block">
                {escalationConfig.thresholdMinutes <= 5 
                  ? 'Testing mode selected for immediate escalation demonstration.'
                  : 'Statutory 2–3 hour window for MDRRMO emergency triage response.'}
              </span>
            </div>

            {/* 2. Designated LGU Official Name */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Designated LGU official recipient *
              </label>
              <input
                type="text"
                required
                value={escalationConfig.designatedLguName}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, designatedLguName: e.target.value }))}
                placeholder="e.g. Atty. Clarissa Reyes"
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule font-medium text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
              />
              <span className="text-xs text-muted mt-1 block">Official authorized to receive escalation notifications.</span>
            </div>

            {/* 3. Designated LGU Official Role */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Official designation / title *
              </label>
              <input
                type="text"
                required
                value={escalationConfig.designatedLguRole}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, designatedLguRole: e.target.value }))}
                placeholder="e.g. Municipal Administrator"
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule font-medium text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
              />
              <span className="text-xs text-muted mt-1 block">Municipal governance position.</span>
            </div>

            {/* 4. Designated Official SMS Phone */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-accent" />
                <span>Designated SMS alert number *</span>
              </label>
              <input
                type="tel"
                required
                value={escalationConfig.designatedLguPhone}
                onChange={(e) => setEscalationConfigState(prev => ({ ...prev, designatedLguPhone: e.target.value }))}
                placeholder="e.g. 0920-988-4411"
                className="w-full p-2.5 text-xs bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule font-mono font-medium tabular-nums text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
              />
              <span className="text-xs text-muted mt-1 block">Receives automated carrier SMS on deadline breach.</span>
            </div>
          </div>

          {/* SMS Broadcast Format Preview Box */}
          <div className="p-3.5 bg-paper-2 rounded-lg border border-rule text-xs space-y-1.5">
            <span className="text-xs font-semibold text-muted block">
              Standard carrier SMS payload preview:
            </span>
            <p className="text-xs text-ink bg-paper p-3 rounded-md border border-rule leading-relaxed select-all">
              URGENT ALERT: Incident #[ID] reported at [LOCATION] has not received a response or acknowledgment from the MDRRMO for more than {(escalationConfig.thresholdMinutes / 60).toFixed(1)} hours. LGU intervention is required. Please review the incident and take the appropriate action immediately. [Details: Type: [EMERGENCY] | Date/Time: [TIMESTAMP] | Current Status: Escalated to LGU | Recommended Action: LGU intervention/review required]
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-rule">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={escalationConfig.enabled}
                  onChange={(e) => setEscalationConfigState(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded text-accent focus-visible:ring-focus w-4 h-4 cursor-pointer"
                />
                <span>Enable automated MDRRMO-to-LGU escalation and SMS broadcasts</span>
              </label>
              {isSavedNotice && (
                <span className="text-xs font-semibold text-accent flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Policy saved!
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-accent text-accent-ink hover:opacity-90 active:scale-[0.98] transition-opacity rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Escalation Policy</span>
            </button>
          </div>
        </form>
      </section>

      {/* 4 Connected Agencies Grid */}
      <section aria-label="Integrated agencies" className="bg-paper rounded-xl border border-rule shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-ink">
          Integrated Government Agencies (Roxas, Oriental Mindoro)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENCIES_LIST.map((ag) => (
            <div key={ag.id} className="p-3.5 bg-paper-2 rounded-lg border border-rule space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{ag.name}</span>
                <span className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <p className="text-xs text-muted leading-relaxed">{ag.description}</p>
              <div className="pt-2 border-t border-rule text-xs text-muted flex justify-between">
                <span>Scope: <strong className="text-ink">{ag.jurisdictionScope}</strong></span>
                <span className="text-accent font-semibold">Live gateway</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registered User Accounts */}
      <section aria-label="Registered user accounts" className="bg-paper rounded-xl border border-rule shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" />
              Authorized Multi-Agency Personnel & Officer Accounts ({(users || []).length} Active)
            </h3>
            <p className="text-xs text-muted mt-0.5">
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
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-paper-2 hover:bg-paper-3 text-error border border-rule rounded-lg text-xs font-bold shadow-xs transition-colors active:scale-[0.98] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Accounts</span>
              </button>
            )}

            <button
              id="btn-admin-create-account"
              type="button"
              onClick={() => setIsCreateAccountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent text-accent-ink hover:opacity-90 active:scale-[0.98] transition-opacity rounded-lg text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              <span className="whitespace-nowrap">New officer account</span>
            </button>
          </div>
        </div>

        {(!users || users.length === 0) ? (
          <div className="p-6 rounded-xl bg-paper-2 border border-rule text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper text-muted flex items-center justify-center mx-auto border border-rule">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">No registered accounts</h4>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                All previous accounts have been deleted. You can create new officer accounts now or restore defaults.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateAccountModalOpen(true)}
                className="px-4 py-2 bg-accent text-accent-ink hover:opacity-90 active:scale-[0.98] transition-opacity rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Account</span>
              </button>
              <button
                type="button"
                onClick={() => resetToDefaults()}
                className="px-4 py-2 bg-paper hover:bg-paper-3 text-ink border border-rule rounded-lg text-xs font-bold transition-colors active:scale-[0.98] flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Seed Accounts</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-rule">
              <thead className="bg-paper-2 text-muted font-medium text-xs">
                <tr>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Official name</th>
                  <th className="py-2.5 px-3">Position / designation</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3">Role tier</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {(users || []).map((u) => {
                  const isActive = currentUser && u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={`hover:bg-paper-2 transition-colors ${isActive ? 'bg-paper-2 font-medium' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-accent tabular-nums">{u.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-ink flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-paper-3 text-ink flex items-center justify-center font-bold text-xs">
                          {(u.name || 'U').charAt(0)}
                        </div>
                        <span>{u.name || 'Unnamed User'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-ink">{u.position}</td>
                      <td className="py-2.5 px-3 text-muted">
                        <span className="font-medium text-ink">{u.agencyName}</span>
                        {u.barangay && <span className="text-xs text-accent block font-semibold">Brgy. {u.barangay}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs font-bold text-ink">{u.role}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-paper-2 px-2 py-0.5 rounded border border-rule">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                              Logged in
                            </span>
                          ) : (
                            <span className="text-xs text-muted font-medium px-2 py-0.5">
                              Offline
                            </span>
                          )}
                          <button
                            type="button"
                            id={`btn-admin-edit-${u.id}`}
                            title={`Rename / Edit account of ${u.name}`}
                            onClick={() => openEditAccountModal(u)}
                            className="p-1 rounded text-muted hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            id={`btn-admin-delete-${u.id}`}
                            title={`Delete account of ${u.name}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete account: ${u.name} (${u.position})?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 rounded text-muted hover:text-error hover:bg-paper-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
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
      </section>

      {/* 20 Barangays Master List */}
      <section aria-label="Master barangay registry" className="bg-paper rounded-xl border border-rule shadow-xs p-5 space-y-3">
        <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-accent" />
          Master Barangay Registry ({ROXAS_BARANGAYS.length} Barangays of Roxas, Oriental Mindoro)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ROXAS_BARANGAYS.map((b) => (
            <div key={b} className="p-3 bg-paper-2 rounded-lg border border-rule text-center">
              <span className="text-xs font-bold text-ink block truncate">Barangay {b}</span>
              <span className="text-xs text-accent font-medium">Unit active</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
