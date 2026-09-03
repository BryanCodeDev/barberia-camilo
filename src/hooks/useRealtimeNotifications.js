import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

const useRealtimeNotifications = (userRole, userId, onNotification) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const lastCheckRef = useRef(null);

  const onNotificationRef = useRef(onNotification);
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  const fetchNotifications = useCallback(async () => {
    if (!userRole || !userId) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (lastCheckRef.current) {
        params.set('since', lastCheckRef.current);
      }
      const data = await api.get(`/admin/realtime-notifications${params.toString() ? `?${params.toString()}` : ''}`);
      if (Array.isArray(data)) {
        setNotifications((prev) => {
          const map = new Map();
          [...data, ...prev].forEach((n) => {
            if (!map.has(n.id)) map.set(n.id, n);
          });
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return merged;
        });
        setUnreadCount(data.filter((n) => !n.read_at).length);
        if (data.length > 0 && data[0].created_at) {
          lastCheckRef.current = data[0].created_at;
        }
        if (onNotificationRef.current && data.length > 0) {
          data.forEach((n) => onNotificationRef.current(n));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/admin/realtime-notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // handled by UI state
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/admin/realtime-notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // handled by UI state
    }
  }, []);

  return { notifications, unreadCount, loading, error, refresh: fetchNotifications, markAsRead, markAllAsRead };
};

export default useRealtimeNotifications;
