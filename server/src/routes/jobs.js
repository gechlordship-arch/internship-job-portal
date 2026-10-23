
import { Router } from "express";
import { pool } from "../config/db.js";
import {
  authenticateToken,
  requireEmployer,
} from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/jobs
// Public endpoint: return all open jobs.
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        j.id,
        j.title,
        j.description,
        j.requirements,
        j.job_type,
        j.location,
        j.is_remote,
        j.application_deadline,
        j.created_at,
        c.name AS company,
        c.location AS company_location
      FROM jobs j
      INNER JOIN companies c ON c.id = j.company_id
      WHERE j.status = 'open'
      ORDER BY j.created_at DESC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      jobs: result.rows,
    });
  } catch (error) {
    console.error("Fetch jobs error:", error.message);
    return res.status(500).json({
      message: "Unable to retrieve jobs.",
    });
  }
});

// POST /api/jobs
// Employers only: create a company profile if needed, then publish a job.
router.post(
  "/",
  authenticateToken,
  requireEmployer,
  async (req, res) => {
    const {
      title,
      description,
      requirements = "",
      jobType = "internship",
      location = "Remote",
      isRemote = false,
      applicationDeadline = null,
      companyName,
      companyDescription = "",
      companyWebsite = "",
      companyLocation = "",
    } = req.body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Job title and description are required.",
      });
    }

    if (title.trim().length > 180) {
      return res.status(400).json({
        message: "Job title must be 180 characters or fewer.",
      });
    }

    if (
      !["internship", "full-time", "part-time", "contract"].includes(jobType)
    ) {
      return res.status(400).json({
        message: "Please choose a valid job type.",
      });
    }

    if (
      typeof requirements !== "string" ||
      typeof location !== "string" ||
      typeof isRemote !== "boolean" ||
      typeof companyName !== "string" ||
      !companyName.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid company and job details.",
      });
    }

    if (
      requirements.length > 10000 ||
      description.trim().length > 20000 ||
      location.trim().length > 150 ||
      companyName.trim().length > 180
    ) {
      return res.status(400).json({
        message: "One or more fields exceed the allowed length.",
      });
    }

    if (
      applicationDeadline !== null &&
      (
        typeof applicationDeadline !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(applicationDeadline) ||
        Number.isNaN(Date.parse(`${applicationDeadline}T00:00:00Z`)) ||
        new Date(`${applicationDeadline}T00:00:00Z`).toISOString().slice(0, 10) !== applicationDeadline
      )
    ) {
      return res.status(400).json({
        message: "Please provide a valid application deadline.",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const companyResult = await client.query(
        `INSERT INTO companies
           (owner_id, name, description, website, location)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (owner_id)
         DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           website = EXCLUDED.website,
           location = EXCLUDED.location
         RETURNING id`,
        [
          req.user.id,
          companyName.trim(),
          companyDescription,
          companyWebsite,
          companyLocation.trim(),
        ]
      );

      const companyId = companyResult.rows[0].id;

      const jobResult = await client.query(
        `INSERT INTO jobs
           (company_id, title, description, requirements, job_type,
            location, is_remote, application_deadline, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
         RETURNING id, title, description, requirements, job_type,
                   location, is_remote, application_deadline, status, created_at`,
        [
          companyId,
          title.trim(),
          description.trim(),
          requirements.trim(),
          jobType,
          location.trim() || "Remote",
          isRemote,
          applicationDeadline,
        ]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Job published successfully.",
        job: {
          ...jobResult.rows[0],
          company: companyName.trim(),
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Create job error:", error.message);

      return res.status(500).json({
        message: "Unable to publish the job.",
      });
    } finally {
      client.release();
    }
  }
);

export default router;
