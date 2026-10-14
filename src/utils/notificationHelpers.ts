import { NotificationItem, User, Case, AgencyType, UserRole } from '../types';

/**
 * Determines whether a given notification belongs to the active user based on role, agency, barangay, and case ownership.
 */
export function isNotificationForUser(
  notif: NotificationItem,
  user: User,
  cases: Case[] = []
): boolean {
  if (!user || !notif) return false;

  const userAgencyType = user.agencyType;
  const userRole = user.role;
  const userBarangay = user.barangay;
  const userId = user.id;
  const userName = (user.name || '').toLowerCase();

  // Find related case if any
  const relatedCase = notif.caseId ? cases.find((c) => c.id === notif.caseId) : undefined;

  const isMdrrmoUser =
    userAgencyType === 'MDRRMO' ||
    userRole === 'MDRRMO_ADMIN' ||
    userRole === 'MDRRMO_OFFICER' ||
    (typeof userRole === 'string' && userRole.startsWith('MDRRMO')) ||
    (user.agencyName && user.agencyName.toUpperCase().includes('MDRRMO'));

  // 1. Direct User targeting exclusivity:
  // If explicitly targeted to a specific userId, ONLY that user may receive it.
  if (notif.targetUserId) {
    return notif.targetUserId === userId;
  }

  // 2. Direct Resident Name match exclusivity:
  // If targeted to a specific resident name, ONLY that resident may receive it.
  if (notif.targetResidentName) {
    if (userAgencyType !== 'RESIDENT' && userRole !== 'RESIDENT') return false;
    return (notif.targetResidentName || '').toLowerCase() === userName;
  }

  // 3. Exclusivity check on targetAgencyTypes:
  // If targetAgencyTypes is explicitly specified, the active user's agencyType must be included.
  if (notif.targetAgencyTypes && notif.targetAgencyTypes.length > 0) {
    const isTargeted = 
      notif.targetAgencyTypes.includes(userAgencyType) ||
      (isMdrrmoUser && notif.targetAgencyTypes.includes('MDRRMO')) ||
      (userAgencyType === 'ADMIN' && notif.targetAgencyTypes.includes('ADMIN'));
    if (!isTargeted && userRole !== 'SYSTEM_ADMIN') {
      return false;
    }
  }

  // 4. Exclusivity check on targetAgency string:
  if (notif.targetAgency) {
    const targetAg = notif.targetAgency.toUpperCase();
    if (targetAg === 'RESIDENT' && userAgencyType !== 'RESIDENT') return false;
    if (targetAg === 'MDRRMO' && !isMdrrmoUser) return false;
    if (targetAg === 'LGU' && userAgencyType !== 'LGU' && userRole !== 'SYSTEM_ADMIN') return false;
    if (targetAg === 'ADMIN' && userAgencyType !== 'ADMIN' && userRole !== 'SYSTEM_ADMIN') return false;
  }

  // 5. Exclusivity check on targetRoles:
  if (notif.targetRoles && notif.targetRoles.length > 0) {
    if (!notif.targetRoles.includes(userRole) && userRole !== 'SYSTEM_ADMIN') {
      return false;
    }
  }

  // ----------------------------------------------------
  // RESIDENT ROLE FILTERING ("Residents only & own barangay only")
  // ----------------------------------------------------
  if (userAgencyType === 'RESIDENT' || userRole === 'RESIDENT') {
    // A. Residents MUST NEVER see internal officer accounts or administrative system provisions
    const titleLower = (notif.title || '').toLowerCase();
    const msgLower = (notif.message || '').toLowerCase();

    if (
      titleLower.includes('account registered') ||
      titleLower.includes('new account') ||
      titleLower.includes('account created') ||
      titleLower.includes('new user') ||
      titleLower.includes('officer authorized') ||
      titleLower.includes('system account') ||
      msgLower.includes('has been authorized in the b-connect network') ||
      msgLower.includes('registered new official user account') ||
      msgLower.includes('provisioned')
    ) {
      return false;
    }

    // B. Strict Barangay Isolation for Residents:
    // If targeted to a specific barangay and NOT 'ALL', it MUST match this resident's home barangay.
    if (notif.targetBarangay && notif.targetBarangay !== 'ALL') {
      if (!userBarangay || notif.targetBarangay !== userBarangay) {
        return false;
      }
    }

    // C. Check if related to a case filed by or directly involving this resident
    if (relatedCase) {
      // Must be in resident's barangay
      if (userBarangay && relatedCase.barangay && relatedCase.barangay !== userBarangay) {
        return false;
      }

      const isReporter =
        (relatedCase.residentReporterId && relatedCase.residentReporterId === userId) ||
        (relatedCase.createdBy && relatedCase.createdBy.toLowerCase().includes(userName)) ||
        (relatedCase.complainants && relatedCase.complainants.some((c) => (c.name && c.name.toLowerCase() === userName) || c.id === userId));

      const isPersonInvolved =
        Boolean(relatedCase.personsInvolved &&
        relatedCase.personsInvolved.some((p) => (p.name && p.name.toLowerCase() === userName) || p.id === userId));

      if (isReporter || isPersonInvolved) {
        return true;
      }

      // If not reporter or person involved, residents don't see another resident's private case updates
      return false;
    }

    // D. Community advisory for resident's barangay (or municipal-wide 'ALL' / untargeted)
    if (notif.type === 'advisory') {
      if (!notif.targetBarangay || notif.targetBarangay === 'ALL' || notif.targetBarangay === userBarangay) {
        return true;
      }
      return false;
    }

    // E. Targeted explicitly to residents
    if (
      notif.targetAgencyTypes?.includes('RESIDENT') ||
      notif.targetRoles?.includes('RESIDENT') ||
      notif.targetAgency === 'RESIDENT'
    ) {
      return true;
    }

    return false;
  }

  // ----------------------------------------------------
  // MDRRMO OFFICIAL / RESPONDER ROLE FILTERING ("MDRRMO municipal-wide")
  // Any account registered as MDRRMO receives all resident reports across all barangays
  // ----------------------------------------------------
  if (isMdrrmoUser) {
    // Must NEVER see private summons or resident personal tracking targeted to another user
    if (notif.targetAgencyTypes?.length === 1 && notif.targetAgencyTypes[0] === 'RESIDENT' && notif.targetUserId) {
      return false;
    }
    if (notif.targetAgency === 'RESIDENT' && notif.targetUserId) {
      return false;
    }

    // Must NEVER see LGU-only internal administrative memos
    if (notif.targetAgencyTypes?.length === 1 && notif.targetAgencyTypes[0] === 'LGU' && !notif.isAccidentEmergency) {
      return false;
    }
    if (notif.targetAgency === 'LGU' && !notif.isAccidentEmergency) {
      return false;
    }

    // Emergency accident alerts, resident reports, sirens, and dispatches are always delivered to MDRRMO
    if (
      notif.isAccidentEmergency ||
      (notif as any).isMdrrmoIncident ||
      (notif as any).isMdrrmoEmergency ||
      notif.targetAgencyTypes?.includes('MDRRMO') ||
      notif.targetAgency === 'MDRRMO' ||
      notif.targetAgency === user.agencyName ||
      notif.priority === 'urgent'
    ) {
      // MDRRMO operates municipal-wide across all barangays of Roxas without restriction
      return true;
    }

    // Related case handled by or involving MDRRMO (or any incident report filed by a resident)
    if (relatedCase) {
      const catLower = String(relatedCase.category || '').toLowerCase();
      const origAg = relatedCase.originatingAgency || '';
      const currAg = relatedCase.currentHandlingAgency || '';
      const isMdrrmoRelevantCase =
        Boolean(relatedCase.isCitizenReport) ||
        Boolean(relatedCase.isAccidentEmergency) ||
        catLower.includes('accident') ||
        catLower.includes('vehicular') ||
        origAg.includes('MDRRMO') ||
        origAg.includes('Resident') ||
        origAg.includes('Traffic') ||
        currAg.includes('MDRRMO') ||
        relatedCase.priority === 'Urgent';

      if (isMdrrmoRelevantCase) {
        return true;
      }
    }

    return false;
  }

  // ----------------------------------------------------
  // LGU / MUNICIPAL EXECUTIVE & ADMIN FILTERING ("Municipal LGU only")
  // ----------------------------------------------------
  if (userAgencyType === 'LGU' || userRole === 'LGU_ADMINISTRATOR' || userRole === 'LGU_OFFICER') {
    // Must NEVER see resident-only private advisories or individual citizen summons
    if (notif.targetAgencyTypes?.length === 1 && notif.targetAgencyTypes[0] === 'RESIDENT') {
      return false;
    }
    if (notif.targetAgency === 'RESIDENT') {
      return false;
    }

    // Must NEVER see MDRRMO-only responder dispatches or sirens
    if (notif.targetAgencyTypes?.length === 1 && notif.targetAgencyTypes[0] === 'MDRRMO') {
      return false;
    }
    if (notif.targetAgency === 'MDRRMO') {
      return false;
    }
    if (notif.isAccidentEmergency && !notif.targetAgencyTypes?.includes('LGU')) {
      return false;
    }

    // Targeted specifically to LGU or Municipal Executive
    if (
      notif.targetAgencyTypes?.includes('LGU') ||
      notif.targetAgency === 'LGU' ||
      (notif.targetAgency && notif.targetAgency.toLowerCase().includes('lgu')) ||
      (notif.targetAgency && notif.targetAgency.toLowerCase().includes('municipal'))
    ) {
      return true;
    }

    // LGU administrators also oversee administrative system alerts if targeted to ADMIN
    if (
      (userRole === 'LGU_ADMINISTRATOR') &&
      (notif.targetAgencyTypes?.includes('ADMIN') || notif.targetAgency === 'ADMIN' || notif.type === 'system')
    ) {
      return true;
    }

    // Related case involving LGU governance, cross-barangay disputes, or inter-agency referrals
    if (relatedCase) {
      const cat = String(relatedCase.category || '');
      const origAg = relatedCase.originatingAgency || '';
      const isLguCase =
        Boolean((relatedCase as any).isInterAgency) ||
        cat.includes('Nuisance') ||
        cat.includes('Boundary') ||
        origAg.includes('LGU') ||
        origAg.includes('Municipal');

      if (isLguCase) {
        return true;
      }
    }

    return false;
  }

  // ----------------------------------------------------
  // SYSTEM ADMIN ROLE FILTERING
  // ----------------------------------------------------
  if (userAgencyType === 'ADMIN' || userRole === 'SYSTEM_ADMIN') {
    return true;
  }

  return false;
}

