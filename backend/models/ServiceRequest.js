import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
