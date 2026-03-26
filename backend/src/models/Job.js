import { randomUUID } from "crypto";
import pool from "../config/db.js";

class Job {
  constructor({
    id,
    company_id: companyId,
    company_name: companyName,
    title,
    description,
    location,
    salary,
    created_at: createdAt
  }) {
    this.id = id;
    this.companyId = companyId;
    this.companyName = companyName;
    this.title = title;
    this.description = description;
    this.location = location;
    this.salary = salary;
    this.createdAt = createdAt;
  }

  static async create({ companyId, title, description, location, salary }) {
    const query = `
      INSERT INTO jobs (id, company_id, title, description, location, salary)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, company_id, title, description, location, salary, created_at
    `;
    const values = [
      randomUUID(),
      companyId,
      title,
      description,
      location,
      salary ?? null
    ];
    const { rows } = await pool.query(query, values);
    return new Job(rows[0]);
  }

  static async findAll() {
    const query = `
      SELECT
        j.id,
        j.company_id,
        COALESCE(cp.company_name, u.name) AS company_name,
        j.title,
        j.description,
        j.location,
        j.salary,
        j.created_at
      FROM jobs j
      INNER JOIN users u ON u.id = j.company_id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      ORDER BY j.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => new Job(row));
  }

  static async findByCompanyId(companyId) {
    const query = `
      SELECT
        j.id,
        j.company_id,
        COALESCE(cp.company_name, u.name) AS company_name,
        j.title,
        j.description,
        j.location,
        j.salary,
        j.created_at
      FROM jobs j
      INNER JOIN users u ON u.id = j.company_id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE j.company_id = $1
      ORDER BY j.created_at DESC
    `;
    const { rows } = await pool.query(query, [companyId]);
    return rows.map((row) => new Job(row));
  }

  static async findById(jobId) {
    const query = `
      SELECT
        j.id,
        j.company_id,
        COALESCE(cp.company_name, u.name) AS company_name,
        j.title,
        j.description,
        j.location,
        j.salary,
        j.created_at
      FROM jobs j
      INNER JOIN users u ON u.id = j.company_id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE j.id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [jobId]);
    return rows[0] ? new Job(rows[0]) : null;
  }
}

export default Job;
