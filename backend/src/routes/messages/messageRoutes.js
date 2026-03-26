import { Router } from "express";
import {
  getMessagesBetweenUsers,
  resolveMessageRecipient,
  sendMessage
} from "../../controllers/messages/messageController.js";
import authenticate from "../../middleware/authenticate.js";
import {
  validateConversation,
  validateSendMessage
} from "../../middleware/validateMessage.js";

const router = Router();

router.get("/resolve", authenticate, resolveMessageRecipient);
router.post("/", authenticate, validateSendMessage, sendMessage);
router.get("/:userId", authenticate, validateConversation, getMessagesBetweenUsers);

export default router;
