import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import serviceRoutes from "./routes/service.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js"; // Import subcategory routes
import serviceRequestRoutes from "./routes/serviceRequest.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

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

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", serviceRoutes);
app.use("/api/subcategories", subcategoryRoutes); // Mount subcategory routes
app.use("/api/requests", serviceRequestRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
