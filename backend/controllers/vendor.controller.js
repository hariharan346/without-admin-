import Vendor from "../models/Vendor.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
export const getAllVendors = async (req, res) => {
  const { serviceId } = req.query; // Changed from serviceSlug to serviceId

  try {
    let vendors;
    if (serviceId) {
      // Find vendors that provide this specific service
      vendors = await Vendor.find({ "servicesProvided.serviceId": serviceId })
        .populate("user", "name email")
        .populate("servicesProvided.serviceId"); // Populate the service details within servicesProvided
    } else {
      vendors = await Vendor.find({})
        .populate("user", "name email")
        .populate("servicesProvided.serviceId"); // Populate the service details within servicesProvided
    }

    // Format the response to include service details and prices
    const formattedVendors = vendors.map(vendor => {
      const vendorObj = vendor.toObject();
      vendorObj.servicesProvided = vendorObj.servicesProvided.map(serviceEntry => {
        const serviceData = serviceEntry.serviceId; // The populated Service object
        return {
          _id: serviceData._id,
          name: serviceData.name,
          description: serviceData.description,
          image: serviceData.image,
          minPrice: serviceEntry.minPrice,
          maxPrice: serviceEntry.maxPrice,
        };
      });
      return vendorObj;
    });

    res.json(formattedVendors);
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
      .populate("servicesProvided.serviceId"); // Populate the service details within servicesProvided

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const vendorObj = vendor.toObject();
    vendorObj.servicesProvided = vendorObj.servicesProvided.map(serviceEntry => {
      const serviceData = serviceEntry.serviceId; // The populated Service object
      return {
        _id: serviceData._id,
        name: serviceData.name,
        description: serviceData.description,
        image: serviceData.image,
        minPrice: serviceEntry.minPrice,
        maxPrice: serviceEntry.maxPrice,
      };
    });

    res.json(vendorObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get services provided by the authenticated vendor
// @route   GET /api/vendors/me/services
// @access  Vendor
export const getVendorServices = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id })
      .populate("servicesProvided.serviceId");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const formattedServices = vendor.servicesProvided.map(serviceEntry => {
      const serviceData = serviceEntry.serviceId;
      return {
        _id: serviceData._id,
        name: serviceData.name,
        description: serviceData.description,
        image: serviceData.image,
        minPrice: serviceEntry.minPrice,
        maxPrice: serviceEntry.maxPrice,
      };
    });

    res.json(formattedServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manage vendor services (add, update, delete prices)
// @route   PUT /api/vendors/me/services
// @access  Vendor
export const manageVendorServices = async (req, res) => {
  const { servicesProvided } = req.body; // Expect an array of { serviceId, minPrice, maxPrice }

  try {
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Validate incoming servicesProvided array
    if (!Array.isArray(servicesProvided)) {
      return res.status(400).json({ message: "servicesProvided must be an array" });
    }

    const newServicesProvided = [];
    for (const service of servicesProvided) {
      const { serviceId, minPrice, maxPrice } = service;

      if (!serviceId || minPrice === undefined || maxPrice === undefined) {
        return res.status(400).json({ message: "Each service must have serviceId, minPrice, and maxPrice" });
      }

      // Check if serviceId is valid
      const existingService = await Service.findById(serviceId);
      if (!existingService) {
        return res.status(400).json({ message: `Service with ID ${serviceId} not found` });
      }

      // Validate prices
      if (minPrice < 0 || maxPrice < 0 || minPrice >= maxPrice) {
        return res.status(400).json({ message: `Invalid price range for service ${existingService.name}` });
      }

      newServicesProvided.push({
        serviceId: existingService._id,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
      });
    }

    vendor.servicesProvided = newServicesProvided;
    await vendor.save();

    // Populate and format the response
    const updatedVendor = await Vendor.findById(vendor._id)
      .populate("servicesProvided.serviceId");

    const formattedServices = updatedVendor.servicesProvided.map(serviceEntry => {
      const serviceData = serviceEntry.serviceId;
      return {
        _id: serviceData._id,
        name: serviceData.name,
        description: serviceData.description,
        image: serviceData.image,
        minPrice: serviceEntry.minPrice,
        maxPrice: serviceEntry.maxPrice,
      };
    });

    res.json({ message: "Vendor services updated successfully", services: formattedServices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service from vendor's provided services
// @route   DELETE /api/vendors/me/services/:serviceId
// @access  Vendor
export const deleteVendorService = async (req, res) => {
  const { serviceId } = req.params;

  try {
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const initialServiceCount = vendor.servicesProvided.length;
    vendor.servicesProvided = vendor.servicesProvided.filter(
      (service) => service.serviceId.toString() !== serviceId
    );

    if (vendor.servicesProvided.length === initialServiceCount) {
      return res.status(404).json({ message: "Service not found in vendor's offerings" });
    }

    await vendor.save();
    res.json({ message: "Service removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate trust score
export const calculateTrustScore = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    console.error(`Vendor with ID ${vendorId} not found for trust score calculation.`);
    return;
  }

  const { totalJobs, acceptedJobs, cancelledJobs, ratingAverage } = vendor;

  let score = 0;
  if (totalJobs > 0) {
    const acceptanceRate = acceptedJobs / totalJobs;
    const cancellationRate = cancelledJobs / totalJobs;

    // Simple formula: 70% from acceptance, 30% from non-cancellation
    // Can be made more complex with ratingAverage and avgResponseTime
    score = (acceptanceRate * 70) + ((1 - cancellationRate) * 30);
  }

  // Ensure score is within 0-100
  vendor.trustScore = Math.max(0, Math.min(100, Math.round(score)));
  await vendor.save();
  return vendor.trustScore;
};

// @desc    Get vendor's trust score
// @route   GET /api/vendors/:vendorId/trust-score
// @access  Public
export const getVendorTrustScore = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId).select("trustScore");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ trustScore: vendor.trustScore });
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