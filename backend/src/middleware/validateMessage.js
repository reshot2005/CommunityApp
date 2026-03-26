import validateRequest from "./validateRequest.js";
import {
  validateConversationParams,
  validateSendMessagePayload
} from "../validators/messageValidator.js";

export const validateSendMessage = validateRequest((req) =>
  validateSendMessagePayload(req.body, req.user?.id)
);

export const validateConversation = validateRequest((req) =>
  validateConversationParams(req.params, req.user?.id)
);
