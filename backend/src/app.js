import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import apiRoutes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import env from "./config/env.js";

const app = express();
const demoJobs = [
  { id: "job-0", title: "Frontend Developer", company: "Google" },
  { id: "job-1", title: "Backend Developer", company: "Amazon" },
  { id: "job-2", title: "Full Stack Developer", company: "Microsoft" }
];

app.disable("x-powered-by");
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "100kb", strict: true }));
const uploadsPath = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.get("/jobs", (req, res) => {
  res.json(demoJobs);
});
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
