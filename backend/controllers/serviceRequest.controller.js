import ServiceRequest from "../models/ServiceRequest.js";
import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js"; // Import Vendor model to use for population
import { calculateTrustScore } from "./vendor.controller.js"; // Import calculateTrustScore


// @desc    Create a new service request
// @route   POST /api/requests
// @access  Private (User)
export const createRequest = async (req, res) => {
  const { vendorId, serviceId, description, date } = req.body;
  const userId = req.user.id; // Customer making the request

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    // Determine request type based on vendorId presence
    const requestType = vendorId ? "TARGETED" : "OPEN";
    
    let requestData = {
      user: userId,
      service: serviceId,
      description,
      date,
      status: "pending",
      requestType, // Set determined request type
    };

    // If it's a targeted request, validate the vendor
    if (requestType === "TARGETED") {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Targeted Vendor not found" });
      }
      requestData.targetedVendor = vendorId;
    }

    const request = await ServiceRequest.create(requestData);

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("targetedVendor", "companyName phone location") // Populate targetedVendor
      .populate("service", "name description");

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all service requests for the logged-in user (customer)
// @route   GET /api/requests/my
// @access  Private (User)
export const getUserRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user.id })
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("service", "name description")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all service requests for the logged-in vendor
// @route   GET /api/requests/vendor
// @access  Private (Vendor)
export const getVendorRequests = async (req, res) => {
  try {
    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found for this user" });
    }

    const requests = await ServiceRequest.find({
      $or: [
        { vendor: vendorProfile._id }, // Requests where vendor is assigned
        { targetedVendor: vendorProfile._id, status: "pending" }, // Targeted requests that are still pending
      ],
    })
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("targetedVendor", "companyName phone location") // Populate targetedVendor
      .populate("service", "name description")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get open pending service requests (not assigned to any vendor yet)
// @route   GET /api/requests/open
// @access  Private (Vendor)
export const getOpenRequests = async (req, res) => {
  try {
    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Vendor profile not found for this user" });
    }

    // Find requests that are OPEN, pending, and not yet assigned to any vendor
    const requests = await ServiceRequest.find({
      requestType: "OPEN",
      status: "pending",
      vendor: { $exists: false },
    })
      .populate("user", "name email")
      .populate("service", "name description")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get a single service request by ID
// @route   GET /api/requests/:id
// @access  Private (User or Vendor if assigned)
export const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("targetedVendor", "companyName phone location") // Populate targetedVendor
      .populate("service", "name description");

    if (!request) {
      return res.status(404).json({ message: "Service Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });

    // Check if the user is authorized to view this request
    const isOwner = request.user.toString() === req.user.id.toString();
    const isAssignedVendor = vendorProfile && request.vendor && request.vendor._id.toString() === vendorProfile._id.toString();
    const isTargetedVendor = vendorProfile && request.targetedVendor && request.targetedVendor._id.toString() === vendorProfile._id.toString();


    if (!isOwner && !isAssignedVendor && !isTargetedVendor) {
      return res.status(403).json({ message: "Not authorized to view this request" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Vendor accepts a service request
// @route   PUT /api/requests/:id/accept
// @access  Private (Vendor)
export const acceptRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Vendor profile not found for this user" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be accepted" });
    }

    // Authorization check: vendor can accept if it's an open request or they are the targeted vendor
    const isTargetedToThisVendor = request.requestType === "TARGETED" && request.targetedVendor && request.targetedVendor.toString() === vendorProfile._id.toString();
    const isOpenRequest = request.requestType === "OPEN" && !request.vendor;

    if (!isTargetedToThisVendor && !isOpenRequest) {
        return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    // Assign vendor and change status
    request.vendor = vendorProfile._id; // Assign the actual Vendor _id
    request.status = "accepted";
    await request.save();

    // Update vendor's job stats and trust score
    vendorProfile.totalJobs += 1;
    vendorProfile.acceptedJobs += 1;
    await vendorProfile.save();
    await calculateTrustScore(vendorProfile._id);

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("targetedVendor", "companyName phone location") // Populate targetedVendor
      .populate("service", "name description");


    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Vendor rejects a service request
// @route   PUT /api/requests/:id/reject
// @access  Private (Vendor)
export const rejectRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile || request.vendor.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending" && request.status !== "accepted") {
      return res.status(400).json({ message: "Can only reject pending or accepted requests" });
    }
    
    // If a request is rejected, we set its status to cancelled and clear the vendor association
    request.status = "cancelled";
    request.vendor = undefined; // Clear vendor association on rejection
    await request.save();

    // Update vendor's job stats and trust score
    // Check if vendorProfile exists and has the necessary fields
    if (vendorProfile && vendorProfile.totalJobs !== undefined && vendorProfile.cancelledJobs !== undefined) {
      vendorProfile.cancelledJobs += 1;
      await vendorProfile.save();
      await calculateTrustScore(vendorProfile._id);
    }


    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("service", "name description");

    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor marks a service request as completed
// @route   PUT /api/requests/:id/complete
// @access  Private (Vendor)
export const completeRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile || request.vendor.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this request" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted requests can be completed" });
    }

    request.status = "completed";
    await request.save();

    // Recalculate trust score after completion
    await calculateTrustScore(vendorProfile._id);

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("service", "name description");


    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    User cancels a service request
// @route   PATCH /api/requests/:id/user-cancel
// @access  Private (User)
export const userCancelRequest = async (req, res) => {
  const { cancelReason } = req.body;

  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    if (request.status === "completed") {
      return res.status(400).json({ message: "Completed requests cannot be cancelled" });
    }
    
    if (request.status === "cancelled") {
        return res.status(400).json({ message: "Request is already cancelled" });
    }

    const originalStatus = request.status; // Store original status before changing

    request.status = "cancelled";
    request.cancelledBy = req.user.id;
    request.cancelReason = cancelReason || "Cancelled by user";
    request.cancelledAt = new Date();

    // If a vendor was assigned, clear it since the request is cancelled by user
    if (request.vendor) {
        // Find the vendor to update job counts
        const vendorProfile = await Vendor.findById(request.vendor);
        if (vendorProfile) {
            // If the request was accepted, decrement acceptedJobs and increment cancelledJobs
            if (originalStatus === "accepted") {
                vendorProfile.acceptedJobs = Math.max(0, vendorProfile.acceptedJobs - 1);
            }
            vendorProfile.cancelledJobs += 1;
            await vendorProfile.save();
            await calculateTrustScore(vendorProfile._id);
        }
        request.vendor = undefined;
    }
    await request.save();

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("service", "name description");

    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vendor cancels a service request
// @route   PATCH /api/requests/:id/vendor-cancel
// @access  Private (Vendor)
export const vendorCancelRequest = async (req, res) => {
  const { cancelReason } = req.body;

  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile || !request.vendor || request.vendor.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    if (request.status === "completed") {
      return res.status(400).json({ message: "Completed requests cannot be cancelled" });
    }
    
    if (request.status === "cancelled") {
        return res.status(400).json({ message: "Request is already cancelled" });
    }

    const originalStatus = request.status;

    request.status = "cancelled";
    request.cancelledBy = req.user.id; // Vendor user ID
    request.cancelReason = cancelReason || "Cancelled by vendor";
    request.cancelledAt = new Date();

    if (request.vendor) {
        if (originalStatus === "accepted") {
            vendorProfile.acceptedJobs = Math.max(0, vendorProfile.acceptedJobs - 1);
        }
        vendorProfile.cancelledJobs += 1;
        await vendorProfile.save();
        await calculateTrustScore(vendorProfile._id);
        request.vendor = undefined; // Clear vendor association
    }
    await request.save();

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
      .populate("service", "name description");

    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};