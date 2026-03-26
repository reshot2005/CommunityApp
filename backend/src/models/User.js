import pool from "../config/db.js";

class User {
  static schemaCapabilitiesPromise = null;

  constructor({
    id,
    name,
    email,
    role,
    auth_provider: authProvider,
    auth_provider_user_id: authProviderUserId,
    created_at: createdAt
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.authProvider = authProvider;
    this.authProviderUserId = authProviderUserId;
    this.createdAt = createdAt;
  }

  static async getSchemaCapabilities() {
    if (!this.schemaCapabilitiesPromise) {
      this.schemaCapabilitiesPromise = (async () => {
        const { rows } = await pool.query(
          `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users'
          `
        );
        const columnNames = new Set(rows.map((row) => row.column_name));

        return {
          hasOAuthColumns:
            columnNames.has("auth_provider") &&
            columnNames.has("auth_provider_user_id")
        };
      })().catch((error) => {
        this.schemaCapabilitiesPromise = null;
        throw error;
      });
    }

    return this.schemaCapabilitiesPromise;
  }

  static buildSelectColumns({ includePasswordHash = false, hasOAuthColumns = false }) {
    const columns = ["id", "name", "email", "role"];

    if (includePasswordHash) {
      columns.push("password_hash");
    }

    if (hasOAuthColumns) {
      columns.push("auth_provider", "auth_provider_user_id");
    } else {
      columns.push(
        "NULL::VARCHAR AS auth_provider",
        "NULL::VARCHAR AS auth_provider_user_id"
      );
    }

    columns.push("created_at");

    return columns.join(", ");
  }

  static async findByEmail(email) {
    const { hasOAuthColumns } = await this.getSchemaCapabilities();
    const query = `
      SELECT ${this.buildSelectColumns({
        includePasswordHash: true,
        hasOAuthColumns
      })}
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const { hasOAuthColumns } = await this.getSchemaCapabilities();
    const query = `
      SELECT ${this.buildSelectColumns({ hasOAuthColumns })}
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] ? new User(rows[0]) : null;
  }

  static async findByIdentifier(identifier) {
    const normalizedIdentifier = String(identifier || "").trim();

    if (!normalizedIdentifier) {
      return null;
    }

    if (normalizedIdentifier.includes("@")) {
      const row = await this.findByEmail(normalizedIdentifier.toLowerCase());
      return row ? new User(row) : null;
    }

    return this.findById(normalizedIdentifier);
  }

  static async create({ id, name, email, passwordHash, role }) {
    return this.createWithClient({
      client: pool,
      id,
      name,
      email,
      passwordHash,
      role
    });
  }

  static async createWithClient({
    client,
    id,
    name,
    email,
    passwordHash = null,
    role,
    authProvider = null,
    authProviderUserId = null
  }) {
    const { hasOAuthColumns } = await this.getSchemaCapabilities();

    if (hasOAuthColumns) {
      const query = `
        INSERT INTO users (
          id,
          name,
          email,
          password_hash,
          role,
          auth_provider,
          auth_provider_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING ${this.buildSelectColumns({ hasOAuthColumns: true })}
      `;
      const values = [id, name, email, passwordHash, role, authProvider, authProviderUserId];
      const { rows } = await client.query(query, values);
      return new User(rows[0]);
    }

    const query = `
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${this.buildSelectColumns({ hasOAuthColumns: false })}
    `;
    const values = [id, name, email, passwordHash, role];
    const { rows } = await client.query(query, values);
    return new User(rows[0]);
  }

  static async findByOAuthIdentity(authProvider, authProviderUserId) {
    const { hasOAuthColumns } = await this.getSchemaCapabilities();

    if (!hasOAuthColumns) {
      return null;
    }

    const query = `
      SELECT ${this.buildSelectColumns({ hasOAuthColumns: true })}
      FROM users
      WHERE auth_provider = $1 AND auth_provider_user_id = $2
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [authProvider, authProviderUserId]);
    return rows[0] ? new User(rows[0]) : null;
  }

  static async linkOAuthProvider({ userId, authProvider, authProviderUserId }) {
    const { hasOAuthColumns } = await this.getSchemaCapabilities();

    if (!hasOAuthColumns) {
      throw new Error(
        "OAuth columns are missing from the users table. Run backend migrations to enable social login."
      );
    }

    const query = `
      UPDATE users
      SET auth_provider = $2, auth_provider_user_id = $3
      WHERE id = $1
      RETURNING ${this.buildSelectColumns({ hasOAuthColumns: true })}
    `;
    const { rows } = await pool.query(query, [userId, authProvider, authProviderUserId]);
    return rows[0] ? new User(rows[0]) : null;
  }
}

export default User;
