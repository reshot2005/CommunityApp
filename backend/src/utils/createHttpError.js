function createHttpError(statusCode, message, options = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (options.code) {
    error.code = options.code;
  }
  if (options.details) {
    error.details = options.details;
  }
  return error;
}

export default createHttpError;
