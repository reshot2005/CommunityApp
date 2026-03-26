import { randomUUID } from "crypto";
import pool from "../config/db.js";
import createHttpError from "../utils/createHttpError.js";

class Application {
  constructor({
    id,
    job_id: jobId,
    student_id: studentId,
    status,
    created_at: createdAt,
    company_name: companyName,
    job_created_at: jobCreatedAt,
    title,
    description,
    location,
    salary
  }) {
    this.id = id;
    this.jobId = jobId;
    this.studentId = studentId;
    this.status = status;
    this.createdAt = createdAt;
    if (companyName) this.companyName = companyName;
    if (jobCreatedAt) this.jobCreatedAt = jobCreatedAt;
    if (title) this.title = title;
    if (description) this.description = description;
    if (location) this.location = location;
    if (salary !== undefined) this.salary = salary;
  }

  static async create({ jobId, studentId }) {
    const query = `
      INSERT INTO applications (id, job_id, student_id, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, job_id, student_id, status, created_at
    `;
    const values = [randomUUID(), jobId, studentId, "applied"];

    try {
      const { rows } = await pool.query(query, values);
      return new Application(rows[0]);
    } catch (error) {
      if (error.code === "23503") {
        throw createHttpError(
          400,
          "Unable to apply with the current account. Please log out and log in again."
        );
      }

      if (error.code === "23505") {
        throw createHttpError(409, "You have already applied to this job");
      }

      throw error;
    }
  }

  static async findAppliedJobsByStudentId(studentId) {
    const query = `
      SELECT
        a.id,
        a.job_id,
        a.student_id,
        a.status,
        a.created_at,
        COALESCE(cp.company_name, u.name) AS company_name,
        j.created_at AS job_created_at,
        j.title,
        j.description,
        j.location,
        j.salary
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN users u ON u.id = j.company_id
      LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC
    `;
    const { rows } = await pool.query(query, [studentId]);
    return rows.map((row) => new Application(row));
  }

  static async deleteByJobIdAndStudentId({ jobId, studentId }) {
    const query = `
      DELETE FROM applications
      WHERE job_id = $1 AND student_id = $2
      RETURNING id, job_id, student_id, status, created_at
    `;
    const { rows } = await pool.query(query, [jobId, studentId]);

    if (!rows[0]) {
      throw createHttpError(404, "Application not found");
    }

    return new Application(rows[0]);
  }
}

export default Application;
