import express from "express";
import {
  getServices,
  seedServices,
} from "../controllers/service.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getServices);
router.post("/seed", seedServices);

export default router;
