import { useEffect, useRef } from 'react';
import { useCases } from './useCases';
import { isCaseEligibleForEscalation, getEscalationConfig } from '../utils/escalationService';

/**
 * Background Escalation Monitor Hook
 * Continuously evaluates all active emergency incidents against the configured response deadline.
 * If MDRRMO has not acknowledged or updated the incident within the threshold, automatically triggers
 * the LGU escalation procedure (SMS dispatch, audit logging, status update, and notification).
 */
export function useEscalationMonitor(): void {
  const { cases, escalateIncidentToLgu } = useCases();
  const isRunningRef = useRef(false);

  useEffect(() => {
    const checkEscalations = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const config = getEscalationConfig();
        if (!config.enabled) return;

        const safeCases = cases || [];
        for (const c of safeCases) {
          if (isCaseEligibleForEscalation(c, config)) {
            console.warn(`⏱️ [AUTO-ESCALATION MONITOR] Case #${c.id} exceeded MDRRMO response deadline (${config.thresholdMinutes} mins). Triggering automated escalation to LGU...`);
            await escalateIncidentToLgu(c.id);
          }
        }
      } catch (err) {
        console.warn('Escalation monitor check notice:', err);
      } finally {
        isRunningRef.current = false;
      }
    };

    // Initial check on mount
    checkEscalations();

    // Check periodically every 12 seconds
    const intervalTimer = setInterval(() => {
      checkEscalations();
    }, 12000);

    const handleConfigUpdate = () => {
      checkEscalations();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('escalation_config_updated', handleConfigUpdate);
    }

    return () => {
      clearInterval(intervalTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('escalation_config_updated', handleConfigUpdate);
      }
    };
  }, [cases, escalateIncidentToLgu]);
}
