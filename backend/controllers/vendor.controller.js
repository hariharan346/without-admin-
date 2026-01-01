import Vendor from "../models/Vendor.js";

export const getVendorProfile = async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId).populate(
    "user",
    "-password"
  );
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });
  res.json(vendor);
};

export const getVendorsByService = async (req, res) => {
  const { service } = req.query;
  const vendors = await Vendor.find({ services: service }).populate(
    "user",
    "-password"
  );
  res.json(vendors);
};
