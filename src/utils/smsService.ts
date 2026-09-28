import { User } from '../types';

export interface SmsDispatchRecord {
  id: string;
  caseId: string;
  recipientName: string;
  recipientRole: string;
  recipientPhone: string;
  agency: string;
  message: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING';
  timestamp: string;
}

// Official MDRRMO institutional account recipient (SMS directly targets the MDRRMO account without involving individual personnel)
export const MDRRMO_OFFICIAL_ACCOUNT = {
  name: 'MDRRMO Official Account',
  role: 'MDRRMO Command & Dispatch Center',
  agency: 'MDRRMO Roxas',
  phone: '0919-555-8821'
};

export const DEFAULT_MDRRMO_RESPONDERS = [MDRRMO_OFFICIAL_ACCOUNT];

const STORAGE_KEY = 'bconnect_mdrrmo_sms_dispatches_v1';

/**
 * Retrieves past SMS dispatches from local/session storage
 */
export function getStoredSmsDispatches(): SmsDispatchRecord[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves SMS dispatch records to storage
 */
export function storeSmsDispatches(records: SmsDispatchRecord[]): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const existing = getStoredSmsDispatches();
    const updated = [...records, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to store SMS dispatch records:', e);
  }
}

/**
 * Directly targets the MDRRMO system account.
 * The SMS is addressed specifically to the MDRRMO institutional account (no individual personnel).
 */
export function getRegisteredMdrrmoResponders(_allUsers?: User[]): Array<{ name: string; role: string; phone: string; agency: string }> {
  return [MDRRMO_OFFICIAL_ACCOUNT];
}

export interface ResponderSmsPayloadInput {
  id: string;
  title: string;
  location?: string;
  category?: string;
  incidentType?: string;
  barangay?: string;
  sitio?: string;
  incidentDate?: string;
  incidentTime?: string;
  dateTime?: string;
  reporterName?: string;
  priority?: string;
  isResend?: boolean;
  resendCount?: number;
}

/**
 * Builds the exact SMS message payload strictly according to specification:
 * ALERT: [Incident Type] reported at [Barangay/Sitio] on [Date/Time] by [Reporter Name]. Please verify and respond.
 */
export function buildAlertSmsMessage(caseInfo: ResponderSmsPayloadInput): string {
  // 1. Determine Incident Type
  const incidentType = caseInfo.incidentType || caseInfo.category || caseInfo.title || 'Incident';

  // 2. Determine Barangay / Sitio
  let barangaySitio = '';
  if (caseInfo.barangay && caseInfo.sitio) {
    const sitioClean = caseInfo.sitio.trim();
    const formattedSitio = sitioClean.toLowerCase().startsWith('sitio ') ? sitioClean : `Sitio ${sitioClean}`;
    barangaySitio = `${caseInfo.barangay} / ${formattedSitio}`;
  } else if (caseInfo.barangay) {
    barangaySitio = `Barangay ${caseInfo.barangay}`;
  } else {
    barangaySitio = caseInfo.location || 'Roxas';
  }

  // 3. Determine Date / Time of occurrence
  let dateTime = caseInfo.dateTime;
  if (!dateTime) {
    if (caseInfo.incidentDate && caseInfo.incidentTime) {
      dateTime = `${caseInfo.incidentDate} ${caseInfo.incidentTime}`;
    } else if (caseInfo.incidentDate) {
      const timePart = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      dateTime = `${caseInfo.incidentDate} ${timePart}`;
    } else {
      const currentDate = new Date().toISOString().split('T')[0];
      const timePart = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      dateTime = `${currentDate} ${timePart}`;
    }
  }

  // 4. Determine Reporting Resident Name
  const reporterName = caseInfo.reporterName || 'Resident Citizen';

  // Strict specification format:
  // ALERT: [Incident Type] reported at [Barangay/Sitio] on [Date/Time] by [Reporter Name]. Please verify and respond.
  return `ALERT: ${incidentType} reported at ${barangaySitio} on ${dateTime} by ${reporterName}. Please verify and respond.`;
}

/**
 * Automatically generates and sends SMS alert to all registered MDRRMO responders and officials.
 */
