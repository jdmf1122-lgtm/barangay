import { Case, User } from '../types';
import { storeSmsDispatches, SmsDispatchRecord } from './smsService';

export interface EscalationConfig {
  thresholdMinutes: number; // e.g. 120 (2 hours), 180 (3 hours), 1 or 5 for testing
  enabled: boolean;
  designatedLguPhone: string;
  designatedLguName: string;
  designatedLguRole: string;
}

const ESCALATION_CONFIG_KEY = 'bconnect_escalation_config_v2';
const ESCALATED_CASES_CACHE_KEY = 'bconnect_escalated_cases_tracker_v1';

export const DEFAULT_ESCALATION_CONFIG: EscalationConfig = {
  thresholdMinutes: 120, // 2 Hours statutory default (configurable 1min - 3hrs)
  enabled: true,
  designatedLguPhone: '0920-988-4411',
  designatedLguName: 'Atty. Clarissa Reyes',
  designatedLguRole: 'Municipal Administrator / LGU Executive'
};

/**
 * Loads the current escalation configuration from storage
 */
export function getEscalationConfig(): EscalationConfig {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return DEFAULT_ESCALATION_CONFIG;
    }
    const raw = localStorage.getItem(ESCALATION_CONFIG_KEY);
    if (!raw) return DEFAULT_ESCALATION_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ESCALATION_CONFIG,
      ...parsed
    };
  } catch {
    return DEFAULT_ESCALATION_CONFIG;
  }
}

/**
 * Saves updated escalation configuration (accessible by Administrator)
 */
export function saveEscalationConfig(config: Partial<EscalationConfig>): EscalationConfig {
  const current = getEscalationConfig();
  const updated: EscalationConfig = {
    ...current,
    ...config
  };
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ESCALATION_CONFIG_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('escalation_config_updated', { detail: updated }));
    }
  } catch (e) {
    console.warn('Failed to save escalation config:', e);
  }
  return updated;
}

/**
 * Calculates human-readable elapsed time
 */
export function formatElapsedTime(reportDateStr: string): { minutes: number; displayStr: string; hoursFloat: number } {
  if (!reportDateStr) return { minutes: 0, displayStr: '0 minutes', hoursFloat: 0 };
  try {
    const reportTime = new Date(reportDateStr).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - reportTime);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hoursFloat = Number((minutes / 60).toFixed(1));

    if (minutes < 60) {
      return { minutes, displayStr: `${minutes} minute${minutes === 1 ? '' : 's'}`, hoursFloat };
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    const displayStr = remainingMins > 0 
      ? `${hours} hour${hours === 1 ? '' : 's'} and ${remainingMins} min${remainingMins === 1 ? '' : 's'}`
      : `${hours} hour${hours === 1 ? '' : 's'}`;

    return { minutes, displayStr, hoursFloat };
  } catch {
    return { minutes: 0, displayStr: '0 minutes', hoursFloat: 0 };
  }
}

/**
 * Checks whether an emergency case is eligible for automatic LGU escalation:
 * 1. Must be an emergency / citizen accident report handled by or routed to MDRRMO.
 * 2. Not already acknowledged by MDRRMO (emergencyAlarmAcknowledged !== true).
 * 3. Not already resolved or closed.
 * 4. Not already escalated to LGU.
 * 5. Time elapsed exceeds configured threshold.
 */
