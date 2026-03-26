import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";

async function request(baseUrl, name, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    name,
    status: response.status,
    body
  };
}

async function run() {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}/api`;
    const studentToken = jwt.sign(
      { id: "student-1", role: "student" },
      env.jwtSecret,
      { algorithm: "HS256", expiresIn: "1h" }
    );
    const companyToken = jwt.sign(
      { id: "company-1", role: "company" },
      env.jwtSecret,
      { algorithm: "HS256", expiresIn: "1h" }
    );

    const results = [];

    results.push(await request(baseUrl, "health", "/health"));
    results.push(
      await request(baseUrl, "register_invalid", "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "bad",
          password: "123",
          role: "student"
        })
      })
    );
    results.push(await request(baseUrl, "jobs_unauthorized", "/jobs"));
    results.push(
      await request(baseUrl, "job_create_forbidden_student", "/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          title: "Role",
          description: "Desc",
          location: "Remote"
        })
      })
    );
    results.push(
      await request(baseUrl, "job_create_invalid_company", "/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${companyToken}`
        },
        body: JSON.stringify({
          title: "",
          description: "",
          location: ""
        })
      })
    );
    results.push(
      await request(baseUrl, "apply_invalid_student", "/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          jobId: ""
        })
      })
    );
    results.push(
      await request(baseUrl, "post_invalid_student", "/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          content: ""
        })
      })
    );
    results.push(
      await request(baseUrl, "message_invalid_self", "/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          receiverId: "student-1",
          message: "hello"
        })
      })
    );
    results.push(
      await request(baseUrl, "login_db_unavailable", "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123"
        })
      })
    );

    console.log(JSON.stringify(results, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
