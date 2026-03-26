import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const parsedPort = Number.parseInt(process.env.PORT || "5000", 10);
const parsedDbPort = Number.parseInt(process.env.DB_PORT || "5432", 10);
const parsedSmtpPort = Number.parseInt(process.env.SMTP_PORT || "587", 10);

function resolveCorsOrigin(value) {
  if (!value || value === "*") {
    return true;
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length <= 1) {
    return origins[0] || true;
  }

  return origins;
}

const dbHost = process.env.DB_HOST || "";
const dbUser = process.env.DB_USER || "";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "";
const databaseUrl = process.env.DATABASE_URL || "";
const dbPort = Number.isNaN(parsedDbPort) ? 5432 : parsedDbPort;
const hasDatabaseConfig = Boolean(
  databaseUrl || (dbHost && dbUser && dbName)
);

const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  allowMockOAuth: process.env.ALLOW_MOCK_OAUTH !== "false",
  port: Number.isNaN(parsedPort) ? 5000 : parsedPort,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  databaseUrl,
  dbHost,
  dbUser,
  dbPassword,
  dbName,
  dbPort,
  hasDatabaseConfig,
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/oauth/google/callback",
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || "",
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  linkedinRedirectUri:
    process.env.LINKEDIN_REDIRECT_URI || "http://localhost:5000/api/auth/oauth/linkedin/callback",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number.isNaN(parsedSmtpPort) ? 587 : parsedSmtpPort,
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@nexawork.local",
  corsOrigin: resolveCorsOrigin(process.env.CORS_ORIGIN || "*"),
  debugErrors: process.env.DEBUG_ERRORS === "true"
};

if (env.isProduction && env.jwtSecret === "change-me") {
  throw new Error("JWT_SECRET must be set in production");
}

export default env;
