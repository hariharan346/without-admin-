import express from "express";
import {
  getStats,
  getUsers,
  deleteUser,
  getVendors,
  deleteVendor,
  getJobs,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.route("/stats").get(protect, admin, getStats);
router.route("/users").get(protect, admin, getUsers);
router.route("/users/:id").delete(protect, admin, deleteUser);
router.route("/vendors").get(protect, admin, getVendors);
router.route("/vendors/:id").delete(protect, admin, deleteVendor);
router.route("/jobs").get(protect, admin, getJobs);

export default router;
