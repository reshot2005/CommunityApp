import validateRequest from "./validateRequest.js";
import { validateProfileUpdatePayload } from "../validators/profileValidator.js";

export const validateProfileUpdate = validateRequest((req) =>
  validateProfileUpdatePayload(req.user?.role, req.body)
);
