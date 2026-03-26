import api from "./client";

export async function fetchNotifications() {
  const { data } = await api.get("/notifications");
  return data.notifications ?? [];
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.post(`/notifications/${notificationId}/read`);
  return data.notification;
}

export async function markNotificationUnread(notificationId) {
  const { data } = await api.post(`/notifications/${notificationId}/unread`);
  return data.notification;
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/read-all");
}

export async function deleteNotification(notificationId) {
  await api.delete(`/notifications/${notificationId}`);
}
