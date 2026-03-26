import createHttpError from "../utils/createHttpError.js";

function notFound(req, res, next) {
  next(createHttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export default notFound;
