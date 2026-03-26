import {
  normalizeTrimmedString,
  validateObjectBody,
  validateRequiredString,
  validateUuidLike
} from "../utils/requestValidation.js";

export function validateSendMessagePayload(body, currentUserId) {
  const bodyErrors = validateObjectBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  const errors = [];
  const receiverId = validateUuidLike(body.receiverId, "receiverId", errors);

  if (receiverId && receiverId === currentUserId) {
    errors.push("receiverId cannot be the same as the authenticated user");
  }

  validateRequiredString(body.message, "message", errors, { maxLength: 2000 });

  return errors;
}

export function validateConversationParams(params, currentUserId) {
  const errors = [];
  const userId = normalizeTrimmedString(params?.userId);

  if (!userId) {
    errors.push("userId is required");
  } else if (userId.length > 128) {
    errors.push("userId is invalid");
  }

  if (userId && userId === currentUserId) {
    errors.push("userId cannot be the same as the authenticated user");
  }

  return errors;
}
