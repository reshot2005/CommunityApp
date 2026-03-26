import Message from "../../models/Message.js";
import User from "../../models/User.js";
import {
  createNotification,
  NOTIFICATION_TYPES
} from "../../services/notificationService.js";
import createHttpError from "../../utils/createHttpError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { emitMessageCreated } from "../../socket/socketServer.js";

async function resolveRecipientOrThrow(identifier, currentUserId) {
  const recipient = await User.findByIdentifier(identifier);

  if (!recipient) {
    throw createHttpError(404, "Recipient not found");
  }

  if (recipient.id === currentUserId) {
    throw createHttpError(400, "receiverId cannot be the same as the authenticated user");
  }

  return recipient;
}

export const resolveMessageRecipient = asyncHandler(async (req, res) => {
  const identifier = req.query.identifier?.trim();

  if (!identifier) {
    throw createHttpError(400, "identifier is required");
  }

  const recipient = await resolveRecipientOrThrow(identifier, req.user.id);

  return res.status(200).json({
    recipient: {
      id: recipient.id,
      name: recipient.name,
      email: recipient.email,
      role: recipient.role
    }
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const receiverIdentifier = req.body.receiverId?.trim();
  const message = req.body.message?.trim();

  if (!receiverIdentifier || !message) {
    throw createHttpError(400, "receiverId and message are required");
  }

  const recipient = await resolveRecipientOrThrow(receiverIdentifier, req.user.id);
  const receiverId = recipient.id;

  const newMessage = await Message.create({
    senderId: req.user.id,
    receiverId,
    message
  });
  emitMessageCreated(newMessage);

  const sender = await User.findById(req.user.id);

  if (receiverId !== req.user.id) {
    await createNotification({
      userId: receiverId,
      actorId: req.user.id,
      type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
      title: `New message from ${sender?.name || "a user"}`,
      body: message.length > 120 ? `${message.slice(0, 117)}...` : message,
      data: {
        messageId: newMessage.id,
        senderId: req.user.id
      },
      emailSubject: `New message from ${sender?.name || "a user"}`,
      emailText: `${sender?.name || "Someone"} sent you a new message:\n\n${message}`,
      emailHtml: `<p><strong>${sender?.name || "Someone"}</strong> sent you a new message.</p><p>${message}</p>`
    });
  }

  return res.status(201).json({
    message: "Message sent",
    data: newMessage
  });
});

export const getMessagesBetweenUsers = asyncHandler(async (req, res) => {
  const userIdentifier = req.params.userId?.trim();

  if (!userIdentifier) {
    throw createHttpError(400, "userId is required");
  }

  const recipient = await resolveRecipientOrThrow(userIdentifier, req.user.id);
  const messages = await Message.findConversation(req.user.id, recipient.id);

  return res.status(200).json({
    messages
  });
});
