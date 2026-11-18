import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  ArrowUpRight,
  FileText,
  Siren,
  Activity,
  MapPin,
  Check,
  Timer,
  AlertOctagon,
  Radio
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { formatDateShort } from '../../utils/reportGenerators';
import { sendAutomatedResponderSMS, startSmsResendInterval } from '../../utils/smsService';
import { getEscalationConfig, formatElapsedTime } from '../../utils/escalationService';
import { isConsolidatedCase } from '../../utils/duplicateReportDetector';
import { ROXAS_BARANGAYS } from '../../types';

export const MdrrmoDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { cases, setSelectedCaseId, markIncidentAsSeenAndResponded } = useCases();
  const { triggerNotification } = useNotifications();
  const { setActiveTab } = useUI();

  const currentBarangay = currentUser?.barangay;
  const [barangayFilter, setBarangayFilter] = useState<string>('ALL');
  const [, setTimeTick] = useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setTimeTick(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const escalationConfig = getEscalationConfig();

  const safeCases = cases || [];

  // MDRRMO monitors all incidents municipal-wide across all 20 component barangays
  const mdrrmoCases = barangayFilter === 'ALL'
    ? safeCases
    : safeCases.filter((c) => c && c.barangay === barangayFilter);

  // Active unacknowledged resident reports & emergency alerts
  const incomingResidentAlerts = safeCases.filter((c) => {
    if (!c) return false;

    // Must be reported by a resident citizen
    const isResidentReport = Boolean(c.isCitizenReport) || Boolean(c.residentReporterId) || Boolean(c.originatingAgency?.includes('Resident'));
    if (!isResidentReport) return false;

    return (
      !c.emergencyAlarmAcknowledged &&
      c.status !== 'Resolved' &&
      c.status !== 'Closed'
    );
  });

  const totalIncidents = mdrrmoCases.length;
  const resolvedCount = mdrrmoCases.filter((c) => c && (c.status === 'Resolved' || c.status === 'Closed')).length;
  const pendingCount = mdrrmoCases.filter((c) => c && (c.isPending || c.status === 'Pending')).length;
  const accidentCases = mdrrmoCases.filter((c) => c && (c.isAccidentEmergency || c.category === 'Traffic / Vehicular Incident' || (c.vehicleDetails && c.vehicleDetails.length > 0)));
  const ambulanceDispatches = mdrrmoCases.filter((c) => c && (c.respondingAmbulanceUnit && c.respondingAmbulanceUnit !== 'None'));
  const urgentCrashes = mdrrmoCases.filter((c) => c && (c.priority === 'Urgent' || c.priority === 'High'));

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
      'EMERGENCY ALERT: Vehicular Collision in Roxas',
      'SIMULATED CRASH DISPATCH: Motorcycle vs Tricycle severe collision logged. Automated SMS broadcast dispatched to MDRRMO account. Re-sending at regular intervals until Marked as Seen/Responded (SMS text only).',
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

  const isOfficer = currentUser?.role === 'MDRRMO_OFFICER';

  return (
    <div id="mdrrmo-dashboard-view" className="space-y-6">
      {/* Top Banner with Official MDRRMO Seal */}
      <section
        aria-label="MDRRMO operations overview"
        className="bg-paper border border-rule rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-paper-2 border border-rule p-1.5 shrink-0 flex items-center justify-center">
            <img
              src="/mdrrmo_logo.png"
              alt="MDRRMO Roxas official seal"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-2 border border-rule text-ink text-xs font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-warning" />
                <span>MDRRMO Roxas · Emergency medical and rescue operations</span>
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink leading-tight">
              {isOfficer ? 'MDRRMO incident response and triage operations' : 'MDRRMO disaster risk and emergency incident operations'}
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              <span>Protect, serve, rescue, that you may live</span> · <span>Municipality of Roxas, Oriental Mindoro</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5 w-full md:w-auto">
          <button
            id="btn-mdrrmo-test-alarm"
            type="button"
            onClick={handleTestAccidentAlarm}
            className="flex-1 sm:flex-none px-4 py-2 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule rounded-lg text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Simulate incoming accident report to test automated in-system SMS-style dispatch popup"
          >
            <Siren className="w-4 h-4 text-warning" />
            <span>Test SMS alert</span>
          </button>
          <button
            id="btn-mdrrmo-view-annual"
            type="button"
            onClick={() => setActiveTab('annual_narrative')}
            className="w-full sm:w-auto px-4 py-2 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule rounded-lg text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-muted" />
            <span>Incident logs</span>
          </button>
        </div>
      </section>

      {/* Live Incoming Resident Incident Reports Alert Banner */}
      {incomingResidentAlerts.length > 0 && (
        <section
          id="mdrrmo-live-incoming-alerts"
          aria-label="Live resident emergency alerts"
          className="bg-paper-2 border-2 border-error rounded-xl p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error shrink-0 inline-block" />
              <h3 className="text-sm font-bold text-ink">
                Live resident reports received ({incomingResidentAlerts.length})
              </h3>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 bg-paper border border-rule text-ink rounded-full">
              Real-time push connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingResidentAlerts.slice(0, 4).map((c) => {
              const elapsed = formatElapsedTime(c.dateReported || c.dateCreated);
              const remainingMins = Math.max(0, escalationConfig.thresholdMinutes - elapsed.minutes);
              const isOverdue = elapsed.minutes >= escalationConfig.thresholdMinutes;

              return (
                <div key={c.id} className="bg-paper border border-rule rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 bg-paper-2 border border-rule text-ink rounded num">
                        #{c.id}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1 num">
                        <Clock className="w-3 h-3 text-muted" />
                        {formatDateShort(c.dateReported)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-ink line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-warning shrink-0" />
                      <span className="truncate">Brgy. {c.barangay} · {c.specificLocation}</span>
                    </p>
                    {c.reporterName && (
                      <p className="text-xs text-muted mt-0.5">
                        Reported by resident: <strong className="text-ink font-semibold">{c.reporterName}</strong>
                      </p>
                    )}

                    {/* Response Timer & Escalation Monitor */}
                    <div className={`mt-2.5 p-2 rounded-lg border text-xs flex items-center justify-between gap-1.5 ${
                      c.isEscalatedToLgu
                        ? 'bg-error/10 border-error/30 text-error font-semibold'
                        : isOverdue
                          ? 'bg-error/10 border-error/30 text-error font-semibold'
                          : remainingMins <= 30
                            ? 'bg-warning/10 border-warning/30 text-ink font-medium'
                            : 'bg-paper-2 border-rule text-muted'
                    }`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Timer className={`w-3.5 h-3.5 shrink-0 ${c.isEscalatedToLgu || isOverdue ? 'text-error' : 'text-warning'}`} />
                        <span className="truncate">
                          {c.isEscalatedToLgu ? (
                            <span className="inline-flex items-center gap-1.5">
                              <AlertOctagon className="w-3.5 h-3.5 text-error shrink-0" />
                              <span>Escalated to LGU ({elapsed.displayStr} elapsed)</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5">
                              <AlertOctagon className="w-3.5 h-3.5 text-error shrink-0" />
                              <span>Deadline reached ({elapsed.displayStr} elapsed), escalating to LGU</span>
                            </span>
                          ) : (
                            <span>Timer: <strong className="num">{elapsed.displayStr}</strong> (escalates to LGU in {remainingMins >= 60 ? `${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m` : `${remainingMins}m`})</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-paper text-muted shrink-0 border border-rule">
                        Limit: <span className="font-mono text-ink font-medium num">{escalationConfig.thresholdMinutes >= 60 ? `${escalationConfig.thresholdMinutes / 60}h` : `${escalationConfig.thresholdMinutes}m`}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-rule">
                    <button
                      type="button"
                      onClick={() => setSelectedCaseId(c.id)}
                      className="flex-1 py-1.5 px-3 bg-paper-2 hover:bg-paper-3 active:bg-paper text-ink border border-rule rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      <span>View report</span>
                      <ArrowUpRight className="w-3 h-3 text-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={() => markIncidentAsSeenAndResponded(c.id)}
                      className="flex-1 py-1.5 px-3 bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-ink rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      title="Acknowledge incident to halt LGU escalation timer and stop sirens"
                    >
                      <Check className="w-3 h-3" />
                      <span className="whitespace-nowrap">Acknowledge alert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Metrics Row */}
      <section aria-label="Incident metrics summary" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Total logged</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-ink num">{totalIncidents}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
            <span>All incidents</span>
            <div className="h-px flex-1 bg-rule" />
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Vehicular crashes</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-warning num">{accidentCases.length}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
            <span>Road incidents</span>
            <div className="h-px flex-1 bg-rule" />
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Ambulance trips</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-error num">{ambulanceDispatches.length}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
            <span>Rescue dispatched</span>
            <div className="h-px flex-1 bg-rule" />
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Active investigations</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-accent num">{pendingCount}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
            <span>Ongoing triage</span>
            <div className="h-px flex-1 bg-rule" />
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Resolved or cleared</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-success num">{resolvedCount}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
            <span>Closed cases</span>
            <div className="h-px flex-1 bg-rule" />
          </div>
        </div>

        <div className="bg-paper p-4 rounded-xl border border-rule shadow-xs">
          <p className="text-xs text-muted font-medium">Urgent severity</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-error num">{urgentCrashes.length}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
            <span>High risk and trauma</span>
            <div className="h-px flex-1 bg-rule" />
          </div>
        </div>
      </section>

      {/* Incident & Dispatch Table */}
      <section aria-label="Incident dispatch queue" className="bg-paper rounded-xl border border-rule shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-ink">
              Active incident stream and dispatch queue
            </h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="py-1.5 px-3 bg-paper-2 hover:bg-paper-3 text-ink text-xs font-medium rounded-lg border border-rule focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer disabled:opacity-50"
              title="Filter incident queue by barangay"
            >
              <option value="ALL">All Roxas barangays ({ROXAS_BARANGAYS.length})</option>
              {ROXAS_BARANGAYS.map((b) => (
                <option key={b} value={b}>Brgy. {b}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setActiveTab('cases')}
              className="text-xs font-semibold text-accent hover:underline active:opacity-70 flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden whitespace-nowrap"
            >
              <span>View all cases</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-2 text-muted font-semibold border-b border-rule text-xs">
              <tr>
                <th className="py-3 px-4">Case number</th>
                <th className="py-3 px-4">Incident title</th>
                <th className="py-3 px-4">Location (Barangay)</th>
                <th className="py-3 px-4">Responding unit</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-medium">
              {mdrrmoCases.slice(0, 8).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="hover:bg-paper-2 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-ink">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-semibold num">{c.caseNumber || c.id}</span>
                      {c.isEscalatedToLgu && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-error/15 text-error border border-error/30" title="Automatically escalated to LGU due to MDRRMO non-response timeout">
                          <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                          <span>LGU escalated</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink flex items-center gap-1.5">
                      <span>{c.title}</span>
                      {isConsolidatedCase(c) && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-paper-2 text-ink border border-rule">
                          Unified report
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted line-clamp-1 mt-0.5">{c.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-paper-2 text-ink text-xs font-medium">
                      <MapPin className="w-3 h-3 text-muted" />
                      Brgy. {c.barangay}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-ink">
                      {c.respondingAmbulanceUnit || c.assignedPersonnel || 'MDRRMO Operations'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-4 text-muted font-mono text-xs num">
                    {formatDateShort(c.dateReported || c.dateCreated || c.incidentDate)}
                  </td>
                </tr>
              ))}
              {mdrrmoCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted">
                    No active incident records found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// Also export as BarangayDashboard for backwards compatibility
export const BarangayDashboard = MdrrmoDashboard;
