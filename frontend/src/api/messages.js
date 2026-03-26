import api from "./client";

export async function fetchConversation(userId) {
  const { data } = await api.get(`/messages/${userId}`);
  return data.messages ?? [];
}

export async function sendMessage(payload) {
  const { data } = await api.post("/messages", payload);
  return data.data;
}

export async function resolveRecipient(identifier) {
  const { data } = await api.get("/messages/resolve", {
    params: { identifier }
  });
  return data.recipient;
}
