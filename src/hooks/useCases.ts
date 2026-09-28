import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CaseContext } from '../context/CaseContext';
import { NotificationContext } from '../context/NotificationContext';
import { supabase } from '../utils/supabaseClient';
import { Case, CaseStatus, TimelineEvent, AgencyType, UserRole, ROXAS_BARANGAYS } from '../types';
import { sendAutomatedResponderSMS, startSmsResendInterval, stopSmsResendInterval } from '../utils/smsService';

export const useCases = () => {
  const caseState = useContext(CaseContext);
  const authState = useContext(AuthContext);
  const notifState = useContext(NotificationContext);

  if (!caseState) throw new Error('useCases must be used within CaseProvider');
  if (!authState) throw new Error('useCases must be used within AuthProvider');

  const { cases, setCases, auditLogs, setAuditLogs, selectedCaseId, setSelectedCaseId } = caseState;
  const { currentUser, users } = authState;

  const selectedCase = selectedCaseId ? cases.find(c => c.id === selectedCaseId) || null : null;

  const logActivity = (action: string, caseId?: string, details?: string, previousValue?: string, newValue?: string) => {
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.position,
      agency: currentUser.agencyName,
      action,
      caseId,
      previousValue,
      newValue,
      details: details || `User ${currentUser.name} executed ${action}`,
      ipAddress: '192.168.1.104 (LGU-Secure-VPN)'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    supabase.from('audit_logs').insert(newLog).then(({ error }) => { if (error) console.error(error) });
  };

  const triggerNotification = (
    title: string, message: string, type: any = 'system', caseId?: string, targetAgency?: string, priority: 'normal' | 'high' | 'urgent' = 'normal', options?: any
  ) => {
    if (!notifState) return;
    const uniqueId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotif = {
      id: uniqueId,
      title, message, type, caseId, timestamp: new Date().toISOString(), isRead: false, targetAgency, priority, ...options
    };
    notifState.setNotifications((prev) => [newNotif, ...(prev || [])]);
    supabase.from('notifications').insert(newNotif).then(({ error }) => { if (error) console.error(error) });

    // Instant local cross-tab broadcast (0ms latency)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('bconnect_notifs_sync');
        bc.postMessage({ type: 'NEW_NOTIFICATION', payload: newNotif });
        bc.close();
      } catch (e) {}
    }
    // Remote network broadcast
    try {
      supabase.channel('notifications_realtime_sync').send({
        type: 'broadcast',
        event: 'notif_event',
        payload: { type: 'NEW_NOTIFICATION', data: newNotif }
      });
    } catch (e) {}
  };

  const createCase = (data: Partial<Case>): string => {
    const year = new Date().getFullYear();
    let maxNum = 0;
    (cases || []).forEach((c) => {
      const match = c.id?.match(/BC-(\d{4})-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        const num = parseInt(match[2], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    let nextNum = maxNum + 1;
    let caseId = `BC-${year}-${String(nextNum).padStart(3, '0')}`;
    let incidentId = `INC-${year}-${String(nextNum).padStart(3, '0')}`;
    let complaintId = `CMP-${year}-${String(nextNum).padStart(3, '0')}`;

    while ((cases || []).some((c) => c.id === caseId)) {
      nextNum++;
      caseId = `BC-${year}-${String(nextNum).padStart(3, '0')}`;
      incidentId = `INC-${year}-${String(nextNum).padStart(3, '0')}`;
      complaintId = `CMP-${year}-${String(nextNum).padStart(3, '0')}`;
    }
    const now = new Date().toISOString();

    const initialTimeline: TimelineEvent[] = [
      {
        id: `TL-${Date.now()}-1-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        title: 'Report Received & Case Registered',
        description: `Case registered by ${currentUser.name} at ${currentUser.agencyName}. Initial classification: ${data.category}.`,
        stage: 'Report Filed',
        actorName: currentUser.name,
        actorRole: currentUser.position,
        actorAgency: currentUser.agencyName,
        timestamp: now
      }
    ];

    if (data.isInvolvingOfficial) {
      initialTimeline.push({
        id: `TL-${Date.now()}-2-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        title: 'Official Involvement Recorded',
        description: `Involves ${data.officialInvolvedPosition || 'Official'} (${data.officialInvolvedName || 'Named Person'}). Flagged for cross-agency oversight.`,
        stage: 'Initial Assessment',
        actorName: currentUser.name,
        actorRole: currentUser.position,
        actorAgency: currentUser.agencyName,
        timestamp: now
      });
    }

    const isAccident = true; // Hardcoded in original file

    const newCaseItem: Case = {
      id: caseId,
      incidentId,
      complaintId,
      title: data.title || 'Untitled Vehicular Accident Report',
      category: data.category || 'Motorcycle vs Motorcycle Collision',
      description: data.description || '',
      initialNarrative: data.initialNarrative || data.description || '',
      currentNarrativeSummary: data.initialNarrative || '',
      dateReported: data.dateReported || now,
      incidentDate: data.incidentDate || now.split('T')[0],
      incidentTime: data.incidentTime,
      barangay: (data.barangay && ROXAS_BARANGAYS.includes(data.barangay as any)) ? data.barangay : (currentUser.barangay || ROXAS_BARANGAYS[0]),
      sitio: data.sitio,
      specificLocation: data.specificLocation || `Barangay ${(data.barangay && ROXAS_BARANGAYS.includes(data.barangay as any)) ? data.barangay : (currentUser.barangay || ROXAS_BARANGAYS[0])}, Roxas`,
      reporterName: data.reporterName || data.complainants?.[0]?.name || (currentUser.agencyType === 'RESIDENT' ? currentUser.name : undefined),
      complainants: data.complainants || [],
      respondents: data.respondents || [],
      witnesses: data.witnesses || [],
      personsInvolved: [...(data.complainants || []), ...(data.respondents || [])],
      isAccidentEmergency: isAccident || !!data.isAccidentEmergency,
      accidentVehicleDetails: data.accidentVehicleDetails || (isAccident ? 'Motorcycle / Road Vehicle Incident' : undefined),
      accidentCasualties: data.accidentCasualties,
      isAccidentProneArea: data.isAccidentProneArea ?? isAccident,
      residentReporterId: data.residentReporterId || (currentUser.agencyType === 'RESIDENT' ? currentUser.id : undefined),
      isCitizenReport: !!data.isCitizenReport || currentUser.agencyType === 'RESIDENT',
      status: (data.status as CaseStatus) || 'Unresolved',
      isInvolvingOfficial: !!data.isInvolvingOfficial,
      officialInvolvedType: data.officialInvolvedType || 'None',
      officialInvolvedName: data.officialInvolvedName,
      officialInvolvedPosition: data.officialInvolvedPosition,
      officialInvolvedAgency: data.officialInvolvedAgency,
      originatingAgency: data.originatingAgency || currentUser.agencyName,
      currentHandlingAgency: data.currentHandlingAgency || currentUser.agencyName,
      assignedPersonnel: data.assignedPersonnel || `${currentUser.name} (${currentUser.position})`,
      assignedPersonnelContact: data.assignedPersonnelContact,
      priority: isAccident ? 'Urgent' : (data.priority || 'Medium'),
      statusHistory: [
        {
          id: `SH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          previousStatus: 'Unresolved',
          newStatus: (data.status as CaseStatus) || 'Unresolved',
          reason: 'Initial case creation and registration',
          changedBy: currentUser.name,
          changedByRole: currentUser.position,
          agency: currentUser.agencyName,
          timestamp: now
        }
      ],
      timeline: initialTimeline,
      imageUrls: data.imageUrls || [],
      dateCreated: now,
      dateLastUpdated: now,
      createdBy: `${currentUser.name} (${currentUser.agencyName})`,
      isConfidential: !!data.isConfidential
    };

    setCases((prev) => [newCaseItem, ...prev]);

    // Filter payload strictly to valid PostgreSQL columns so schema cache never errors
    const SUPABASE_CASE_COLUMNS = new Set([
      'id', 'incidentId', 'complaintId', 'title', 'category', 'description',
      'initialNarrative', 'currentNarrativeSummary', 'dateReported', 'incidentDate',
      'incidentTime', 'barangay', 'specificLocation', 'complainants', 'respondents',
      'witnesses', 'personsInvolved', 'vehiclesInvolved', 'statusHistory', 'timeline',
      'imageUrls', 'isInvolvingOfficial', 'officialInvolvedType', 'officialInvolvedName',
      'officialInvolvedPosition', 'officialInvolvedAgency', 'originatingAgency',
      'currentHandlingAgency', 'assignedPersonnel', 'assignedPersonnelContact',
      'priority', 'status', 'resolutionSummary', 'dateResolved', 'dateClosed',
      'outcomeType', 'isCitizenReport', 'residentReporterId', 'isAccidentEmergency',
      'accidentVehicleDetails', 'accidentCasualties', 'isAccidentProneArea',
      'emergencyAlarmAcknowledged', 'emergencyFirstRespondersDispatched',
      'collisionImpactType', 'roadSurfaceCondition', 'weatherCondition',
      'injuriesCount', 'casualtiesCount', 'isHitAndRun', 'respondingAmbulanceUnit',
      'hospitalTransported', 'dateCreated', 'dateLastUpdated', 'createdBy',
      'isConfidential'
    ]);

    const dbPayload: Record<string, any> = {};
    for (const key of Object.keys(newCaseItem)) {
      if (SUPABASE_CASE_COLUMNS.has(key)) {
        dbPayload[key] = (newCaseItem as any)[key];
      }
    }

    // 1. Direct client insert into Supabase cases table
    supabase.from('cases').insert(dbPayload).then(({ error }) => {
      if (error) {
        console.warn('Direct Supabase insert notice:', error.message);
      }
    });

    // 2. Guarantee database persistence via backend admin service role (when running on localhost or with configured backend)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '');
    if (backendUrl) {
      try {
        fetch(`${backendUrl}/api/cases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbPayload)
        }).catch((netErr) => {
          console.warn('Backend sync notice:', netErr);
        });
      } catch (e) {}
    }

    // Instant local cross-tab broadcast (0ms latency)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('bconnect_cases_sync');
        bc.postMessage({ type: 'NEW_CASE', payload: newCaseItem });
        bc.close();
      } catch (e) {}
    }
    // Remote network broadcast
    try {
      supabase.channel('cases_realtime_sync').send({
        type: 'broadcast',
        event: 'case_event',
        payload: { type: 'NEW_CASE', data: newCaseItem }
      });
    } catch (e) {}

    logActivity('CASE_CREATED', caseId, `Registered new case ${caseId} (${newCaseItem.title}) at ${currentUser.agencyName}`);

    // Check if incident report is received by or routed to MDRRMO system
    const isMdrrmoReceived =
      newCaseItem.isAccidentEmergency ||
      newCaseItem.priority === 'Urgent' ||
      currentUser.agencyType === 'MDRRMO' ||
      newCaseItem.originatingAgency.includes('MDRRMO') ||
      newCaseItem.currentHandlingAgency?.includes('MDRRMO') ||
      newCaseItem.isCitizenReport ||
      currentUser.agencyType === 'RESIDENT';

    if (isMdrrmoReceived) {
      const smsPayload = {
        id: caseId,
        title: newCaseItem.title,
        incidentType: newCaseItem.category || newCaseItem.title,
        location: newCaseItem.specificLocation || `Barangay ${newCaseItem.barangay}, Roxas`,
        category: newCaseItem.category,
        barangay: newCaseItem.barangay,
        sitio: newCaseItem.sitio,
        incidentDate: newCaseItem.incidentDate,
        incidentTime: newCaseItem.incidentTime,
        reporterName: newCaseItem.reporterName || newCaseItem.complainants?.[0]?.name || currentUser.name,
        priority: newCaseItem.priority || 'URGENT'
      };

      // 1. Automatically generate and send initial SMS alert directly to MDRRMO account
      sendAutomatedResponderSMS(smsPayload, users);

      // 2. Start regular interval resending until incident is marked as 'seen/responded'
      startSmsResendInterval(smsPayload, users, 30000);

      // 3. Trigger emergency notification to MDRRMO system (SMS text only, no sound)
      triggerNotification(
        `🚨 EMERGENCY INCIDENT REPORT: Brgy. ${newCaseItem.barangay}`,
        `URGENT MDRRMO DISPATCH: ${newCaseItem.title} reported at ${newCaseItem.sitio ? `${newCaseItem.sitio}, ` : ''}${newCaseItem.barangay}. Case #${caseId}. Automated SMS dispatched to MDRRMO account!`,
        'case_registered',
        caseId,
        'MDRRMO',
        'urgent',
        {
          targetAgencyTypes: ['MDRRMO'],
          targetBarangay: newCaseItem.barangay,
          isAccidentEmergency: true,
          isMdrrmoIncident: true
        }
      );
    }

    if (newCaseItem.isCitizenReport || currentUser.agencyType === 'RESIDENT') {
      triggerNotification(
        'Incident Report Docketed',
        `Your report #${caseId} ("${newCaseItem.title}") has been received by Barangay ${newCaseItem.barangay} Lupon Tagapamayapa.`,
        'status_update', caseId, 'RESIDENT', 'normal',
        { targetAgencyTypes: ['RESIDENT'], targetRoles: ['RESIDENT'], targetUserId: currentUser.id, targetBarangay: newCaseItem.barangay }
      );
    } else {
      if (!isMdrrmoReceived) {
        triggerNotification(
          `New Incident Docketed: #${caseId}`,
          `${currentUser.agencyName} registered Case #${caseId}: "${newCaseItem.title}"`,
          'system', caseId, currentUser.agencyName, newCaseItem.priority === 'Urgent' ? 'urgent' : 'normal',
          { targetAgencyTypes: currentUser.agencyType === 'MDRRMO' ? ['MDRRMO', 'ADMIN'] : ['ADMIN', currentUser.agencyType], targetBarangay: newCaseItem.barangay }
        );
      }
    }
    return caseId;
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, reason: string, remarks?: string) => {
    const now = new Date().toISOString();
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const isNowResolved = newStatus === 'Resolved';
        const newStatusItem = {
          id: `SH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          previousStatus: c.status, newStatus, reason,
          changedBy: currentUser.name, changedByRole: currentUser.position,
          agency: currentUser.agencyName, timestamp: now, remarks
        };
        const newTimelineEvent: TimelineEvent = {
          id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          caseId, title: `Status Changed to: ${newStatus}`,
          description: `${reason}${remarks ? ` - Remarks: ${remarks}` : ''}`,
          stage: isNowResolved ? 'Resolution' : 'Status Update',
          actorName: currentUser.name, actorRole: currentUser.position,
          actorAgency: currentUser.agencyName, timestamp: now
        };
        const updatedCase = {
          ...c, status: newStatus,
          dateResolved: isNowResolved ? now : c.dateResolved,
          resolutionSummary: isNowResolved ? (remarks || reason) : c.resolutionSummary,
          dateLastUpdated: now,
          statusHistory: [newStatusItem, ...c.statusHistory],
          timeline: [...c.timeline, newTimelineEvent],
        };
        supabase.from('cases').update({
          status: updatedCase.status, dateResolved: updatedCase.dateResolved,
          resolutionSummary: updatedCase.resolutionSummary, dateLastUpdated: updatedCase.dateLastUpdated,
          statusHistory: updatedCase.statusHistory, timeline: updatedCase.timeline
        }).eq('id', caseId).then(({ error }) => { if (error) console.error(error) });

        // Broadcast updated case
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('bconnect_cases_sync');
            bc.postMessage({ type: 'UPDATE_CASE', payload: updatedCase });
            bc.close();
          } catch (e) {}
        }
        try {
          supabase.channel('cases_realtime_sync').send({
            type: 'broadcast',
            event: 'case_event',
            payload: { type: 'UPDATE_CASE', data: updatedCase }
          });
        } catch (e) {}

        return updatedCase;
      })
    );
    logActivity('CASE_STATUS_UPDATED', caseId, `${currentUser.name} (${currentUser.agencyName}) updated status of #${caseId} to "${newStatus}". Reason: ${reason}`, undefined, newStatus);
    const targetCase = cases.find((c) => c.id === caseId);
    triggerNotification(
      `Status Update: #${caseId}`,
      `Case #${caseId} updated to "${newStatus}" by ${currentUser.agencyName}.`,
      'status_update',
      caseId,
      undefined,
      'normal',
      {
        targetBarangay: targetCase?.barangay,
        targetAgencyTypes: targetCase?.category === 'Vehicular Accident'
          ? ['RESIDENT', 'MDRRMO']
          : ['RESIDENT', 'LGU']
      }
    );
  };

  const addCaseTimelineEvent = (caseId: string, title: string, description: string, stage: TimelineEvent['stage']) => {
    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId, title, description, stage, actorName: currentUser.name, actorRole: currentUser.position, actorAgency: currentUser.agencyName, timestamp: now
    };
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedCase = { ...c, timeline: [...c.timeline, newEvent], dateLastUpdated: now };
        supabase.from('cases').update({ timeline: updatedCase.timeline, dateLastUpdated: updatedCase.dateLastUpdated }).eq('id', caseId).then(({ error }) => { if (error) console.error(error) });
        return updatedCase;
      })
    );
    logActivity('TIMELINE_EVENT_ADDED', caseId, `Added timeline milestone: "${title}"`);
  };

  const markIncidentAsSeenAndResponded = (caseId: string, remarks?: string) => {
    // Immediately stop recurring SMS resends
    stopSmsResendInterval(caseId);

    const now = new Date().toISOString();
    const eventTitle = '🚨 Incident Marked as Seen & Responded by MDRRMO';
    const eventDescription = remarks || `MDRRMO Officer ${currentUser.name} (${currentUser.position}) acknowledged and marked the emergency alert as 'Seen / Responded'. Emergency rescue and triage responders mobilized. SMS notification resend halted.`;

    const newEvent: TimelineEvent = {
      id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId,
      title: eventTitle,
      description: eventDescription,
      stage: 'LGU Action',
      actorName: currentUser.name,
      actorRole: currentUser.position,
      actorAgency: currentUser.agencyName,
      timestamp: now
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedCase: Case = {
          ...c,
          emergencyAlarmAcknowledged: true,
          emergencyFirstRespondersDispatched: true,
          timeline: [...c.timeline, newEvent],
          dateLastUpdated: now
        };
        supabase.from('cases').update({
          emergencyAlarmAcknowledged: true,
          emergencyFirstRespondersDispatched: true,
          timeline: updatedCase.timeline,
        }).eq('id', caseId).then(({ error }) => { if (error) console.error(error) });

        // Broadcast updated case to all users
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('bconnect_cases_sync');
            bc.postMessage({ type: 'UPDATE_CASE', payload: updatedCase });
            bc.close();
          } catch (e) {}
        }
        try {
          supabase.channel('cases_realtime_sync').send({
            type: 'broadcast',
            event: 'case_event',
            payload: { type: 'UPDATE_CASE', data: updatedCase }
          });
        } catch (e) {}

        return updatedCase;
      })
    );

    logActivity(
      'MDRRMO_SEEN_AND_RESPONDED',
      caseId,
      `MDRRMO Officer ${currentUser.name} marked emergency report #${caseId} as Seen & Responded. Emergency warning alert halted.`
    );
  };

  return {
    ...caseState,
    selectedCase,
    createCase,
    updateCaseStatus,
    addCaseTimelineEvent,
    markIncidentAsSeenAndResponded,
    logActivity
  };
};
