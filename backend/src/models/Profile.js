import { randomUUID } from "crypto";
import pool from "../config/db.js";

const PROFILE_TABLES = {
  student: "student_profiles",
  company: "company_profiles",
  college: "college_profiles"
};

class Profile {
  constructor(data) {
    const {
      id,
      user_id: userId,
      created_at: createdAt,
      resume_url: resumeUrl,
      company_name: companyName,
      college_name: collegeName,
      ...rest
    } = data;
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    Object.assign(this, rest);

    if (resumeUrl !== undefined) {
      this.resumeUrl = resumeUrl;
    }

    if (companyName !== undefined) {
      this.companyName = companyName;
    }

    if (collegeName !== undefined) {
      this.collegeName = collegeName;
    }
  }

  static getTableName(role) {
    return PROFILE_TABLES[role];
  }

  static async createDefault({ client = pool, userId, role, name }) {
    const tableName = this.getTableName(role);

    if (!tableName) {
      throw new Error("Unsupported role for profile creation");
    }

    const profileFactories = {
      student: {
        query: `
          INSERT INTO student_profiles (id, user_id, skills, resume_url, projects)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, user_id, skills, resume_url, projects, created_at
        `,
        values: [randomUUID(), userId, [], "", []]
      },
      company: {
        query: `
          INSERT INTO company_profiles (id, user_id, company_name, description)
          VALUES ($1, $2, $3, $4)
          RETURNING id, user_id, company_name, description, created_at
        `,
        values: [randomUUID(), userId, name, ""]
      },
      college: {
        query: `
          INSERT INTO college_profiles (id, user_id, college_name, location)
          VALUES ($1, $2, $3, $4)
          RETURNING id, user_id, college_name, location, created_at
        `,
        values: [randomUUID(), userId, name, ""]
      }
    };

    const { query, values } = profileFactories[role];
    const { rows } = await client.query(query, values);
    return new Profile(rows[0]);
  }

  static async findByUserId(userId, role) {
    const tableName = this.getTableName(role);

    if (!tableName) {
      return null;
    }

    const query = `
      SELECT *
      FROM ${tableName}
      WHERE user_id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] ? new Profile(rows[0]) : null;
  }

  static async getStudentProfileByUserId(userId) {
    const query = `
      SELECT id, user_id, skills, resume_url, projects, created_at
      FROM student_profiles
      WHERE user_id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] ? new Profile(rows[0]) : null;
  }

  static async upsertStudentProfile(userId, payload) {
    const query = `
      INSERT INTO student_profiles (id, user_id, skills, resume_url, projects)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        skills = EXCLUDED.skills,
        resume_url = EXCLUDED.resume_url,
        projects = EXCLUDED.projects
      RETURNING id, user_id, skills, resume_url, projects, created_at
    `;
    const values = [
      randomUUID(),
      userId,
      payload.skills ?? [],
      payload.resumeUrl ?? "",
      payload.projects ?? []
    ];
    const { rows } = await pool.query(query, values);
    return new Profile(rows[0]);
  }

  static async upsertCompanyProfile(userId, payload) {
    const query = `
      INSERT INTO company_profiles (id, user_id, company_name, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        company_name = EXCLUDED.company_name,
        description = EXCLUDED.description
      RETURNING id, user_id, company_name, description, created_at
    `;
    const values = [
      randomUUID(),
      userId,
      payload.companyName,
      payload.description ?? ""
    ];
    const { rows } = await pool.query(query, values);
    return new Profile(rows[0]);
  }

  static async upsertCollegeProfile(userId, payload) {
    const query = `
      INSERT INTO college_profiles (id, user_id, college_name, location)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        college_name = EXCLUDED.college_name,
        location = EXCLUDED.location
      RETURNING id, user_id, college_name, location, created_at
    `;
    const values = [
      randomUUID(),
      userId,
      payload.collegeName,
      payload.location ?? ""
    ];
    const { rows } = await pool.query(query, values);
    return new Profile(rows[0]);
  }

  static async updateByUserId(userId, role, payload) {
    const updateStrategies = {
      student: {
        query: `
          UPDATE student_profiles
          SET
            skills = COALESCE($2, skills),
            resume_url = COALESCE($3, resume_url),
            projects = COALESCE($4, projects)
          WHERE user_id = $1
          RETURNING id, user_id, skills, resume_url, projects, created_at
        `,
        values: [
          userId,
          payload.skills ?? null,
          payload.resumeUrl ?? null,
          payload.projects ?? null
        ]
      },
      company: {
        query: `
          UPDATE company_profiles
          SET
            company_name = COALESCE($2, company_name),
            description = COALESCE($3, description)
          WHERE user_id = $1
          RETURNING id, user_id, company_name, description, created_at
        `,
        values: [userId, payload.companyName ?? null, payload.description ?? null]
      },
      college: {
        query: `
          UPDATE college_profiles
          SET
            college_name = COALESCE($2, college_name),
            location = COALESCE($3, location)
          WHERE user_id = $1
          RETURNING id, user_id, college_name, location, created_at
        `,
        values: [userId, payload.collegeName ?? null, payload.location ?? null]
      }
    };

    const strategy = updateStrategies[role];

    if (!strategy) {
      return null;
    }

    const { query, values } = strategy;
    const { rows } = await pool.query(query, values);
    return rows[0] ? new Profile(rows[0]) : null;
  }
}

export default Profile;
