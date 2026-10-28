import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationApi } from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async (silent = false) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      if (!silent) setLoading(true);
      const res = await notificationApi.getNotifications({ page: 0, size: 20 });
      const pageData = res.data?.data;
      const list = pageData?.content || [];
      setNotifications(list);
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (!isAuthenticated) return;

    // Real-time polling every 5 seconds
    const intervalId = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
      console.warn('Error marking all notifications read:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      await fetchNotifications();
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
