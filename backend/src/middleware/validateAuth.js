import validateRequest from "./validateRequest.js";
import {
  validateLoginPayload,
  validateRegisterPayload
} from "../validators/authValidator.js";

export const validateRegister = validateRequest((req) =>
  validateRegisterPayload(req.body)
);

export const validateLogin = validateRequest((req) =>
  validateLoginPayload(req.body)
);
