import createHttpError from "../utils/createHttpError.js";

function validateRequest(validator) {
  return (req, res, next) => {
    const errors = validator(req);

    if (!Array.isArray(errors)) {
      return next(createHttpError(500, "Validator must return an array of errors"));
    }

    if (errors.length > 0) {
      return next(
        createHttpError(400, "Validation failed", {
          details: errors
        })
      );
    }

    return next();
  };
}

export default validateRequest;
