import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getLastAppliedMigration(client) {
  const { rows } = await client.query(`
    SELECT filename
    FROM schema_migrations
    ORDER BY applied_at DESC, id DESC
    LIMIT 1
  `);

  return rows[0]?.filename || null;
}

async function runRollback() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const lastMigration = await getLastAppliedMigration(client);

    if (!lastMigration) {
      console.log("No applied migrations to roll back");
      return;
    }

    const rollbackFile = lastMigration.replace(/\.sql$/, ".down.sql");
    const rollbackPath = path.join(migrationsDir, rollbackFile);
    const rollbackSql = await fs.readFile(rollbackPath, "utf8");

    await client.query("BEGIN");
    await client.query(rollbackSql);
    await client.query("DELETE FROM schema_migrations WHERE filename = $1", [
      lastMigration
    ]);
    await client.query("COMMIT");

    console.log(`Rolled back ${lastMigration}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Rollback failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runRollback();
