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

async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsDir);
  return entries
    .filter((file) => file.endsWith(".sql") && !file.endsWith(".down.sql"))
    .sort();
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    "SELECT filename FROM schema_migrations ORDER BY filename ASC"
  );
  return new Set(rows.map((row) => row.filename));
}

async function runMigrations() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const files = await getMigrationFiles();
    const applied = await getAppliedMigrations(client);

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping ${file}`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");

      console.log(`Applied ${file}`);
    }

    console.log("Migration run complete");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
