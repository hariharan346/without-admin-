import express from "express";
import {
  createRequest,
  getUserRequests,
  getVendorRequests,
  getOpenRequests, // Renamed from getPendingRequests
  getRequestById,
  acceptRequest,
  rejectRequest,
  completeRequest,
  cancelRequest,
} from "../controllers/serviceRequest.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { vendor } from "../middleware/role.middleware.js"; // Import vendor middleware

const router = express.Router();

/**
 * USER ROUTES
 */
router.post("/", protect, createRequest); // Only authenticated users can create requests
router.get("/my", protect, getUserRequests); // Only authenticated users can get their requests
router.put("/:id/cancel", protect, cancelRequest); // Users can cancel their own requests

/**
 * VENDOR ROUTES
 */
router.get("/vendor", protect, vendor, getVendorRequests); // Only authenticated vendors can get their assigned requests
router.get("/open", protect, vendor, getOpenRequests); // Only authenticated vendors can view open requests
router.put("/:id/accept", protect, vendor, acceptRequest); // Only assigned vendors can accept requests
router.put("/:id/reject", protect, vendor, rejectRequest); // Only assigned vendors can reject requests
router.put("/:id/complete", protect, vendor, completeRequest); // Only assigned vendors can complete requests

/**
 * COMMON
 */
router.get("/:id", protect, getRequestById); // Authenticated user or assigned vendor can view request details

export default router;