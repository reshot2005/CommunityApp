import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  deleteNotification as deleteNotificationRequest,
  fetchNotifications,
  markAllNotificationsRead as markAllNotificationsReadRequest,
  markNotificationRead as markNotificationReadRequest,
  markNotificationUnread as markNotificationUnreadRequest
} from "../api/notifications";
import {
  addStoredNotification,
  deleteStoredNotification,
  getStoredNotifications,
  markAllStoredNotificationsRead,
  markStoredNotificationRead,
  markStoredNotificationUnread,
  saveNotifications
} from "../utils/notificationsStorage";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { connectSocket, disconnectSocket } from "../services/socket";

const NotificationContext = createContext(null);

function sortNotifications(notifications) {
  return [...notifications].sort(
    (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  );
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      disconnectSocket();
      setNotifications([]);
      return undefined;
    }

    let isMounted = true;

    async function loadNotifications() {
      try {
        setIsLoading(true);
        const notificationItems = await fetchNotifications().catch(() => []);
        const storedNotifications = getStoredNotifications(user);
        const mergedNotifications = [...storedNotifications];

        notificationItems.forEach((notification) => {
          if (!mergedNotifications.some((item) => item.id === notification.id)) {
            mergedNotifications.push(notification);
          }
        });

        if (isMounted) {
          const nextNotifications = sortNotifications(mergedNotifications);
          setNotifications(nextNotifications);
          saveNotifications(user.id, nextNotifications);
        }
      } catch {
        if (isMounted) {
          const fallbackNotifications = sortNotifications(getStoredNotifications(user));
          setNotifications(fallbackNotifications);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    const socket = connectSocket();

    function handleNotificationCreated(notification) {
      setNotifications((current) => {
        const exists = current.some((item) => item.id === notification.id);
        if (exists) {
          return current;
        }

        const nextNotifications = sortNotifications([notification, ...current]);
        addStoredNotification(user.id, notification);
        return nextNotifications;
      });
      showToast(notification.title, "info");
    }

    socket?.on("notification:created", handleNotificationCreated);

    return () => {
      isMounted = false;
      socket?.off("notification:created", handleNotificationCreated);
    };
  }, [showToast, user?.id]);

  async function markRead(notificationId) {
    try {
      const updatedNotification = await markNotificationReadRequest(notificationId);
      const nextNotifications = notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, ...updatedNotification } : notification
      );

      setNotifications(nextNotifications);
      saveNotifications(user?.id, nextNotifications);
    } catch {
      const nextNotifications = markStoredNotificationRead(user?.id, notificationId);
      setNotifications(sortNotifications(nextNotifications));
    }
  }

  async function markUnread(notificationId) {
    try {
      const updatedNotification = await markNotificationUnreadRequest(notificationId);
      const nextNotifications = notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, ...updatedNotification } : notification
      );

      setNotifications(sortNotifications(nextNotifications));
      saveNotifications(user?.id, nextNotifications);
    } catch {
      const nextNotifications = markStoredNotificationUnread(user?.id, notificationId);
      setNotifications(sortNotifications(nextNotifications));
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsReadRequest();
      const nextNotifications = notifications.map((notification) => ({
        ...notification,
        readAt: notification.readAt || new Date().toISOString()
      }));
      setNotifications(nextNotifications);
      saveNotifications(user?.id, nextNotifications);
    } catch {
      const nextNotifications = markAllStoredNotificationsRead(user?.id);
      setNotifications(
        sortNotifications(
          nextNotifications.map((notification) => ({
            ...notification,
            readAt: notification.readAt || new Date().toISOString()
          }))
        )
      );
    }
  }

  async function deleteNotification(notificationId) {
    try {
      await deleteNotificationRequest(notificationId);
      const nextNotifications = notifications.filter(
        (notification) => notification.id !== notificationId
      );
      setNotifications(sortNotifications(nextNotifications));
      saveNotifications(user?.id, nextNotifications);
    } catch {
      const nextNotifications = deleteStoredNotification(user?.id, notificationId);
      setNotifications(sortNotifications(nextNotifications));
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      markRead,
      markUnread,
      markAllRead,
      deleteNotification
    }),
    [notifications, unreadCount, isLoading, markRead, markUnread, markAllRead, deleteNotification]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
