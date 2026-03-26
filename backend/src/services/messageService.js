export function buildConversationKey(userA, userB) {
  return [userA, userB].sort().join(":");
}
