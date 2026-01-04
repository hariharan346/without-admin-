import mongoose from "mongoose";

const serviceSubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
  },
  { timestamps: true }
);

const ServiceSubCategory = mongoose.model(
  "ServiceSubCategory",
  serviceSubCategorySchema
);

export default ServiceSubCategory;