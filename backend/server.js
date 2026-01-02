import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import serviceRoutes from "./routes/service.routes.js";
import jobRoutes from "./routes/job.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
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

app.use("/api/services", serviceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
