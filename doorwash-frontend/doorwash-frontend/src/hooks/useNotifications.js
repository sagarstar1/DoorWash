import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications);
      setUnreadCount(r.data.unreadCount);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(n => n.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(n => n.map(notif => notif._id === id ? { ...notif, isRead: true } : notif));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  return { notifications, unreadCount, loading, markAllRead, markRead, refetch: fetch };
}
