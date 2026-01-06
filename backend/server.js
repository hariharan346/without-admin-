import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import serviceRoutes from "./routes/service.routes.js";
import serviceRequestRoutes from "./routes/serviceRequest.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(cors());

app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/api", serviceRoutes);

app.use("/api/requests", serviceRequestRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);

