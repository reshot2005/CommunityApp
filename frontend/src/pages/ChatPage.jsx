import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  fetchConversation,
  resolveRecipient,
  sendMessage
} from "../api/messages";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";
import { cardVariants } from "../components/motion/transitions";
import { useAuth } from "../context/AuthContext";
import { connectSocket, getSocket } from "../services/socket";
import {
  appendStoredMessage,
  getStoredConversation
} from "../utils/chatConversationsStorage";

function mergeMessage(currentMessages, incomingMessage) {
  const normalizedIncomingId = incomingMessage.id || incomingMessage.createdAt;
  const alreadyExists = currentMessages.some(
    (message) => (message.id || message.createdAt) === normalizedIncomingId
  );

  if (alreadyExists) {
    return currentMessages;
  }

  return [...currentMessages, incomingMessage].sort((left, right) => {
    const leftTimestamp = new Date(left.createdAt || 0).getTime();
    const rightTimestamp = new Date(right.createdAt || 0).getTime();
    return leftTimestamp - rightTimestamp;
  });
}

function normalizeSocketMessage(message) {
  return {
    id: message.id || message.createdAt || crypto.randomUUID(),
    senderId: message.senderId || message.sender,
    receiverId: message.receiverId || message.receiver,
    message: message.message,
    createdAt: message.createdAt || new Date().toISOString()
  };
}

function isUuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [recipientId, setRecipientId] = useState("");
  const [resolvedRecipient, setResolvedRecipient] = useState(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketState, setSocketState] = useState("connecting");
  const activeRecipientRef = useRef("");

  useEffect(() => {
    activeRecipientRef.current = resolvedRecipient?.id || recipientId.trim();
  }, [recipientId, resolvedRecipient?.id]);

  useEffect(() => {
    const normalizedRecipientId = recipientId.trim();

    if (!normalizedRecipientId) {
      setResolvedRecipient(null);
      return undefined;
    }

    let isMounted = true;

    async function loadRecipient() {
      try {
        const recipient = await resolveRecipient(normalizedRecipientId);

        if (isMounted) {
          setResolvedRecipient(recipient);
        }
      } catch {
        if (isMounted) {
          setResolvedRecipient(null);
        }
      }
    }

    loadRecipient();

    return () => {
      isMounted = false;
    };
  }, [recipientId]);

  useEffect(() => {
    if (!recipientId.trim()) {
      setMessages([]);
      setError("");
      return;
    }

    async function loadConversation() {
      setIsLoading(true);
      const normalizedRecipientId = recipientId.trim();
      const conversationTarget = resolvedRecipient?.id || normalizedRecipientId;

      try {
        if (!resolvedRecipient && !isUuidLike(normalizedRecipientId)) {
          setMessages(getStoredConversation(user?.id, normalizedRecipientId));
          setError("");
          return;
        }

        const data = await fetchConversation(conversationTarget);
        setMessages(data);
        setError("");
      } catch (requestError) {
        setMessages(getStoredConversation(user?.id, normalizedRecipientId));
        setError(
          requestError.response?.data?.message ||
            "Using local conversation mode for this recipient."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadConversation();
  }, [recipientId, resolvedRecipient?.id, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const socket = connectSocket();

    if (!socket) {
      setSocketState("disconnected");
      return undefined;
    }

    function handleConnect() {
      setSocketState("connected");
      setError("");
    }

    function handleDisconnect() {
      setSocketState("disconnected");
    }

    function handleConnectError(connectionError) {
      setSocketState("error");
      setError(connectionError.message || "Realtime connection failed");
    }

    function handleIncomingMessage(message) {
      const normalizedMessage = normalizeSocketMessage(message);
      const activeRecipientId = activeRecipientRef.current;
      const belongsToCurrentConversation =
        activeRecipientId &&
        [normalizedMessage.senderId, normalizedMessage.receiverId].includes(user.id) &&
        [normalizedMessage.senderId, normalizedMessage.receiverId].includes(activeRecipientId);

      if (!belongsToCurrentConversation) {
        return;
      }

      setMessages((current) => mergeMessage(current, normalizedMessage));
    }

    setSocketState(socket.connected ? "connected" : "connecting");
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message:received", handleIncomingMessage);
    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message:received", handleIncomingMessage);
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [user?.id]);

  async function sendThroughSocket({
    conversationTarget,
    normalizedRecipientId,
    trimmedInput
  }) {
    const activeSocket = getSocket();

    if (!activeSocket) {
      throw new Error("Realtime connection is unavailable");
    }

    if (!activeSocket.connected) {
      activeSocket.connect();
    }

    return new Promise((resolve, reject) => {
      activeSocket.emit(
        "send_message",
        {
          receiver: resolvedRecipient?.email || normalizedRecipientId,
          receiverId: conversationTarget,
          message: trimmedInput
        },
        (response) => {
          if (response?.ok && response.data) {
            resolve(normalizeSocketMessage(response.data));
            return;
          }

          reject(new Error(response?.error || "Message could not be sent"));
        }
      );
    });
  }

  async function handleSend() {
    const normalizedRecipientId = recipientId.trim();
    const conversationTarget = resolvedRecipient?.id || normalizedRecipientId;
    const trimmedInput = input.trim();

    if (!normalizedRecipientId || !trimmedInput) {
      return;
    }

    setIsSending(true);

    try {
      let message;

      if (resolvedRecipient || isUuidLike(normalizedRecipientId)) {
        try {
          message = await sendThroughSocket({
            conversationTarget,
            normalizedRecipientId,
            trimmedInput
          });
        } catch {
          message = await sendMessage({
            receiverId: conversationTarget,
            message: trimmedInput
          });
        }
      } else {
        message = {
          id: crypto.randomUUID(),
          senderId: user?.id,
          receiverId: normalizedRecipientId,
          message: trimmedInput,
          createdAt: new Date().toISOString(),
          isLocalMessage: true
        };
        appendStoredMessage(user?.id, normalizedRecipientId, message);
      }

      setMessages((current) => mergeMessage(current, message));
      setInput("");
      setError("");
    } catch (requestError) {
      const localMessage = {
        id: crypto.randomUUID(),
        senderId: user?.id,
        receiverId: normalizedRecipientId,
        message: trimmedInput,
        createdAt: new Date().toISOString(),
        isLocalMessage: true
      };

      appendStoredMessage(user?.id, normalizedRecipientId, localMessage);
      setMessages((current) => mergeMessage(current, localMessage));
      setInput("");
      setError(
        requestError.response?.data?.message ||
          "Backend messaging is unavailable, so this chat is using local mode."
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSend();
  }

  return (
    <PageTransition>
      <div className="flex min-h-[70vh] flex-col rounded-[1.75rem] border border-gray-700 bg-gray-800 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="border-b border-gray-700 px-6 py-5">
          <PageHeader
            eyebrow="Messages"
            title="Chat"
            description="Enter a recipient email or user ID to load a conversation and exchange messages."
          />
          <p className="mt-3 text-sm text-slate-400">
            Realtime status:{" "}
            <span
              className={
                socketState === "connected"
                  ? "text-emerald-300"
                  : socketState === "error"
                    ? "text-rose-300"
                    : "text-amber-300"
              }
            >
              {socketState}
            </span>
          </p>
          <div className="mt-4">
            <label htmlFor="recipientId" className="mb-2 block text-sm font-medium text-gray-100">
              Recipient Email or User ID
            </label>
            <input
              id="recipientId"
              type="text"
              value={recipientId}
              onChange={(event) => setRecipientId(event.target.value)}
              placeholder="Enter an email or paste a user ID"
              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
            />
            {resolvedRecipient ? (
              <p className="mt-2 text-sm text-emerald-300">
                Messaging {resolvedRecipient.name} ({resolvedRecipient.email})
              </p>
            ) : null}
          </div>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {!recipientId.trim() ? (
            <p className="text-sm text-gray-400">Select a recipient to start chatting.</p>
          ) : null}
          {isLoading ? <p className="text-sm text-gray-400">Loading conversation...</p> : null}
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === user?.id;

            return (
              <motion.div
                key={message.id}
                variants={cardVariants}
                custom={index}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xl rounded-3xl px-5 py-4 text-sm leading-7 ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.2)]"
                      : "border border-gray-700 bg-gray-900 text-gray-100"
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    {isCurrentUser ? "You" : "Recipient"}
                  </p>
                  <p>{message.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-700 px-6 py-5"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
            />
            <button
              type="submit"
              disabled={!recipientId.trim() || !input.trim() || isSending}
              className="interactive-button glow-button rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3.5 text-sm font-semibold text-white hover:from-blue-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

export default ChatPage;
