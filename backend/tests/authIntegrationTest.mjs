import app from "../src/app.js";
import pool from "../src/config/db.js";

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json().catch(() => null);

  return {
    status: response.status,
    body
  };
}

async function run() {
  if (!pool.isConfigured) {
    console.log(
      JSON.stringify(
        {
          skipped: true,
          reason:
            "Database is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and DB_PORT."
        },
        null,
        2
      )
    );
    return;
  }

  const server = app.listen(0);
  const email = `integration-${Date.now()}@example.com`;
  const password = "password123";

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}/api`;

    const health = await request(baseUrl, "/health");

    if (!health.body?.database?.connected) {
      throw new Error(
        `Database connection check failed: ${health.body?.database?.error || "unknown error"}`
      );
    }

    if (!health.body?.database?.usersTableReady) {
      throw new Error(
        "users table is missing required columns. Run npm run migrate in backend."
      );
    }

    const registerResponse = await request(baseUrl, "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Integration Test User",
        email,
        password,
        role: "student"
      })
    });

    if (registerResponse.status !== 201 || !registerResponse.body?.token) {
      throw new Error(
        `Register failed with status ${registerResponse.status}: ${JSON.stringify(registerResponse.body)}`
      );
    }

    const loginResponse = await request(baseUrl, "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (loginResponse.status !== 200 || !loginResponse.body?.token) {
      throw new Error(
        `Login failed with status ${loginResponse.status}: ${JSON.stringify(loginResponse.body)}`
      );
    }

    if (loginResponse.body.user?.email !== email) {
      throw new Error("Login response returned an unexpected user payload");
    }

    console.log(
      JSON.stringify(
        {
          success: true,
          registeredUserId: registerResponse.body.user.id,
          loginUserId: loginResponse.body.user.id,
          email
        },
        null,
        2
      )
    );
  } finally {
    await pool
      .query("DELETE FROM users WHERE email = $1", [email])
      .catch(() => null);
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
