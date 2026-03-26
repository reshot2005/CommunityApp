import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFile = path.join(__dirname, "seeders", "seed.sql");

async function runSeed() {
  const client = await pool.connect();

  try {
    const sql = await fs.readFile(seedFile, "utf8");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Seed complete");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
