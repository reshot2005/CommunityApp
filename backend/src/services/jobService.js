export function normalizeJobPayload(payload) {
  return {
    ...payload,
    status: payload.status || "open"
  };
}
