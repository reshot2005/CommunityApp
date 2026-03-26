import { Router } from "express";
import authenticate from "../../middleware/authenticate.js";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread
} from "../../controllers/notifications/notificationController.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.post("/read-all", authenticate, markAllNotificationsRead);
router.post("/:notificationId/read", authenticate, markNotificationRead);
router.post("/:notificationId/unread", authenticate, markNotificationUnread);
router.delete("/:notificationId", authenticate, deleteNotification);

export default router;
