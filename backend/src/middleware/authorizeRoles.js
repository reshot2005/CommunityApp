import { USER_ROLES } from "../utils/constants.js";

function authorizeRoles(...allowedRoles) {
  const roles = allowedRoles.flat().filter(Boolean);
  const validRoles = Object.values(USER_ROLES);

  if (roles.length === 0) {
    throw new Error("authorizeRoles requires at least one role");
  }

  const invalidRoles = roles.filter((role) => !validRoles.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(`authorizeRoles received invalid roles: ${invalidRoles.join(", ")}`);
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    return next();
  };
}

export default authorizeRoles;
