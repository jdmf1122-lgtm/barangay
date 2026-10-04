import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { useUI } from '../../hooks/useUI';
import {
  sendAutomatedResponderSMS,
  getStoredSmsDispatches,
  SmsDispatchRecord,
  getActiveSmsResendStatus,
  stopSmsResendInterval,
  buildAlertSmsMessage
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

  const isMdrrmoOfficer = currentUser?.agencyType === 'MDRRMO';
  const userBarangay = currentUser?.barangay;

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
  // No audible alert or alarm should be triggered — SMS text only.
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
    const unacknowledgedCase = cases.find((c) => {
      const isTargetedBarangay = !userBarangay || c.barangay === userBarangay || !c.barangay;
      const isEmergencyOrCitizen = c.isCitizenReport || c.isAccidentEmergency || c.priority === 'Urgent' || (c.originatingAgency && c.originatingAgency.includes('Resident'));
      const isNotResolved = c.status !== 'Resolved' && c.status !== 'Closed';
      const isNotAcknowledged = !c.emergencyAlarmAcknowledged && !acknowledgedIds.includes(c.id);
      return isTargetedBarangay && isEmergencyOrCitizen && isNotResolved && isNotAcknowledged;
    });

    // 2. Scan for unacknowledged emergency notifications
    const unacknowledgedNotif = notifications.find((n) => {
      if (n.isRead) return false;
      if (acknowledgedIds.includes(n.id)) return false;
      if (n.caseId && acknowledgedIds.includes(n.caseId)) return false;

      const isTargetedBarangay = !userBarangay || !n.targetBarangay || n.targetBarangay === userBarangay;
      const titleLower = (n.title || '').toLowerCase();
      const msgLower = (n.message || '').toLowerCase();
      const isEmergencyIncident =
        n.isAccidentEmergency ||
        n.isMdrrmoEmergency ||
        n.isMdrrmoIncident ||
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

      const isUrgent = n.priority === 'urgent' || n.type === 'pending_alert' || n.type === 'case_registered';
      const related = n.caseId ? cases.find((c) => c.id === n.caseId) : null;
      const isCaseAcknowledged = related ? (!!related.emergencyAlarmAcknowledged || acknowledgedIds.includes(related.id)) : false;

      return isTargetedBarangay && isEmergencyIncident && isUrgent && !isCaseAcknowledged;
    });

    const target = unacknowledgedCase
      ? {
          id: `NOTIF-${unacknowledgedCase.id}`,
          title: `🚨 EMERGENCY INCIDENT REPORT: Brgy. ${unacknowledgedCase.barangay}`,
          message: `URGENT MDRRMO DISPATCH: ${unacknowledgedCase.title} reported at ${unacknowledgedCase.sitio ? `${unacknowledgedCase.sitio}, ` : ''}${unacknowledgedCase.barangay}. Case #${unacknowledgedCase.id}. Automated SMS dispatched to MDRRMO account!`,
          caseId: unacknowledgedCase.id,
          timestamp: unacknowledgedCase.dateReported || new Date().toISOString(),
          priority: 'urgent',
          targetBarangay: unacknowledgedCase.barangay
        }
      : unacknowledgedNotif;

    const isTargetAcknowledged = target
      ? acknowledgedIds.includes(target.id) || (target.caseId && acknowledgedIds.includes(target.caseId))
      : false;

    if (target && !isTargetAcknowledged) {
      setActiveEmergencyNotif(target);

      // Populate or generate automated SMS dispatch to MDRRMO account (SMS text only, no sound)
      const related = target.caseId ? cases.find((c) => c.id === target.caseId) : null;
      const stored = target.caseId ? getStoredSmsDispatches().filter((d) => d.caseId === target.caseId) : [];

      if (stored.length > 0) {
        setSmsDispatches(stored);
      } else {
        const caseId = target.caseId || `EMG-${Date.now().toString().slice(-4)}`;
        sendAutomatedResponderSMS(
          {
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
          },
          users
        ).then((records) => {
          setSmsDispatches(records);
        });
      }
    } else {
      setActiveEmergencyNotif(null);
    }
  }, [notifications, cases, isMdrrmoOfficer, userBarangay, users, acknowledgedIds, isSeenAndResponded]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="emergency-accident-alarm-modal"
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[350px] sm:max-w-[390px] bg-white rounded-lg shadow-2xl p-6 border border-slate-200/80 flex flex-col gap-3 font-sans animate-in zoom-in-95 duration-150"
      >
        {/* Header: Red Triangle Icon & Two-line Title */}
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 mt-0.5">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2.2L1.2 21.4C1.0 21.8 1.3 22.3 1.8 22.3H22.2C22.7 22.3 23.0 21.8 22.8 21.4L12 2.2Z"
                fill="#D32F2F"
              />
              <rect x="11.1" y="8" width="1.8" height="6.2" rx="0.9" fill="#FFFFFF" />
              <circle cx="12" cy="17.2" r="1.1" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <h2 className="text-[21px] font-normal text-slate-800 leading-tight">
              Emergency alert:
            </h2>
            <h3 className="text-[21px] font-bold text-slate-900 leading-tight">
              Extreme
            </h3>
          </div>
        </div>

        {/* Content Body: MDRRMO (Timestamp) and Alert text */}
        <div className="text-slate-800 text-[14px] sm:text-[15px] leading-relaxed font-normal space-y-2 pt-1">
          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
            MDRRMO ({formatTimestampHeader(activeEmergencyNotif.timestamp)})
          </p>
          <p className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
            {smsMessage}
          </p>

          {/* Active resend notice */}
          {resendStatus.isActive && (
            <div className="text-[11px] text-amber-900 bg-amber-50 rounded px-2.5 py-1.5 border border-amber-200/70 flex items-center justify-between mt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>SMS alert actively resending</span>
              </span>
              {resendStatus.resendCount > 0 && (
                <span className="font-mono text-amber-950 font-bold">
                  Resent: {resendStatus.resendCount}x
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions: Right-aligned OK button */}
        <div className="flex items-center justify-end gap-2 pt-3">
          {relatedCase && (
            <button
              id="btn-alarm-view-case"
              onClick={handleViewCase}
              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer tracking-wider uppercase"
            >
              VIEW DOCKET
            </button>
          )}
          <button
            id="btn-alarm-mark-seen-responded"
            onClick={handleMarkSeenAndResponded}
            disabled={isSeenAndResponded}
            className="px-4 py-1.5 text-sm sm:text-base font-bold text-[#00796B] hover:text-[#004D40] hover:bg-emerald-50 rounded transition cursor-pointer tracking-wide active:scale-95 uppercase font-sans"
          >
            {isSeenAndResponded ? 'ACKNOWLEDGED' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
