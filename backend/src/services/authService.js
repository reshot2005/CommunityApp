import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import pool from "../config/db.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { generateToken } from "../utils/jwt.js";
import { validateRole } from "../validators/authValidator.js";
import createHttpError from "../utils/createHttpError.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt || user.created_at
  };
}

export function buildAuthPayload(user, token) {
  return { user, token };
}

export async function registerUser({ name, email, password, role }) {
  if (!name || !email || !password || !role) {
    throw createHttpError(400, "Name, email, password, and role are required");
  }

  if (!validateRole(role)) {
    throw createHttpError(400, "Invalid role");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findByEmail(normalizedEmail);

  if (existingUser) {
    throw createHttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = randomUUID();
  const trimmedName = name.trim();
  const client = await pool.connect();

  let user;

  try {
    await client.query("BEGIN");

    user = await User.createWithClient({
      client,
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role
    });

    await Profile.createDefault({
      client,
      userId,
      role,
      name: trimmedName
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken({ id: safeUser.id, role: safeUser.role });

  return buildAuthPayload(safeUser, token);
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createHttpError(400, "Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findByEmail(normalizedEmail);

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  if (!user.password_hash) {
    throw createHttpError(
      401,
      "This account uses social login. Continue with Google or LinkedIn."
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken({ id: safeUser.id, role: safeUser.role });

  return buildAuthPayload(safeUser, token);
}
