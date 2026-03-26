import {
  validateNonNegativeNumber,
  validateObjectBody,
  validateRequiredString,
  validateUuidLike
} from "../utils/requestValidation.js";

export function validateCreateJobPayload(body) {
  const bodyErrors = validateObjectBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  const errors = [];

  validateRequiredString(body.title, "title", errors, { maxLength: 120 });
  validateRequiredString(body.description, "description", errors, { maxLength: 5000 });
  validateRequiredString(body.location, "location", errors, { maxLength: 160 });
  validateNonNegativeNumber(body.salary, "salary", errors, { optional: true });

  return errors;
}

export function validateApplyToJobPayload(body) {
  const bodyErrors = validateObjectBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  const errors = [];
  validateUuidLike(body.jobId, "jobId", errors);
  return errors;
}
