
import express from "express";
import { pool } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit an application for a job
router.post("/", authenticateToken, async (req, res) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Only student accounts can apply for jobs.",
    });
  }

  const jobId = Number(req.body.jobId);
  const coverLetter =
    typeof req.body.coverLetter === "string"
      ? req.body.coverLetter.trim()
      : "";

  if (!Number.isInteger(jobId) || jobId < 1) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid job.",
    });
  }

  if (coverLetter.length > 5000) {
    return res.status(400).json({
      success: false,
      message: "The cover letter must be 5000 characters or fewer.",
    });
  }

  try {
    const jobResult = await pool.query(
      `SELECT id
       FROM jobs
       WHERE id = $1 AND status = 'open'`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "This job is no longer available.",
      });
    }

    const result = await pool.query(
      `INSERT INTO applications
         (job_id, student_id, cover_letter, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (job_id, student_id) DO NOTHING
       RETURNING id, job_id, student_id, cover_letter, status, applied_at`,
      [jobId, req.user.id, coverLetter || null]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Your application was submitted successfully.",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Submit application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your application right now.",
    });
  }
});

export default router;
