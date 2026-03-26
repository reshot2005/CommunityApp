import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emitNotificationCreated } from "../socket/socketServer.js";
import { sendEmail } from "./emailService.js";

export const NOTIFICATION_TYPES = {
  MESSAGE_RECEIVED: "message.received",
  JOB_APPLICATION_RECEIVED: "job.application.received"
};

export async function createNotification({
  userId,
  actorId = null,
  type,
  title,
  body,
  data = {},
  emailSubject,
  emailText,
  emailHtml
}) {
  let notification = null;

  try {
    notification = await Notification.create({
      userId,
      actorId,
      type,
      title,
      body,
      data
    });

    emitNotificationCreated(notification);
  } catch (error) {
    if (error?.code === "42P01") {
      console.warn(
        "Skipping notification persistence because the notifications table is not available yet."
      );
    } else {
      console.error("Notification persistence failed:", error.message);
    }
  }

  try {
    const recipient = await User.findById(userId);

    if (recipient?.email && emailSubject && (emailText || emailHtml)) {
      await sendEmail({
        to: recipient.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      });
    }
  } catch (error) {
    console.error("Notification email failed:", error.message);
  }

  return notification;
}
