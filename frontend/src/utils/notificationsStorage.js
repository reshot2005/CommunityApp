const NOTIFICATIONS_KEY = "notificationsByUser";

function getStorageKey(userId) {
  return `${NOTIFICATIONS_KEY}:${userId || "guest"}`;
}

function getDefaultNotifications(user) {
  const profileName = user?.name || "NexaWork Member";

  return [
    {
      id: "demo-notification-welcome",
      type: "account.welcome",
      title: `Welcome to NexaWork, ${profileName}`,
      body: "Your dashboard, jobs, messages, and community tools are ready to explore.",
      createdAt: "2026-03-23T09:15:00.000Z",
      readAt: null,
      isLocalNotification: true
    },
    {
      id: "demo-notification-jobs",
      type: "jobs.recommended",
      title: "New jobs have been added to your feed",
      body: "Check the Jobs page to explore fresh openings and apply to roles that match your interests.",
      createdAt: "2026-03-23T08:00:00.000Z",
      readAt: null,
      isLocalNotification: true
    },
    {
      id: "demo-notification-community",
      type: "community.activity",
      title: "Community updates are active",
      body: "You can now post updates in the Community page and keep track of activity from your feed.",
      createdAt: "2026-03-22T18:30:00.000Z",
      readAt: "2026-03-22T19:00:00.000Z",
      isLocalNotification: true
    }
  ];
}

function getParsedNotifications(user) {
  const storageKey = getStorageKey(user?.id);
  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) {
    const defaults = getDefaultNotifications(user);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }

    const defaults = getDefaultNotifications(user);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
    return defaults;
  } catch {
    const defaults = getDefaultNotifications(user);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
    return defaults;
  }
}

function persistNotifications(userId, notifications) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications));
}

export function getStoredNotifications(user) {
  return getParsedNotifications(user);
}

export function saveNotifications(userId, notifications) {
  persistNotifications(userId, notifications);
}

export function addStoredNotification(userId, notification) {
  const currentNotifications = getParsedNotifications({ id: userId });

  if (currentNotifications.some((item) => item.id === notification.id)) {
    return currentNotifications;
  }

  const nextNotifications = [notification, ...currentNotifications];
  persistNotifications(userId, nextNotifications);
  return nextNotifications;
}

export function markStoredNotificationRead(userId, notificationId) {
  const nextNotifications = getParsedNotifications({ id: userId }).map((notification) =>
    notification.id === notificationId
      ? {
          ...notification,
          readAt: notification.readAt || new Date().toISOString()
        }
      : notification
  );

  persistNotifications(userId, nextNotifications);
  return nextNotifications;
}

export function markStoredNotificationUnread(userId, notificationId) {
  const nextNotifications = getParsedNotifications({ id: userId }).map((notification) =>
    notification.id === notificationId
      ? {
          ...notification,
          readAt: null
        }
      : notification
  );

  persistNotifications(userId, nextNotifications);
  return nextNotifications;
}

export function markAllStoredNotificationsRead(userId) {
  const nextNotifications = getParsedNotifications({ id: userId }).map((notification) => ({
    ...notification,
    readAt: notification.readAt || new Date().toISOString()
  }));

  persistNotifications(userId, nextNotifications);
  return nextNotifications;
}

export function deleteStoredNotification(userId, notificationId) {
  const nextNotifications = getParsedNotifications({ id: userId }).filter(
    (notification) => notification.id !== notificationId
  );

  persistNotifications(userId, nextNotifications);
  return nextNotifications;
}
