import { randomUUID } from "crypto";
import pool from "../config/db.js";

class Notification {
  constructor({
    id,
    user_id: userId,
    actor_id: actorId,
    type,
    title,
    body,
    data,
    read_at: readAt,
    created_at: createdAt,
    actor_name: actorName,
    actor_role: actorRole
  }) {
    this.id = id;
    this.userId = userId;
    this.actorId = actorId;
    this.type = type;
    this.title = title;
    this.body = body;
    this.data = data || {};
    this.readAt = readAt;
    this.createdAt = createdAt;
    if (actorName) this.actorName = actorName;
    if (actorRole) this.actorRole = actorRole;
  }

  static async create({ userId, actorId = null, type, title, body, data = {} }) {
    const query = `
      INSERT INTO notifications (id, user_id, actor_id, type, title, body, data)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      RETURNING id, user_id, actor_id, type, title, body, data, read_at, created_at
    `;
    const values = [
      randomUUID(),
      userId,
      actorId,
      type,
      title,
      body,
      JSON.stringify(data)
    ];
    const { rows } = await pool.query(query, values);
    return new Notification(rows[0]);
  }

  static async findByUserId(userId, limit = 40) {
    const query = `
      SELECT
        n.id,
        n.user_id,
        n.actor_id,
        n.type,
        n.title,
        n.body,
        n.data,
        n.read_at,
        n.created_at,
        u.name AS actor_name,
        u.role AS actor_role
      FROM notifications n
      LEFT JOIN users u ON u.id = n.actor_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows.map((row) => new Notification(row));
  }

  static async markRead({ notificationId, userId }) {
    const query = `
      UPDATE notifications
      SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, actor_id, type, title, body, data, read_at, created_at
    `;
    const { rows } = await pool.query(query, [notificationId, userId]);
    return rows[0] ? new Notification(rows[0]) : null;
  }

  static async markUnread({ notificationId, userId }) {
    const query = `
      UPDATE notifications
      SET read_at = NULL
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, actor_id, type, title, body, data, read_at, created_at
    `;
    const { rows } = await pool.query(query, [notificationId, userId]);
    return rows[0] ? new Notification(rows[0]) : null;
  }

  static async markAllRead(userId) {
    const query = `
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND read_at IS NULL
    `;
    await pool.query(query, [userId]);
  }

  static async delete({ notificationId, userId }) {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, actor_id, type, title, body, data, read_at, created_at
    `;
    const { rows } = await pool.query(query, [notificationId, userId]);
    return rows[0] ? new Notification(rows[0]) : null;
  }
}

export default Notification;
