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
        { vendor: vendorProfile._id }, // Requests where vendor is assigned (including Accepted -> Cancelled)
        { targetedVendor: vendorProfile._id, status: { $in: ["pending", "cancelled"] } }, // Targeted requests that are pending OR cancelled
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
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    request.otp = otp;

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
  const { declineReason } = req.body; // Expect reason from body

  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    // Check if the request is assigned to this vendor OR targeted to this vendor
    const isAssigned = request.vendor && request.vendor.toString() === vendorProfile._id.toString();
    const isTargeted = request.targetedVendor && request.targetedVendor.toString() === vendorProfile._id.toString();

    if (!vendorProfile || (!isAssigned && !isTargeted)) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending" && request.status !== "accepted") {
      return res.status(400).json({ message: "Can only reject pending or accepted requests" });
    }

    if (!declineReason) {
      return res.status(400).json({ message: "Decline reason is required" });
    }

    // Set status to declined
    request.status = "declined";
    request.declineReason = declineReason;
    // We do NOT clear vendor here so the user knows WHO declined it.
    // If it was an OPEN request that was assigned, maybe we should? 
    // But for "declined" status, usually means end of the line for this specific interaction.
    // If the user wants to try another vendor, they create a new request or we need logic to "re-open".
    // For now, prompt implies explicit "DECLINED" status.

    // Ensure the vendor field is set to the declining vendor if it wasn't already (e.g. for targeted pending)
    if (!request.vendor) {
      request.vendor = vendorProfile._id;
    }

    await request.save();

    // Update vendor's job stats (cancelled/declined jobs count similarly?)
    if (vendorProfile && vendorProfile.totalJobs !== undefined && vendorProfile.cancelledJobs !== undefined) {
      // Maybe we count declined as cancelled for stats? Or separate? 
      // Using cancelledJobs for now as per previous logic.
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
  const { otp } = req.body; // Expect OTP
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

    // Verify OTP
    if (!otp || request.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please check with customer." });
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
      // Do NOT clear request.vendor so it shows in vendor dashboard history
      // request.vendor = undefined; 
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

// @desc    Rate a completed service request (by User)
// @route   POST /api/requests/:id/rate
// @access  Private (User)
export const rateVendor = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to rate this request" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({ message: "Only completed requests can be rated" });
    }

    if (request.rating) {
      return res.status(400).json({ message: "You have already rated this service" });
    }

    request.rating = rating;
    // Optionally store comment if schema allows, schema update needed for comment
    await request.save();

    const vendorProfile = await Vendor.findById(request.vendor);
    if (vendorProfile) {
      // Calculate new average
      // Simple approach: Moving Average
      const ratedRequests = await ServiceRequest.find({ vendor: vendorProfile._id, rating: { $ne: null } });
      const ratingSum = ratedRequests.reduce((acc, curr) => acc + curr.rating, 0);
      const ratingCount = ratedRequests.length;

      vendorProfile.ratingAverage = ratingSum / ratingCount;
      await vendorProfile.save();
      await calculateTrustScore(vendorProfile._id);
    }

    res.json({ message: "Rating submitted successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};