/**
 * Filters a notification list for a specific active user.
 */
export function filterNotificationsForUser(
  notifications: NotificationItem[],
  user: User,
  cases: Case[] = []
): NotificationItem[] {
  if (!notifications || !Array.isArray(notifications)) return [];
  return notifications.filter((n) => isNotificationForUser(n, user, cases));
}

/**
 * Returns role-specific UI descriptors for the Notification Center dropdown/button.
 */
export function getRoleNotificationMeta(agencyType: AgencyType, barangay?: string): {
  centerTitle: string;
  badgeLabel: string;
  subHeader: string;
  themeColor: string;
  borderBadge: string;
  emptyMessage: string;
  quickFilters: { id: string; label: string }[];
} {
  switch (agencyType) {
    case 'RESIDENT':
      return {
        centerTitle: 'Citizen Notification Center',
        badgeLabel: `Resident • Brgy. ${barangay || 'San Aquilino'}`,
        subHeader: 'Real-time hearing summons, Lupon milestones, and report status',
        themeColor: 'bg-emerald-600 text-white',
        borderBadge: 'border-emerald-300 bg-emerald-50 text-emerald-800',
        emptyMessage: 'No active incident alerts or hearings for your submitted reports.',
        quickFilters: [
          { id: 'ALL', label: 'All Alerts' },
          { id: 'CASES', label: 'My Report Updates' },
          { id: 'HEARINGS', label: 'Lupon Summons' },
          { id: 'ADVISORIES', label: 'Community Notices' }
        ]
      };
    case 'MDRRMO':
      return {
        centerTitle: 'MDRRMO Emergency & Rescue Alerts',
        badgeLabel: barangay ? `MDRRMO • Sector ${barangay}` : 'MDRRMO Roxas Operations',
        subHeader: 'Incoming vehicular accidents, rescue ambulance dispatches, and crash blotter triage',
        themeColor: 'bg-orange-700 text-white',
        borderBadge: 'border-orange-300 bg-orange-50 text-orange-900',
        emptyMessage: 'No active emergency dispatch alerts.',
        quickFilters: [
          { id: 'ALL', label: 'All Alerts' },
          { id: 'ACCIDENTS', label: 'Vehicular Crashes' },
          { id: 'DISPATCH', label: 'Ambulance Trips' },
          { id: 'REFERRALS', label: 'Inter-Agency' }
        ]
      };
    case 'LGU':
      return {
        centerTitle: 'LGU Municipal Administrator & Executive Feed',
        badgeLabel: 'Municipal Government of Roxas',
        subHeader: 'Cross-barangay dispute referrals, directives, and municipal permits',
        themeColor: 'bg-emerald-700 text-white',
        borderBadge: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        emptyMessage: 'No pending municipal action items or administrative directives.',
        quickFilters: [
          { id: 'ALL', label: 'All LGU Alerts' },
          { id: 'REFERRALS', label: 'Referrals' },
          { id: 'DIRECTIVES', label: 'Directives & Oversight' }
        ]
      };
    case 'ADMIN':
    default:
      return {
        centerTitle: 'System Administration & Security Ledger',
        badgeLabel: 'B-CONNECT Network Admin Node',
        subHeader: 'Officer account registrations, system audits, and database events',
        themeColor: 'bg-slate-900 text-white',
        borderBadge: 'border-slate-300 bg-slate-100 text-slate-900',
        emptyMessage: 'No system security anomalies or pending administrative approvals.',
        quickFilters: [
          { id: 'ALL', label: 'All Network Alerts' },
          { id: 'ACCOUNTS', label: 'Account Registrations' },
          { id: 'SYSTEM', label: 'System Audits' }
        ]
      };
  }
}