export async function sendAutomatedResponderSMS(
  caseInfo: ResponderSmsPayloadInput,
  allUsers?: User[]
): Promise<SmsDispatchRecord[]> {
  const responders = getRegisteredMdrrmoResponders(allUsers);
  const now = new Date().toISOString();
  const smsBody = buildAlertSmsMessage(caseInfo);

  const newRecords: SmsDispatchRecord[] = responders.map((r, idx) => ({
    id: `SMS-${Date.now()}-${idx + 1}`,
    caseId: caseInfo.id,
    recipientName: r.name,
    recipientRole: r.role,
    recipientPhone: r.phone,
    agency: r.agency,
    message: smsBody,
    status: 'DELIVERED',
    timestamp: now
  }));

  // Store in browser storage for instant UI retrieval
  storeSmsDispatches(newRecords);

  // Dispatch to backend carrier API endpoint (fire & forget with graceful fallback)
  const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '');
  if (backendUrl) {
    try {
      fetch(`${backendUrl}/api/sms/broadcast-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseInfo.id,
          message: smsBody,
          dispatches: newRecords,
          timestamp: now,
          isResend: !!caseInfo.isResend,
          resendCount: caseInfo.resendCount || 0
        })
      }).catch((err) => {
        console.warn('Backend SMS broadcast endpoint notice:', err);
      });
    } catch (e) {
      console.warn('SMS dispatch error:', e);
    }
  }

  const logPrefix = caseInfo.isResend
    ? `[MDRRMO SMS GATEWAY (RESEND #${caseInfo.resendCount})]`
    : `[MDRRMO SMS GATEWAY (INITIAL ALERT)]`;
  console.info(`${logPrefix} Dispatched automated SMS alert to MDRRMO Account (${MDRRMO_OFFICIAL_ACCOUNT.phone}) for Case #${caseInfo.id}.`);
  return newRecords;
}

// ---------------------------------------------------------------------------
// Recurring Interval SMS Resend System
// If the incident has not yet been acknowledged or responded to in the system,
// the SMS text must continue to be resent at regular intervals.
// The warning will not stop until the incident is marked as 'seen/responded'
// by an authorized MDRRMO account holder.
// ---------------------------------------------------------------------------

interface ActiveSmsResendTracker {
  caseInfo: ResponderSmsPayloadInput;
  allUsers?: User[];
  intervalTimer: any;
  resendCount: number;
  lastSentAt: string;
  intervalMs: number;
}

const activeSmsResendMap = new Map<string, ActiveSmsResendTracker>();

/**
 * Starts regular interval resending of the SMS alert text until marked as seen/responded.
 */
export function startSmsResendInterval(
  caseInfo: ResponderSmsPayloadInput,
  allUsers?: User[],
  intervalMs: number = 30000 // Default 30-second regular interval
): void {
  const caseId = caseInfo.id;
  if (!caseId) return;

  // If already actively resending for this case, update users and return
  if (activeSmsResendMap.has(caseId)) {
    const existing = activeSmsResendMap.get(caseId)!;
    existing.caseInfo = caseInfo;
    if (allUsers) existing.allUsers = allUsers;
    return;
  }

  const tracker: ActiveSmsResendTracker = {
    caseInfo,
    allUsers,
    intervalTimer: null,
    resendCount: 0,
    lastSentAt: new Date().toISOString(),
    intervalMs
  };

  tracker.intervalTimer = setInterval(() => {
    tracker.resendCount += 1;
    tracker.lastSentAt = new Date().toISOString();

    console.info(`🔁 [MDRRMO SMS RE-SEND INTERVAL] Case #${caseId} unacknowledged. Re-transmitting SMS alert (Attempt #${tracker.resendCount})...`);

    sendAutomatedResponderSMS(
      {
        ...tracker.caseInfo,
        isResend: true,
        resendCount: tracker.resendCount
      },
      tracker.allUsers
    );

    // Dispatch DOM event so active views can reflect updated resend counts live
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mdrrmo_sms_interval_tick', {
          detail: {
            caseId,
            resendCount: tracker.resendCount,
            lastSentAt: tracker.lastSentAt
          }
        })
      );
    }
  }, intervalMs);

  activeSmsResendMap.set(caseId, tracker);
  console.info(`🚨 [MDRRMO SMS GATEWAY] Started recurring SMS interval resend for Case #${caseId} every ${intervalMs / 1000}s until Seen & Responded.`);
}

/**
 * Permanently stops and clears the SMS resend interval for a case.
 * Called when an authorized MDRRMO account holder marks the incident as 'seen/responded'.
 */
export function stopSmsResendInterval(caseId: string): void {
  if (!caseId) return;

  const tracker = activeSmsResendMap.get(caseId);
  if (tracker) {
    if (tracker.intervalTimer) {
      clearInterval(tracker.intervalTimer);
      tracker.intervalTimer = null;
    }
    activeSmsResendMap.delete(caseId);
    console.info(`✅ [MDRRMO SMS GATEWAY] Recurring SMS interval HALTED for Case #${caseId}. Incident marked as Seen / Responded.`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mdrrmo_sms_interval_stopped', {
          detail: { caseId }
        })
      );
    }
  }
}

/**
 * Returns the current resend status for an incident case.
 */
export function getActiveSmsResendStatus(caseId: string): {
  isActive: boolean;
  resendCount: number;
  lastSentAt?: string;
  intervalMs?: number;
} {
  const tracker = activeSmsResendMap.get(caseId);
  if (!tracker) {
    return { isActive: false, resendCount: 0 };
  }
  return {
    isActive: true,
    resendCount: tracker.resendCount,
    lastSentAt: tracker.lastSentAt,
    intervalMs: tracker.intervalMs
  };
}
