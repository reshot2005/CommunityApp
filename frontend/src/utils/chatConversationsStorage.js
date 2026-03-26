const CHAT_STORAGE_KEY = "chatConversations";

function getConversationStorageKey(currentUserId, recipientKey) {
  return `${CHAT_STORAGE_KEY}:${currentUserId || "guest"}:${recipientKey}`;
}

function getParsedConversation(currentUserId, recipientKey) {
  const rawValue = localStorage.getItem(
    getConversationStorageKey(currentUserId, recipientKey)
  );

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(getConversationStorageKey(currentUserId, recipientKey));
    return [];
  }
}

function setConversation(currentUserId, recipientKey, messages) {
  localStorage.setItem(
    getConversationStorageKey(currentUserId, recipientKey),
    JSON.stringify(messages)
  );
}

export function getStoredConversation(currentUserId, recipientKey) {
  return getParsedConversation(currentUserId, recipientKey);
}

export function appendStoredMessage(currentUserId, recipientKey, message) {
  const currentMessages = getParsedConversation(currentUserId, recipientKey);
  const nextMessages = [...currentMessages, message];
  setConversation(currentUserId, recipientKey, nextMessages);
  return nextMessages;
}
