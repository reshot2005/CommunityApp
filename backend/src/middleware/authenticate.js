import jwt from "jsonwebtoken";
import env from "../config/env.js";
import createHttpError from "../utils/createHttpError.js";
import User from "../models/User.js";

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(createHttpError(401, "Authorization header is required"));
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(createHttpError(401, "Token is required"));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"]
    });

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        createHttpError(401, "Session expired. Please log in again.")
      );
    }

    req.user = {
      id: user.id,
      role: user.role
    };
    return next();
  } catch (error) {
    return next(createHttpError(401, "Invalid token"));
  }
}

export default authenticate;
