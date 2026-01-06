import express from "express";
import {
  getAllVendors,
  getVendorProfile,
  toggleVendorAvailability,
  updateVendorServices,
  contactAdmin,
} from "../controllers/vendor.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { vendor } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllVendors); // Handles filtering by serviceSlug via query
router.get("/:id", getVendorProfile);

// Vendor-specific routes
router.put("/availability", protect, vendor, toggleVendorAvailability);
router.put("/services", protect, vendor, updateVendorServices);
router.post("/support", protect, vendor, contactAdmin);

export default router;