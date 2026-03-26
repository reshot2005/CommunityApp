import Notification from "../../models/Notification.js";
import createHttpError from "../../utils/createHttpError.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findByUserId(req.user.id);

  return res.status(200).json({
    notifications
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.notificationId?.trim();

  if (!notificationId) {
    throw createHttpError(400, "notificationId is required");
  }

  const notification = await Notification.markRead({
    notificationId,
    userId: req.user.id
  });

  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  return res.status(200).json({
    notification
  });
});

export const markNotificationUnread = asyncHandler(async (req, res) => {
  const notificationId = req.params.notificationId?.trim();

  if (!notificationId) {
    throw createHttpError(400, "notificationId is required");
  }

  const notification = await Notification.markUnread({
    notificationId,
    userId: req.user.id
  });

  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  return res.status(200).json({
    notification
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.markAllRead(req.user.id);

  return res.status(200).json({
    message: "Notifications marked as read"
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = req.params.notificationId?.trim();

  if (!notificationId) {
    throw createHttpError(400, "notificationId is required");
  }

  const notification = await Notification.delete({
    notificationId,
    userId: req.user.id
  });

  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  return res.status(200).json({
    message: "Notification deleted"
  });
});
