import ServiceRequest from "../models/ServiceRequest.js";
import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js"; // Import Vendor model to use for population

// @desc    Create a new service request
// @route   POST /api/requests
// @access  Private (User)
export const createRequest = async (req, res) => {
  const { vendorId, serviceId, description, date } = req.body; // serviceId now
  const userId = req.user.id; // Customer making the request

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    let requestData = {
      user: userId,
      service: serviceId, // Reference to Service model
      description,
      date,
      status: "pending",
    };

    if (vendorId) {
      // Validate if vendorId is a valid Vendor _id
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Specified Vendor not found" });
      }
      requestData.vendor = vendorId; // Direct request to a specific vendor
    }

    const request = await ServiceRequest.create(requestData);

    // Populate the newly created request for immediate response
    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
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

    const requests = await ServiceRequest.find({ vendor: vendorProfile._id })
      .populate("user", "name email")
      .populate("vendor", "companyName phone location")
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
    // Check if the current user is a vendor
    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Not authorized to view open requests" });
    }

    // Find requests that are pending and have no vendor assigned
    const requests = await ServiceRequest.find({
      status: "pending",
      vendor: { $exists: false }, // No vendor assigned
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
      .populate("service", "name description");

    if (!request) {
      return res.status(404).json({ message: "Service Request not found" });
    }

    const vendorProfile = await Vendor.findOne({ user: req.user.id });

    // Check if the user is authorized to view this request
    const isOwner = request.user.toString() === req.user.id.toString();
    const isAssignedVendor = vendorProfile && request.vendor && request.vendor._id.toString() === vendorProfile._id.toString();


    if (!isOwner && !isAssignedVendor) {
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

    // Request must be pending
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be accepted" });
    }

    // If request is specifically for this vendor, or it's an open request
    const isDirectlyAssigned = request.vendor && request.vendor.toString() === vendorProfile._id.toString();
    const isOpenRequest = !request.vendor;

    if (!isDirectlyAssigned && !isOpenRequest) {
        return res.status(403).json({ message: "Not authorized to accept this request" });
    }
    
    // Assign vendor and change status
    request.vendor = vendorProfile._id; // Assign the actual Vendor _id
    request.status = "accepted";
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
// @route   PUT /api/requests/:id/cancel
// @access  Private (User)
export const cancelRequest = async (req, res) => {
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

    request.status = "cancelled";
    // If a vendor was assigned, clear it since the request is cancelled by user
    if (request.vendor) {
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