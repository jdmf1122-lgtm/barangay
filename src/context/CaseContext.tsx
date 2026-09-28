import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Case, AuditLog, ROXAS_BARANGAYS } from '../types';
import { supabase } from '../utils/supabaseClient';

export const sanitizeCaseBarangay = (rawCase: any): Case => {
  let b = rawCase.barangay;
  if (!ROXAS_BARANGAYS.includes(b as any)) {
    b = 'San Aquilino';
  }
  
  return {
    ...rawCase,
    barangay: b,
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
  const [cases, setCases] = useState<Case[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const [casesRes, logsRes] = await Promise.all([
          supabase.from('cases').select('*').order('dateCreated', { ascending: false }),
          supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
        ]);

        if (casesRes.data) {
          setCases(casesRes.data.map((c: any) => sanitizeCaseBarangay(c)));
        }
        if (logsRes.data) {
          setAuditLogs(logsRes.data as AuditLog[]);
        }
      } catch (err) {
        console.error('Error fetching cases/logs from Supabase:', err);
      }
    };

    fetchData();
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
