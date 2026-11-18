import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';
import {
  sendAutomatedResponderSMS,
  getStoredSmsDispatches,
  SmsDispatchRecord,
  getActiveSmsResendStatus,
  startSmsResendInterval,
  stopSmsResendInterval,
  buildAlertSmsMessage,
  ResponderSmsPayloadInput
} from '../../utils/smsService';

export const EmergencyAccidentAlarmModal: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { cases, setSelectedCaseId, addCaseTimelineEvent, markIncidentAsSeenAndResponded } = useCases();
  const { notifications, markNotificationAsRead } = useNotifications();
  const { setActiveTab } = useUI();

  const [activeEmergencyNotif, setActiveEmergencyNotif] = useState<any | null>(null);
  const [isSeenAndResponded, setIsSeenAndResponded] = useState(false);
  const [smsDispatches, setSmsDispatches] = useState<SmsDispatchRecord[]>([]);
  const [resendStatus, setResendStatus] = useState<{ isActive: boolean; resendCount: number; lastSentAt?: string }>({ isActive: false, resendCount: 0 });

  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('acknowledged_accident_alarms') || '[]');
    } catch {
      return [];
    }
  });

  const acknowledgeIncidentAlert = (alertId?: string, caseId?: string) => {
    const idsToAdd: string[] = [];
    if (alertId) idsToAdd.push(alertId);
    if (caseId) idsToAdd.push(caseId);

    if (idsToAdd.length > 0) {
      setAcknowledgedIds((prev) => {
        const next = Array.from(new Set([...prev, ...idsToAdd]));
        try {
          sessionStorage.setItem('acknowledged_accident_alarms', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const isMdrrmoOfficer =
    currentUser?.agencyType === 'MDRRMO' ||
    currentUser?.role === 'MDRRMO_ADMIN' ||
    currentUser?.role === 'MDRRMO_OFFICER' ||
    Boolean(currentUser?.agencyName && currentUser.agencyName.toLowerCase().includes('mdrrmo'));

  // Track recurring interval SMS resend ticks
  useEffect(() => {
    const updateResend = () => {
      const caseId = activeEmergencyNotif?.caseId;
      if (caseId) {
        setResendStatus(getActiveSmsResendStatus(caseId));
        const stored = getStoredSmsDispatches().filter((d) => d.caseId === caseId);
        if (stored.length > 0) {
          setSmsDispatches(stored);
        }
      }
    };

    updateResend();

    const handleTick = (e: any) => {
      if (!activeEmergencyNotif?.caseId || e.detail?.caseId === activeEmergencyNotif?.caseId) {
        updateResend();
      }
    };

    window.addEventListener('mdrrmo_sms_interval_tick', handleTick);
    window.addEventListener('mdrrmo_sms_interval_stopped', handleTick);

    return () => {
      window.removeEventListener('mdrrmo_sms_interval_tick', handleTick);
      window.removeEventListener('mdrrmo_sms_interval_stopped', handleTick);
    };
  }, [activeEmergencyNotif]);

  // Listen for unacknowledged incident reports received by the MDRRMO monitoring system.
  // The notification will NOT stop until responders mark the incident as 'seen/responded'.
  useEffect(() => {
    if (!isMdrrmoOfficer) {
      setActiveEmergencyNotif(null);
      return;
    }

    // If responder has already confirmed receipt or marked as seen, do not re-open
    if (isSeenAndResponded) {
      return;
    }

    // 1. Scan for any active incident in cases that has not yet been marked as seen/responded
    // Triggers for any active unresolved, unacknowledged incident in the system
    const unacknowledgedCase = cases.find((c) => {
      if (!c) return false;
      // If already resolved, closed, or acknowledged, ignore
      if (c.status === 'Resolved' || c.status === 'Closed' || (c.status as string) === 'Archived') return false;
      if (c.emergencyAlarmAcknowledged) return false;
      if (acknowledgedIds.includes(c.id)) return false;

      return true;
    });

    // 2. Scan for unacknowledged emergency notifications
    const unacknowledgedNotif = notifications.find((n) => {
      if (!n || n.isRead) return false;
      if (acknowledgedIds.includes(n.id)) return false;
      if (n.caseId && acknowledgedIds.includes(n.caseId)) return false;

      const related = n.caseId ? cases.find((c) => c.id === n.caseId) : null;
      if (related && (related.emergencyAlarmAcknowledged || acknowledgedIds.includes(related.id))) return false;

      const titleLower = (n.title || '').toLowerCase();
      const msgLower = (n.message || '').toLowerCase();
      const isEmergencyIncident =
        n.isAccidentEmergency ||
        n.isMdrrmoEmergency ||
        n.isMdrrmoIncident ||
        n.type === 'pending_alert' ||
        n.type === 'case_registered' ||
        titleLower.includes('accident') ||
        titleLower.includes('emergency') ||
        titleLower.includes('banggaan') ||
        titleLower.includes('vehicular') ||
        titleLower.includes('disgrasya') ||
        msgLower.includes('accident') ||
        msgLower.includes('emergency') ||
        msgLower.includes('vehicular') ||
        msgLower.includes('banggaan') ||
        msgLower.includes('sms sent');

      return isEmergencyIncident && (n.priority === 'urgent' || n.priority === 'high');
    });

    const target = unacknowledgedCase
      ? {
          id: `NOTIF-${unacknowledgedCase.id}`,
          title: `🚨 EMERGENCY INCIDENT REPORT: Brgy. ${unacknowledgedCase.barangay}`,
          message: `URGENT MDRRMO DISPATCH: ${unacknowledgedCase.title} reported at ${unacknowledgedCase.sitio ? `${unacknowledgedCase.sitio}, ` : ''}${unacknowledgedCase.barangay}. Case #${unacknowledgedCase.id}. Automated SMS dispatched to MDRRMO account!`,
          caseId: unacknowledgedCase.id,
          timestamp: unacknowledgedCase.dateReported || unacknowledgedCase.dateCreated || new Date().toISOString(),
          priority: 'urgent',
          targetBarangay: unacknowledgedCase.barangay
        }
      : unacknowledgedNotif;

    const isTargetAcknowledged = target
      ? acknowledgedIds.includes(target.id) || (target.caseId && acknowledgedIds.includes(target.caseId))
      : false;

    if (target && !isTargetAcknowledged) {
      setActiveEmergencyNotif(target);

      // Populate or generate automated SMS dispatch to MDRRMO account
      const related = target.caseId ? cases.find((c) => c.id === target.caseId) : null;
      const caseId = target.caseId || `EMG-${Date.now().toString().slice(-4)}`;

      const smsPayload: ResponderSmsPayloadInput = {
        id: caseId,
        title: related?.title || target.title,
        category: related?.category || 'Critical Emergency',
        incidentType: related?.category || related?.title || target.title,
        location: related?.specificLocation || (target.targetBarangay ? `Barangay ${target.targetBarangay}, Roxas` : 'Roxas Municipal Sector'),
        barangay: related?.barangay || target.targetBarangay,
        sitio: related?.sitio,
        incidentDate: related?.incidentDate,
        incidentTime: related?.incidentTime,
        reporterName: related?.reporterName || related?.createdBy || 'Resident Citizen',
        priority: 'URGENT'
      };

      // Always start the recurring interval resend for this active emergency
      startSmsResendInterval(smsPayload, users, 30000);
      setResendStatus({ isActive: true, resendCount: 1 });

      const stored = target.caseId ? getStoredSmsDispatches().filter((d) => d.caseId === target.caseId) : [];
      if (stored.length > 0) {
        setSmsDispatches(stored);
      } else {
        sendAutomatedResponderSMS(smsPayload, users).then((records) => {
          setSmsDispatches(records);
        });
      }
    } else {
      setActiveEmergencyNotif(null);
    }
  }, [notifications, cases, isMdrrmoOfficer, users, acknowledgedIds, isSeenAndResponded]);

  if (!activeEmergencyNotif || !isMdrrmoOfficer) {
    return null;
  }

  const relatedCase = activeEmergencyNotif.caseId
    ? cases.find((c) => c.id === activeEmergencyNotif.caseId)
    : undefined;

  const formatTimestampHeader = (isoStr?: string) => {
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '');
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear().toString().slice(-2);
      return `${time}, ${day}${month}${year}`;
    } catch {
      return 'Just now';
    }
  };

  const handleMarkSeenAndResponded = () => {
    setIsSeenAndResponded(true);

    const targetNotifId = activeEmergencyNotif?.id;
    const targetCaseId = activeEmergencyNotif?.caseId || relatedCase?.id;

    // 1. Halt recurring interval SMS resend
    if (targetCaseId) {
      stopSmsResendInterval(targetCaseId);
    }

    // 2. Persist IDs to acknowledgedIds so it will NEVER trigger again
    acknowledgeIncidentAlert(targetNotifId, targetCaseId);

    // 3. Mark relevant notification(s) as read in notification system
    if (targetNotifId && markNotificationAsRead) {
      markNotificationAsRead(targetNotifId);
    }
    if (targetCaseId && markNotificationAsRead) {
      notifications
        .filter((n) => n.caseId === targetCaseId)
        .forEach((n) => markNotificationAsRead(n.id));
    }

    // 4. Formally acknowledge incident in case state & database
    if (targetCaseId && markIncidentAsSeenAndResponded) {
      markIncidentAsSeenAndResponded(targetCaseId);
    } else if (relatedCase) {
      addCaseTimelineEvent(
        relatedCase.id,
        '🚨 Incident Marked as Seen & Responded by MDRRMO',
        `MDRRMO Officer ${currentUser.name} (${currentUser.position}) acknowledged and marked the emergency alert as 'Seen / Responded'. Automated SMS interval notifications halted. Emergency Rescue & Ambulance Units deployed to ${relatedCase.specificLocation || 'incident site'}.`,
        'LGU Action'
      );
    }

    // 5. Dismiss alert popup
    setTimeout(() => {
      setActiveEmergencyNotif(null);
      setIsSeenAndResponded(false);
    }, 150);
  };

  const handleViewCase = () => {
    const caseIdToView = activeEmergencyNotif?.caseId || relatedCase?.id;
    handleMarkSeenAndResponded();
    if (caseIdToView) {
      setSelectedCaseId(caseIdToView);
      setActiveTab('cases');
    }
  };

  const smsMessage =
    smsDispatches[0]?.message ||
    (relatedCase
      ? buildAlertSmsMessage({
          id: relatedCase.id,
          title: relatedCase.title,
          category: relatedCase.category,
          incidentType: relatedCase.category || relatedCase.title,
          barangay: relatedCase.barangay,
          sitio: relatedCase.sitio,
          incidentDate: relatedCase.incidentDate,
          incidentTime: relatedCase.incidentTime,
          reporterName: relatedCase.reporterName
        })
      : `ALERT: Emergency Incident reported at Roxas on ${new Date().toLocaleDateString()} by Resident Citizen. Please verify and respond.`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div
        id="emergency-accident-alarm-modal"
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[350px] sm:max-w-[420px] bg-paper text-ink rounded-lg shadow-card p-6 border border-rule flex flex-col gap-3 font-sans animate-in zoom-in-95 duration-150"
      >
        {/* Header: Warning icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 mt-0.5">
            <AlertTriangle className="w-8 h-8 text-error" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted leading-tight">
              Emergency alert
            </h2>
            <h3 className="text-base font-bold text-ink leading-tight">
              Extreme incident
            </h3>
          </div>
        </div>

        {/* Content Body: MDRRMO (Timestamp) and Alert text */}
        <div className="text-ink text-xs leading-relaxed font-normal space-y-2 pt-1">
          <div className="flex items-center justify-between gap-2 border-b border-rule pb-1.5">
            <div className="flex items-center gap-2">
              <img src="/mdrrmo_logo.png" alt="MDRRMO" className="w-5 h-5 rounded-full object-contain border border-rule bg-paper" />
              <p className="font-semibold text-ink text-xs">
                MDRRMO ({formatTimestampHeader(activeEmergencyNotif.timestamp)})
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-paper-2 text-warning border border-rule">
              In-system alert
            </span>
          </div>

          <div className="bg-paper-2 rounded-md p-3 border border-rule font-outlier text-xs text-ink leading-relaxed whitespace-pre-wrap">
            {smsMessage}
          </div>

          {/* Active resend notice */}
          {resendStatus.isActive && (
            <div className="text-xs text-ink bg-paper-2 rounded-md px-2.5 py-1.5 border border-rule flex items-center justify-between mt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-warning motion-safe:animate-pulse" />
                <span>In-system alert • dispatch broadcast active</span>
              </span>
              {resendStatus.resendCount > 0 && (
                <span className="font-semibold text-ink num">
                  Cycle #{resendStatus.resendCount}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-muted">
            Automated in-system incident alert (SMS-style dispatch format for MDRRMO Command Center).
          </p>
        </div>

        {/* Bottom Actions: Right-aligned buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          {relatedCase && (
            <button
              id="btn-alarm-view-case"
              onClick={handleViewCase}
              className="px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink hover:bg-paper-2 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View docket
            </button>
          )}
          <button
            id="btn-alarm-mark-seen-responded"
            onClick={handleMarkSeenAndResponded}
            disabled={isSeenAndResponded}
            className="px-4 py-1.5 text-xs font-semibold bg-accent text-accent-ink hover:opacity-90 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeenAndResponded ? 'Acknowledged' : 'Acknowledge'}
          </button>
        </div>
      </div>
    </div>
  );
};
