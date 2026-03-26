import validateRequest from "./validateRequest.js";
import {
  validateApplyToJobPayload,
  validateCreateJobPayload
} from "../validators/jobValidator.js";

export const validateCreateJob = validateRequest((req) =>
  validateCreateJobPayload(req.body)
);

export const validateApplyToJob = validateRequest((req) =>
  validateApplyToJobPayload(req.body)
);
