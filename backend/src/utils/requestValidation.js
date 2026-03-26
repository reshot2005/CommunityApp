function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateObjectBody(body) {
  if (!isPlainObject(body)) {
    return ["Request body must be a JSON object"];
  }

  return [];
}

function normalizeTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRequiredString(value, fieldName, errors, options = {}) {
  const trimmedValue = normalizeTrimmedString(value);

  if (!trimmedValue) {
    errors.push(`${fieldName} is required`);
    return "";
  }

  if (options.maxLength && trimmedValue.length > options.maxLength) {
    errors.push(`${fieldName} must be at most ${options.maxLength} characters`);
  }

  return trimmedValue;
}

function validateOptionalString(value, fieldName, errors, options = {}) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`);
    return "";
  }

  const trimmedValue = value.trim();

  if (options.allowEmpty === false && trimmedValue.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
  }

  if (options.maxLength && trimmedValue.length > options.maxLength) {
    errors.push(`${fieldName} must be at most ${options.maxLength} characters`);
  }

  return trimmedValue;
}

function validateUuidLike(value, fieldName, errors) {
  const trimmedValue = normalizeTrimmedString(value);

  if (!trimmedValue) {
    errors.push(`${fieldName} is required`);
    return "";
  }

  if (trimmedValue.length > 128) {
    errors.push(`${fieldName} is invalid`);
  }

  return trimmedValue;
}

function validateNonNegativeNumber(value, fieldName, errors, options = {}) {
  if (value === undefined || value === null || value === "") {
    if (!options.optional) {
      errors.push(`${fieldName} is required`);
    }

    return null;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
    return null;
  }

  if (value < 0) {
    errors.push(`${fieldName} must be greater than or equal to 0`);
  }

  return value;
}

export {
  isPlainObject,
  normalizeTrimmedString,
  validateNonNegativeNumber,
  validateObjectBody,
  validateOptionalString,
  validateRequiredString,
  validateUuidLike
};
