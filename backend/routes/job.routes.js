import express from "express";
import {
  createJob,
  acceptJob,
  rejectJob,
  cancelJob,
  completeJob,
  getUserJobs,
  getVendorJobs,
  getPendingJobs,
  getJobById,
} from "../controllers/job.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * USER ROUTES
 */
router.post("/", protect, createJob);
router.get("/my", protect, getUserJobs);
router.patch("/:jobId/cancel", protect, cancelJob);

/**
 * VENDOR ROUTES
 */
router.get("/vendor", protect, getVendorJobs);
router.get("/vendor/pending", protect, getPendingJobs);
router.patch("/:jobId/accept", protect, acceptJob);
router.patch("/:jobId/reject", protect, rejectJob);
router.patch("/:jobId/complete", protect, completeJob);

/**
 * COMMON
 */
router.get("/:jobId", protect, getJobById);

export default router;

