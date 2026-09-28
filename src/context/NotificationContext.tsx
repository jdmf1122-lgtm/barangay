import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { NotificationItem } from '../types';
import { supabase } from '../utils/supabaseClient';

export interface NotificationState {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const NotificationContext = createContext<NotificationState | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const notifsRes = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
        if (notifsRes.data && Array.isArray(notifsRes.data)) {
          const fetched = notifsRes.data as NotificationItem[];
          setNotifications((prev) => {
            const map = new Map<string, NotificationItem>();
            fetched.forEach((n) => map.set(n.id, n));
            prev.forEach((n) => {
              if (!map.has(n.id)) map.set(n.id, n);
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        }
      } catch (err) {
        console.error('Error fetching notifications from Supabase:', err);
      }
    };

    fetchData();

    // 1. Cross-tab BroadcastChannel for 0ms same-machine sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('bconnect_notifs_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_NOTIFICATION' && event.data.payload) {
            const newNotif = event.data.payload as NotificationItem;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });
          } else if (event.data?.type === 'UPDATE_NOTIFICATION' && event.data.payload) {
            const updated = event.data.payload as NotificationItem;
            setNotifications((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
          }
        };
      } catch (e) {
        console.warn('Notification BroadcastChannel notice:', e);
      }
    }

    // 2. Supabase Realtime channel for network & cross-device sync
    const realtimeChannel = supabase
      .channel('notifications_realtime_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new) {
          const incoming = payload.new as NotificationItem;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new) {
          const updated = payload.new as NotificationItem;
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
        }
      })
      .on('broadcast', { event: 'notif_event' }, ({ payload }) => {
        if (payload?.type === 'NEW_NOTIFICATION' && payload.data) {
          const incoming = payload.data as NotificationItem;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
        } else if (payload?.type === 'UPDATE_NOTIFICATION' && payload.data) {
          const updated = payload.data as NotificationItem;
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
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
    <NotificationContext.Provider value={{
      notifications,
      setNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
