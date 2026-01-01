import express from "express";
import {
  getVendorProfile,
  getVendorsByService,
} from "../controllers/vendor.controller.js";

const router = express.Router();

router.get("/", getVendorsByService);
router.get("/:vendorId", getVendorProfile);

export default router;
