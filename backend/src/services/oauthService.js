import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import pool from "../config/db.js";
import env from "../config/env.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { buildAuthPayload } from "./authService.js";
import { generateToken } from "../utils/jwt.js";
import createHttpError from "../utils/createHttpError.js";
import { validateRole } from "../validators/authValidator.js";

const OAUTH_PROVIDERS = {
  google: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scopes: ["openid", "email", "profile"],
    getClientId: () => env.googleClientId,
    getClientSecret: () => env.googleClientSecret,
    getRedirectUri: () => env.googleRedirectUri
  },
  linkedin: {
    authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoUrl: "https://api.linkedin.com/v2/userinfo",
    scopes: ["openid", "profile", "email"],
    getClientId: () => env.linkedinClientId,
    getClientSecret: () => env.linkedinClientSecret,
    getRedirectUri: () => env.linkedinRedirectUri
  }
};

function isProviderConfigured(provider) {
  const config = OAUTH_PROVIDERS[provider];

  if (!config) {
    return false;
  }

  return Boolean(config.getClientId() && config.getClientSecret());
}

function isMockOAuthAllowed() {
  return !env.isProduction && env.allowMockOAuth;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt || user.created_at
  };
}

function getProviderConfig(provider) {
  const config = OAUTH_PROVIDERS[provider];

  if (!config) {
    throw createHttpError(400, "Unsupported OAuth provider");
  }

  if (!config.getClientId() || !config.getClientSecret()) {
    throw createHttpError(503, `${provider} OAuth is not configured`);
  }

  return config;
}

function createStateToken({ provider, role }) {
  return jwt.sign({ provider, role }, env.jwtSecret, {
    expiresIn: "10m"
  });
}

function parseStateToken(state) {
  try {
    return jwt.verify(state, env.jwtSecret, {
      algorithms: ["HS256"]
    });
  } catch {
    throw createHttpError(400, "Invalid or expired OAuth state");
  }
}

async function exchangeCodeForAccessToken(provider, code) {
  const config = getProviderConfig(provider);
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.getClientId(),
      client_secret: config.getClientSecret(),
      redirect_uri: config.getRedirectUri()
    })
  });

  if (!response.ok) {
    throw createHttpError(502, `Failed to exchange ${provider} OAuth code`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw createHttpError(502, `${provider} OAuth token response was incomplete`);
  }

  return data.access_token;
}

async function fetchProviderProfile(provider, accessToken) {
  const config = getProviderConfig(provider);
  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw createHttpError(502, `Failed to fetch ${provider} user profile`);
  }

  const profile = await response.json();
  const providerUserId = String(profile.sub || profile.id || "").trim();
  const email = String(profile.email || "").trim().toLowerCase();
  const name = String(profile.name || profile.localizedFirstName || "").trim();

  if (!providerUserId || !email || !name) {
    throw createHttpError(502, `${provider} profile response was incomplete`);
  }

  return {
    providerUserId,
    email,
    name
  };
}

function buildAuthorizationUrl(provider, role) {
  const config = getProviderConfig(provider);

  if (!validateRole(role)) {
    throw createHttpError(400, "Role must be student, company, or college");
  }

  const params = new URLSearchParams({
    client_id: config.getClientId(),
    redirect_uri: config.getRedirectUri(),
    response_type: "code",
    scope: config.scopes.join(" "),
    state: createStateToken({ provider, role })
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

async function createOAuthUser({ client, name, email, role, provider, providerUserId }) {
  const userId = randomUUID();
  const user = await User.createWithClient({
    client,
    id: userId,
    name,
    email,
    role,
    authProvider: provider,
    authProviderUserId: providerUserId
  });

  await Profile.createDefault({
    client,
    userId,
    role,
    name
  });

  return user;
}

async function createMockOAuthUser({ provider, role }) {
  const providerName = provider === "google" ? "Google" : "LinkedIn";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const email = `${provider}.${role}@mock.nexawork.local`;
  const name = `${providerName} ${roleLabel}`;
  const providerUserId = `mock-${provider}-${role}`;

  let user = await User.findByEmail(email);

  if (user) {
    if (user.auth_provider && user.auth_provider !== provider) {
      throw createHttpError(
        409,
        `This email is already linked to ${user.auth_provider}`
      );
    }

    if (!user.auth_provider) {
      try {
        user = await User.linkOAuthProvider({
          userId: user.id,
          authProvider: provider,
          authProviderUserId: providerUserId
        });
      } catch {
        return sanitizeUser(user);
      }
    }

    return sanitizeUser(user);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(randomUUID(), 10);
    const createdUser = await User.createWithClient({
      client,
      id: randomUUID(),
      name,
      email,
      passwordHash,
      role,
      authProvider: provider,
      authProviderUserId: providerUserId
    });

    await Profile.createDefault({
      client,
      userId: createdUser.id,
      role,
      name
    });
    await client.query("COMMIT");

    return sanitizeUser(createdUser);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function getOAuthAuthorizationUrl(provider, role = "student") {
  return buildAuthorizationUrl(provider, role);
}

export function getOAuthProviderStatuses() {
  return Object.keys(OAUTH_PROVIDERS).reduce((statuses, provider) => {
    statuses[provider] = {
      configured: isProviderConfigured(provider),
      mockEnabled: !isProviderConfigured(provider) && isMockOAuthAllowed(),
      available: isProviderConfigured(provider) || isMockOAuthAllowed()
    };
    return statuses;
  }, {});
}

export async function loginWithMockOAuth(provider, role = "student") {
  const supportedProviders = Object.keys(OAUTH_PROVIDERS);

  if (!supportedProviders.includes(provider)) {
    throw createHttpError(400, "Unsupported OAuth provider");
  }

  if (!validateRole(role)) {
    throw createHttpError(400, "Role must be student, company, or college");
  }

  if (!isMockOAuthAllowed()) {
    throw createHttpError(503, `${provider} OAuth is not configured`);
  }

  const safeUser = await createMockOAuthUser({ provider, role });
  const token = generateToken({ id: safeUser.id, role: safeUser.role });
  return buildAuthPayload(safeUser, token);
}

export async function completeOAuthLogin({ provider, code, state }) {
  if (!code || !state) {
    throw createHttpError(400, "OAuth callback is missing code or state");
  }

  const parsedState = parseStateToken(state);

  if (parsedState.provider !== provider) {
    throw createHttpError(400, "OAuth provider mismatch");
  }

  if (!validateRole(parsedState.role)) {
    throw createHttpError(400, "Role must be student, company, or college");
  }

  const accessToken = await exchangeCodeForAccessToken(provider, code);
  const providerProfile = await fetchProviderProfile(provider, accessToken);

  let user = await User.findByOAuthIdentity(provider, providerProfile.providerUserId);

  if (!user) {
    const existingUser = await User.findByEmail(providerProfile.email);

    if (existingUser) {
      if (existingUser.auth_provider && existingUser.auth_provider !== provider) {
        throw createHttpError(
          409,
          `This email is already linked to ${existingUser.auth_provider}`
        );
      }

      user =
        existingUser.auth_provider === provider
          ? existingUser
          : await User.linkOAuthProvider({
              userId: existingUser.id,
              authProvider: provider,
              authProviderUserId: providerProfile.providerUserId
            });
    } else {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        user = await createOAuthUser({
          client,
          name: providerProfile.name,
          email: providerProfile.email,
          role: parsedState.role,
          provider,
          providerUserId: providerProfile.providerUserId
        });
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
  }

  const safeUser = sanitizeUser(user);
  const token = generateToken({ id: safeUser.id, role: safeUser.role });
  return buildAuthPayload(safeUser, token);
}
