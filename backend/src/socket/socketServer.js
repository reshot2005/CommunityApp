import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import {
  createNotification,
  NOTIFICATION_TYPES
} from "../services/notificationService.js";

let io;

function getUserRoom(userId) {
  return `user:${userId}`;
}

function resolveSocketToken(socket) {
  const bearerToken = socket.handshake.headers.authorization;

  if (typeof socket.handshake.auth?.token === "string") {
    return socket.handshake.auth.token.trim();
  }

  if (typeof bearerToken === "string" && bearerToken.startsWith("Bearer ")) {
    return bearerToken.slice(7).trim();
  }

  return "";
}

async function authenticateSocket(socket, next) {
  const token = resolveSocketToken(socket);

  if (!token) {
    next(new Error("Authentication token is required"));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"]
    });
    const user = await User.findById(decoded.id);

    if (!user) {
      next(new Error("Session expired. Please log in again."));
      return;
    }

    socket.data.user = {
      id: user.id,
      role: user.role
    };
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}

async function resolveRecipientOrThrow(identifier, currentUserId) {
  const normalizedIdentifier = String(identifier || "").trim();

  if (!normalizedIdentifier) {
    throw new Error("Receiver is required");
  }

  const recipient = await User.findByIdentifier(normalizedIdentifier);

  if (!recipient) {
    throw new Error("Recipient not found");
  }

  if (recipient.id === currentUserId) {
    throw new Error("You cannot send messages to yourself");
  }

  return recipient;
}

async function persistSocketMessage({ senderId, receiverIdentifier, message }) {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    throw new Error("Message is required");
  }

  const recipient = await resolveRecipientOrThrow(receiverIdentifier, senderId);
  const newMessage = await Message.create({
    senderId,
    receiverId: recipient.id,
    message: trimmedMessage
  });
  const sender = await User.findById(senderId);

  await createNotification({
    userId: recipient.id,
    actorId: senderId,
    type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    title: `New message from ${sender?.name || "a user"}`,
    body:
      trimmedMessage.length > 120
        ? `${trimmedMessage.slice(0, 117)}...`
        : trimmedMessage,
    data: {
      messageId: newMessage.id,
      senderId
    },
    emailSubject: `New message from ${sender?.name || "a user"}`,
    emailText: `${sender?.name || "Someone"} sent you a new message:\n\n${trimmedMessage}`,
    emailHtml: `<p><strong>${sender?.name || "Someone"}</strong> sent you a new message.</p><p>${trimmedMessage}</p>`
  });

  return newMessage;
}

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    socket.join(getUserRoom(userId));
    socket.emit("socket:ready", { userId });

    socket.on("send_message", async (payload = {}, acknowledgement) => {
      try {
        const newMessage = await persistSocketMessage({
          senderId: userId,
          receiverIdentifier:
            payload.receiver || payload.receiverId || payload.recipient,
          message: payload.message
        });

        emitMessageCreated(newMessage);

        if (typeof acknowledgement === "function") {
          acknowledgement({ ok: true, data: newMessage });
        }
      } catch (error) {
        if (typeof acknowledgement === "function") {
          acknowledgement({
            ok: false,
            error: error.message || "Message could not be sent"
          });
        } else {
          socket.emit("message:error", {
            error: error.message || "Message could not be sent"
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected for user ${userId}`);
    });
  });

  return io;
}

export function getSocketServer() {
  return io;
}

export function emitMessageCreated(message) {
  if (!io) {
    return;
  }

  const recipientRooms = new Set([message.senderId, message.receiverId]);
  const legacyMessage = {
    id: message.id,
    sender: message.senderId,
    receiver: message.receiverId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    message: message.message,
    createdAt: message.createdAt || message.created_at
  };

  recipientRooms.forEach((userId) => {
    io.to(getUserRoom(userId)).emit("message:received", message);
    io.to(getUserRoom(userId)).emit("receive_message", legacyMessage);
  });
}

export function emitNotificationCreated(notification) {
  if (!io) {
    return;
  }

  io.to(getUserRoom(notification.userId)).emit("notification:created", notification);
}
