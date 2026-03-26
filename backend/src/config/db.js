import "dotenv/config";
import pkg from "pg";
import createHttpError from "../utils/createHttpError.js";
import env from "./env.js";

const { Pool } = pkg;

function createPoolConfig() {
  if (env.databaseUrl) {
    return {
      connectionString: env.databaseUrl
    };
  }

  if (!env.hasDatabaseConfig) {
    return null;
  }

  return {
    host: env.dbHost,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    port: env.dbPort
  };
}

const rawPoolConfig = createPoolConfig();
const rawPool = rawPoolConfig ? new Pool(rawPoolConfig) : null;

function createDatabaseUnavailableError() {
  return createHttpError(
    503,
    "Database is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and DB_PORT."
  );
}

if (rawPool) {
  rawPool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error.message);
  });
}

const pool = {
  isConfigured: Boolean(rawPool),
  async query(text, params) {
    if (!rawPool) {
      throw createDatabaseUnavailableError();
    }

    return rawPool.query(text, params);
  },
  async connect() {
    if (!rawPool) {
      throw createDatabaseUnavailableError();
    }

    return rawPool.connect();
  },
  async end() {
    if (!rawPool) {
      return;
    }

    return rawPool.end();
  }
};

export async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS schema_name,
        NOW() AS connected_at
    `);
    return rows[0];
  } finally {
    client.release();
  }
}

export async function checkUsersTableExists() {
  if (!pool.isConfigured) {
    return false;
  }

  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name IN ('email', 'password_hash')
        GROUP BY table_name
        HAVING COUNT(DISTINCT column_name) = 2
      ) AS exists
    `
  );

  return Boolean(rows[0]?.exists);
}

export default pool;
