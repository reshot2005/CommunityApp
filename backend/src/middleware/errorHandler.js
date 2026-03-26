import env from "../config/env.js";

function errorHandler(error, req, res, next) {
  const isJsonSyntaxError =
    error instanceof SyntaxError && error.status === 400 && "body" in error;

  const normalizedError = isJsonSyntaxError
    ? {
        statusCode: 400,
        message: "Invalid JSON payload",
        details: ["Request body contains malformed JSON"]
      }
    : error;

  const statusCode = normalizedError.statusCode || 500;

  if (statusCode >= 500) {
    console.error(normalizedError);
  } else {
    console.warn(
      `[${req.method} ${req.originalUrl}] ${statusCode} ${normalizedError.message}`
    );
  }

  const response = {
    message: normalizedError.message || "Internal server error"
  };

  if (Array.isArray(normalizedError.details) && normalizedError.details.length > 0) {
    response.details = normalizedError.details;
  }

  if (env.debugErrors && normalizedError.stack) {
    response.stack = normalizedError.stack;
  }

  res.status(statusCode).json(response);
}

export default errorHandler;
