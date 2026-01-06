import Vendor from "../models/Vendor.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
export const getAllVendors = async (req, res) => {
  const { service: serviceSlug } = req.query;

  try {
    let vendors;
    if (serviceSlug) {
      const service = await Service.findOne({ slug: serviceSlug });
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      vendors = await Vendor.find({ services: service._id })
        .populate("user", "name email")
        .populate("services");
    } else {
      vendors = await Vendor.find({})
        .populate("user", "name email")
        .populate("services");
    }
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single vendor profile by ID
// @route   GET /api/vendors/:id
// @access  Public
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("user", "name email")
      .populate("services");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle vendor availability
// @route   PUT /api/vendors/availability
// @access  Vendor
export const toggleVendorAvailability = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    vendor.isAvailable = !vendor.isAvailable;
    await vendor.save();

    res.json({
      message: "Vendor availability updated successfully",
      isAvailable: vendor.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor services (during registration or later)
// @route   PUT /api/vendors/services
// @access  Vendor
export const updateVendorServices = async (req, res) => {
  const { services } = req.body; // Expect an array of Service _id's

  try {
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Validate if the provided service IDs are valid
    const validServices = await Service.find({ _id: { $in: services } });
    if (validServices.length !== services.length) {
      return res.status(400).json({ message: "One or more service IDs are invalid" });
    }

    vendor.services = services;
    await vendor.save();

    res.json({ message: "Vendor services updated successfully", services: vendor.services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Contact admin for support
// @route   POST /api/vendors/support
// @access  Vendor
export const contactAdmin = async (req, res) => {
  const { issueType, description } = req.body;
  const vendor = await Vendor.findOne({ user: req.user.id }).populate("user", "name email");

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  const subject = `Vendor Support Request: ${issueType}`;
  const message = `
    <h2>Vendor Support Request</h2>
    <p><strong>Vendor Name:</strong> ${vendor.user.name}</p>
    <p><strong>Vendor Company:</strong> ${vendor.companyName}</p>
    <p><strong>Vendor Email:</strong> ${vendor.user.email}</p>
    <p><strong>Issue Type:</strong> ${issueType}</p>
    <hr />
    <h3>Description:</h3>
    <p>${description}</p>
  `;

  try {
    await sendEmail({
      subject,
      message,
    });
    res.json({ message: "Support request sent successfully." });
  } catch (error) {
    console.error("Error sending support email:", error);
    res.status(500).json({ message: "Failed to send support request." });
  }
};