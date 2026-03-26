import { randomUUID } from "crypto";
import pool from "../config/db.js";

class Post {
  constructor({
    id,
    user_id: userId,
    content,
    created_at: createdAt,
    author_name: authorName,
    author_role: authorRole
  }) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.createdAt = createdAt;
    this.authorName = authorName;
    this.authorRole = authorRole;
  }

  static async create({ userId, content }) {
    const query = `
      INSERT INTO posts (id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, content, created_at
    `;
    const values = [randomUUID(), userId, content];
    const { rows } = await pool.query(query, values);
    return new Post(rows[0]);
  }

  static async findAll() {
    const query = `
      SELECT
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        u.name AS author_name,
        u.role AS author_role
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => new Post(row));
  }
}

export default Post;
