import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Job from "../models/Job.js";

// @desc    Get statistics for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: "user" });
    const vendorsCount = await Vendor.countDocuments({});
    const jobsCount = await Job.countDocuments({});
    const completedJobs = await Job.countDocuments({ status: "completed" });
    const pendingJobs = await Job.countDocuments({ status: "pending" });

    res.json({
      usersCount,
      vendorsCount,
      jobsCount,
      completedJobs,
      pendingJobs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).populate("user", "name email");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private/Admin
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
      // also delete the associated user
      await User.findByIdAndDelete(vendor.user);
      await vendor.deleteOne();
      res.json({ message: "Vendor removed" });
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get jobs with filter
// @route   GET /api/admin/jobs
// @access  Private/Admin
export const getJobs = async (req, res) => {
  const { filter } = req.query;
  let jobs;

  try {
    if (filter === "day") {
      jobs = await Job.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    } else if (filter === "month") {
      jobs = await Job.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    } else if (filter === "year") {
      jobs = await Job.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    } else {
      jobs = await Job.find({})
        .populate("user", "name")
        .populate("vendor", "name");
    }
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
