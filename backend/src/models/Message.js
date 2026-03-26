import { randomUUID } from "crypto";
import pool from "../config/db.js";

class Message {
  constructor({
    id,
    sender_id: senderId,
    receiver_id: receiverId,
    message,
    created_at: createdAt
  }) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.message = message;
    this.createdAt = createdAt;
  }

  static async create({ senderId, receiverId, message }) {
    const query = `
      INSERT INTO messages (id, sender_id, receiver_id, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, sender_id, receiver_id, message, created_at
    `;
    const values = [randomUUID(), senderId, receiverId, message];
    const { rows } = await pool.query(query, values);
    return new Message(rows[0]);
  }

  static async findConversation(userId, otherUserId) {
    const query = `
      SELECT id, sender_id, receiver_id, message, created_at
      FROM messages
      WHERE
        (sender_id = $1 AND receiver_id = $2)
        OR
        (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `;
    const { rows } = await pool.query(query, [userId, otherUserId]);
    return rows.map((row) => new Message(row));
  }
}

export default Message;
