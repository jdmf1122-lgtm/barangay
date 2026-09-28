import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Case, AuditLog, ROXAS_BARANGAYS } from '../types';
import { supabase } from '../utils/supabaseClient';
import { SEED_CASES, SEED_AUDIT_LOGS } from '../data/seedData';

export const sanitizeCaseBarangay = (rawCase: any): Case => {
  let b = rawCase.barangay;
  if (!ROXAS_BARANGAYS.includes(b as any)) {
    b = 'San Aquilino';
  }

  let derivedTime = rawCase.incidentTime;
  if (!derivedTime && rawCase.dateReported) {
    try {
      const d = new Date(rawCase.dateReported);
      if (!isNaN(d.getTime())) {
        derivedTime = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {}
  }

  return {
    ...rawCase,
    barangay: b,
    incidentTime: derivedTime,
    personsInvolved: Array.isArray(rawCase.personsInvolved) ? rawCase.personsInvolved.map((p: any) => ({
      ...p,
      barangay: ROXAS_BARANGAYS.includes(p.barangay as any) ? p.barangay : b
    })) : [],
    statusHistory: Array.isArray(rawCase.statusHistory) ? rawCase.statusHistory : []
  };
};

export interface CaseState {
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  selectedCaseId: string | null;
  setSelectedCaseId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const CaseContext = createContext<CaseState | undefined>(undefined);

export const CaseProvider: React.FC<{ children: ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const [cases, setCases] = useState<Case[]>(SEED_CASES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const [casesRes, logsRes] = await Promise.all([
          supabase.from('cases').select('*').order('dateCreated', { ascending: false }),
          supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
        ]);

        if (casesRes.data && Array.isArray(casesRes.data)) {
          const sanitized = casesRes.data.map((c: any) => sanitizeCaseBarangay(c));
          setCases((prev) => {
            const map = new Map<string, Case>();
            sanitized.forEach((c) => map.set(c.id, c));
            prev.forEach((c) => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            return Array.from(map.values()).sort((a, b) => 
              new Date(b.dateCreated || b.dateReported).getTime() - new Date(a.dateCreated || a.dateReported).getTime()
            );
          });
        }
        if (logsRes.data && Array.isArray(logsRes.data)) {
          setAuditLogs(logsRes.data as AuditLog[]);
        }
      } catch (err) {
        console.error('Error fetching cases/logs from Supabase:', err);
      }
    };

    fetchData();

    // 1. Cross-tab BroadcastChannel for 0ms same-machine sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('bconnect_cases_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_CASE' && event.data.payload) {
            const incoming = sanitizeCaseBarangay(event.data.payload);
            setCases((prev) => {
              if (prev.some((c) => c.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
          } else if (event.data?.type === 'UPDATE_CASE' && event.data.payload) {
            const updated = sanitizeCaseBarangay(event.data.payload);
            setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel notice:', e);
      }
    }

    // 2. Supabase Realtime channel for cross-network and cross-device sync
    const realtimeChannel = supabase
      .channel('cases_realtime_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cases' }, (payload) => {
        if (payload.new) {
          const incoming = sanitizeCaseBarangay(payload.new);
          setCases((prev) => {
            if (prev.some((c) => c.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cases' }, (payload) => {
        if (payload.new) {
          const updated = sanitizeCaseBarangay(payload.new);
          setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cases' }, (payload) => {
        if (payload.old?.id) {
          setCases((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .on('broadcast', { event: 'case_event' }, ({ payload }) => {
        if (payload?.type === 'NEW_CASE' && payload.data) {
          const incoming = sanitizeCaseBarangay(payload.data);
          setCases((prev) => {
            if (prev.some((c) => c.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
        } else if (payload?.type === 'UPDATE_CASE' && payload.data) {
          const updated = sanitizeCaseBarangay(payload.data);
          setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }
      })
      .subscribe();

    // 3. Periodic fallback poll every 4 seconds
    const intervalTimer = setInterval(() => {
      fetchData();
    }, 4000);

    return () => {
      if (bc) bc.close();
      supabase.removeChannel(realtimeChannel);
      clearInterval(intervalTimer);
    };
  }, [isAuthenticated]);

  return (
    <CaseContext.Provider value={{
      cases,
      setCases,
      auditLogs,
      setAuditLogs,
      selectedCaseId,
      setSelectedCaseId
    }}>
      {children}
    </CaseContext.Provider>
  );
};
