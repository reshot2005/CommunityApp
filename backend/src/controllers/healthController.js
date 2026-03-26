import pool, {
  checkUsersTableExists,
  testDatabaseConnection
} from "../config/db.js";

export async function getHealth(req, res) {
  const health = {
    success: true,
    message: "Server is running",
    database: {
      configured: pool.isConfigured,
      connected: false,
      usersTableReady: false
    }
  };

  if (pool.isConfigured) {
    try {
      const connection = await testDatabaseConnection();
      const usersTableReady = await checkUsersTableExists();

      health.database.connected = true;
      health.database.usersTableReady = usersTableReady;
      health.database.name = connection.database_name;
      health.database.user = connection.database_user;
      health.database.schema = connection.schema_name;
    } catch (error) {
      health.success = false;
      health.database.error = error.message;
    }
  }

  res.status(health.success ? 200 : 503).json(health);
}
