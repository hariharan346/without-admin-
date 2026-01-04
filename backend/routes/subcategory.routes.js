import express from "express";
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoryBySlug,
  getAllSubCategories,
} from "../controllers/subcategory.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllSubCategories);
router.get("/:slug", getSubCategoryBySlug);

// Admin only routes
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createSubCategory
);
router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateSubCategory
);
router.delete("/:id", protect, admin, deleteSubCategory);

export default router;
