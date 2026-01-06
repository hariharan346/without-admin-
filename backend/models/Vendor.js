import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    servicesProvided: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceSubCategory",
      },
    ],
    location: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
