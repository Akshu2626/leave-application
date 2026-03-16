import { create } from 'zustand';
import { Notification } from '@/types';
import { notificationsApi } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await notificationsApi.getAll();
      const data = res.data?.data || res.data?.body || res.data || [];
      const notifications = Array.isArray(data) ? data : (data.records || []);
      set({
        notifications,
        unreadCount: notifications.filter((n: any) => !n.isRead).length,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  },

  markRead: async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      const notifications = get().notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      );
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllRead: async () => {
    try {
      await notificationsApi.markAllRead();
      const notifications = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
}));