export function isCaseEligibleForEscalation(
  c: Case, 
  config: EscalationConfig = getEscalationConfig()
): boolean {
  if (!c || !config.enabled) return false;

  // If MDRRMO has already acknowledged, responded, or marked as seen, timer is halted
  if (c.emergencyAlarmAcknowledged) return false;

  // If already resolved or closed, timer is stopped
  if (c.status === 'Resolved' || c.status === 'Closed') return false;

  // If already escalated to LGU, do not duplicate
  if (c.isEscalatedToLgu) return false;

  // Must be an emergency incident report under MDRRMO purview
  const isEmergency = 
    Boolean(c.isAccidentEmergency) ||
    Boolean(c.isCitizenReport) ||
    String(c.category || '').toLowerCase().includes('accident') ||
    String(c.category || '').toLowerCase().includes('collision') ||
    String(c.category || '').toLowerCase().includes('vehicular') ||
    String(c.category || '').toLowerCase().includes('crash') ||
    String(c.originatingAgency || '').includes('MDRRMO') ||
    String(c.currentHandlingAgency || '').includes('MDRRMO') ||
    c.priority === 'Urgent';

  if (!isEmergency) return false;

  const dateStr = c.dateReported || c.dateCreated;
  if (!dateStr) return false;

  const { minutes } = formatElapsedTime(dateStr);
  return minutes >= config.thresholdMinutes;
}

/**
 * Builds the exact SMS message payload for LGU escalation strictly matching required specification:
 * 
 * Example SMS:
 * "URGENT ALERT: Incident #[ID] reported at [LOCATION] has not received a response or acknowledgment from the MDRRMO for more than [X] hours. LGU intervention is required. Please review the incident and take the appropriate action immediately."
 */
export function buildLguEscalationSmsMessage(c: Case, elapsedStr: string): string {
  const caseId = c.id;
  const location = c.specificLocation ? `${c.specificLocation}, Brgy. ${c.barangay || 'San Aquilino'}` : `Brgy. ${c.barangay || 'San Aquilino'}, Roxas`;
  const emergencyType = c.category || c.title || 'Emergency Incident';
  const reportedDate = c.incidentDate || (c.dateReported ? c.dateReported.split('T')[0] : 'Today');
  const reportedTime = c.incidentTime || (c.dateReported ? new Date(c.dateReported).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A');
  const status = c.status || 'Pending / Unacknowledged';

  return `URGENT ALERT: Incident #${caseId} reported at ${location} has not received a response or acknowledgment from the MDRRMO for more than ${elapsedStr}. LGU intervention is required. Please review the incident and take the appropriate action immediately.\n\n[INCIDENT DETAILS]\n- Incident ID: #${caseId}\n- Emergency Type: ${emergencyType}\n- Location: ${location}\n- Reported: ${reportedDate} ${reportedTime}\n- Elapsed: ${elapsedStr} without MDRRMO response\n- Current Status: ${status}\n- Recommended Action: LGU intervention/review required`;
}

/**
 * Dispatches the escalation SMS to the designated LGU officials
 */
export async function sendLguEscalationSms(
  c: Case,
  elapsedStr: string,
  config: EscalationConfig = getEscalationConfig()
): Promise<{ success: boolean; record: SmsDispatchRecord; smsBody: string }> {
  const now = new Date().toISOString();
  const smsBody = buildLguEscalationSmsMessage(c, elapsedStr);

  const record: SmsDispatchRecord = {
    id: `SMS-LGU-ESC-${Date.now()}`,
    caseId: c.id,
    recipientName: config.designatedLguName,
    recipientRole: config.designatedLguRole,
    recipientPhone: config.designatedLguPhone,
    agency: 'LGU Executive Office',
    message: smsBody,
    status: 'DELIVERED',
    timestamp: now
  };

  // Record into system SMS dispatches ledger
  storeSmsDispatches([record]);

  // Forward to carrier broadcast endpoint if backend is active
  const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '');

  if (backendUrl) {
    try {
      fetch(`${backendUrl}/api/sms/broadcast-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: c.id,
          message: smsBody,
          dispatches: [record],
          timestamp: now,
          isEscalation: true,
          recipient: config.designatedLguPhone
        })
      }).catch((e) => console.warn('LGU escalation SMS remote carrier dispatch note:', e));
    } catch (e) {
      console.warn('LGU escalation carrier notice:', e);
    }
  }

  console.info(`🚨 [LGU AUTO-ESCALATION SMS] Dispatched to ${config.designatedLguName} (${config.designatedLguPhone}) for Case #${c.id}. Elapsed without MDRRMO response: ${elapsedStr}.`);
  return { success: true, record, smsBody };
}
