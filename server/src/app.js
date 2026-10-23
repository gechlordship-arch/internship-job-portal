
import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Internship and Job Portal API",
    version: "1.0.0",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS server_time"
    );

    res.json({
      status: "ok",
      message: "API and database are connected",
      database: result.rows[0].database,
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

export default app;
