import { useContext, useMemo } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { CaseContext } from '../context/CaseContext';
import { filterNotificationsForUser } from '../utils/notificationHelpers';
import { supabase } from '../utils/supabaseClient';
import { NotificationItem, AgencyType, UserRole } from '../types';

export const useNotifications = () => {
  const notifState = useContext(NotificationContext);
  const authState = useContext(AuthContext);
  const caseState = useContext(CaseContext);

  if (!notifState) throw new Error('useNotifications must be used within NotificationProvider');

  const { notifications, setNotifications } = notifState;
  
  // These dependencies are optional in case we use useNotifications outside CaseProvider
  const currentUser = authState?.currentUser;
  const cases = caseState?.cases || [];

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return filterNotificationsForUser(notifications, currentUser, cases);
  }, [notifications, currentUser, cases]);

  const unreadNotifCount = useMemo(() => {
    return (userNotifications || []).filter((n) => !n.isRead).length;
  }, [userNotifications]);

  const triggerNotification = (
    title: string, message: string, type: NotificationItem['type'] = 'system', caseId?: string, targetAgency?: string, priority: 'normal' | 'high' | 'urgent' = 'normal', options?: any
  ) => {
    const uniqueId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotif: NotificationItem = {
      id: uniqueId, title, message, type, caseId, timestamp: new Date().toISOString(), isRead: false, targetAgency, priority, ...options
    };
    setNotifications((prev) => [newNotif, ...(prev || [])]);
    supabase.from('notifications').insert(newNotif).then(({error}) => { if (error) console.error(error) });

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('bconnect_notifs_sync');
        bc.postMessage({ type: 'NEW_NOTIFICATION', payload: newNotif });
        bc.close();
      } catch (e) {}
    }
    try {
      supabase.channel('notifications_realtime_sync').send({
        type: 'broadcast',
        event: 'notif_event',
        payload: { type: 'NEW_NOTIFICATION', data: newNotif }
      });
    } catch (e) {}
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    supabase.from('notifications').update({ isRead: true }).eq('id', id).then(({error}) => { if (error) console.error(error) });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    supabase.from('notifications').update({ isRead: true }).eq('isRead', false).then(({error}) => { if (error) console.error(error) });
  };

  return {
    ...notifState,
    userNotifications,
    unreadNotifCount,
    triggerNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };
};
