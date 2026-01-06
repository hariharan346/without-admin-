import express from "express";
import {
  createRequest,
  getUserRequests,
  getVendorRequests,
  getOpenRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  completeRequest,
  userCancelRequest, // New function for user cancellation
  vendorCancelRequest, // New function for vendor cancellation
} from "../controllers/serviceRequest.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { vendor } from "../middleware/role.middleware.js"; // Import vendor middleware

const router = express.Router();

/**
 * USER ROUTES
 */
router.post("/", protect, createRequest);
router.get("/my", protect, getUserRequests);
router.patch("/:id/user-cancel", protect, userCancelRequest); // User cancels with reason

/**
 * VENDOR ROUTES
 */
router.get("/vendor", protect, vendor, getVendorRequests);
router.get("/open", protect, vendor, getOpenRequests);
router.put("/:id/accept", protect, vendor, acceptRequest);
router.put("/:id/reject", protect, vendor, rejectRequest);
router.put("/:id/complete", protect, vendor, completeRequest);
router.patch("/:id/vendor-cancel", protect, vendor, vendorCancelRequest); // Vendor cancels with reason

/**
 * COMMON
 */
router.get("/:id", protect, getRequestById);

export default router;