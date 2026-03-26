import { validateObjectBody, validateRequiredString } from "../utils/requestValidation.js";

export function validateCreatePostPayload(body) {
  const bodyErrors = validateObjectBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  const errors = [];
  validateRequiredString(body.content, "content", errors, { maxLength: 2000 });
  return errors;
}
