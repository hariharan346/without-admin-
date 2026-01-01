import Job from "../models/Job.js";

/**
 * CREATE JOB (USER)
 */
export const createJob = async (req, res) => {
  const { vendor, service, description, date } = req.body;

  try {
    const jobData = {
      customer: req.user.id,
      service,
      description,
      date,
    };

    if (vendor) {
      jobData.vendor = vendor;
    }

    const job = await Job.create(jobData);

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ACCEPT JOB (VENDOR)
 */
export const acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If it's a direct request, check if the job belongs to the vendor
    if (job.vendor && job.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (job.status !== "pending") {
      return res.status(400).json({ message: "Job already processed" });
    }

    job.status = "accepted";
    // If it's an open request, assign the vendor
    if (!job.vendor) {
      job.vendor = req.user.id;
    }

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * REJECT JOB (VENDOR)
 */
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "vendor" || job.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (job.status !== "pending") {
      return res.status(400).json({ message: "Cannot reject this job" });
    }

    job.status = "rejected";
    await job.save();

    res.json({ message: "Job rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * CANCEL JOB (USER)
 */
export const cancelJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (job.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed job" });
    }

    job.status = "cancelled";
    await job.save();

    res.json({ message: "Job cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * COMPLETE JOB (VENDOR)
 */
export const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "vendor" || job.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (job.status !== "accepted") {
      return res.status(400).json({ message: "Job not accepted yet" });
    }

    job.status = "completed";
    await job.save();

    res.json({ message: "Job completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET USER JOBS (USER)
 */
export const getUserJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ customer: req.user.id })
      .populate("vendor", "name email")
      .populate("customer", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET VENDOR JOBS (VENDOR DASHBOARD)
 */
export const getVendorJobs = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const jobs = await Job.find({ vendor: req.user.id }).populate(
      "customer",
      "name email"
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingJobs = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const jobs = await Job.find({
      status: "pending",
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * GET JOB WITH VENDOR DETAILS (USER → VIEW DETAILS)
 */
export const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.jobId)
    .populate("customer", "-password")
    .populate("vendor", "-password");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
};
