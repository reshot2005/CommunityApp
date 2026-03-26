import { validateObjectBody } from "../utils/requestValidation.js";
import { USER_ROLES } from "../utils/constants.js";

export function validateRole(role) {
  return Object.values(USER_ROLES).includes(role);
}

export function validateRegisterPayload(body) {
  const bodyErrors = validateObjectBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  const errors = [];

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Name is required");
  } else if (body.name.trim().length > 120) {
    errors.push("Name must be at most 120 characters");
  }

  if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
    errors.push("Email is required");
  } else if (!/\S+@\S+\.\S+/.test(body.email)) {
    errors.push("Email format is invalid");
  } else if (body.email.trim().length > 255) {
    errors.push("Email must be at most 255 characters");
  }

  if (!body.password || typeof body.password !== "string") {
    errors.push("Password is required");
  } else if (body.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  } else if (body.password.length > 128) {
    errors.push("Password must be at most 128 characters");
  }

  if (!validateRole(body.role)) {
    errors.push("Role must be student, company, or college");
  }

  return errors;
}

export function validateLoginPayload(body) {
  const bodyErrors = validateObjectBody(body);
  if (bodyErrors.length > 0) {
    return bodyErrors;
  }

  const errors = [];

  if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
    errors.push("Email is required");
  } else if (body.email.trim().length > 255) {
    errors.push("Email must be at most 255 characters");
  }

  if (!body.password || typeof body.password !== "string") {
    errors.push("Password is required");
  } else if (body.password.length > 128) {
    errors.push("Password must be at most 128 characters");
  }

  return errors;
}
