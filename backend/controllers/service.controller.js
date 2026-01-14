import ServiceCategory from "../models/ServiceCategory.js";
import Service from "../models/Service.js";
import Vendor from "../models/Vendor.js";
import slugify from "../utils/slugify.js";

// @desc    Create a new service category
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req, res) => {
  console.log("--- Create Category ---");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { name, description } = req.body;
  const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

  try {
    const slug = slugify(name);
    const categoryExists = await ServiceCategory.findOne({ slug });

    if (categoryExists) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = await ServiceCategory.create({
      name,
      slug,
      description,
      image,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) {
      const newSlug = slugify(name);
      if (newSlug !== category.slug) {
        const categoryWithSameSlug = await ServiceCategory.findOne({
          slug: newSlug,
        });
        if (categoryWithSameSlug) {
          return res
            .status(400)
            .json({ message: "Another category with this name already exists" });
        }
      }
      category.name = name;
      category.slug = newSlug;
    }
    if (description) {
      category.description = description;
    }
    if (req.file) {
      category.image = `/uploads/categories/${req.file.filename}`;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Service.deleteMany({ category: category._id });

    await category.deleteOne();
    res.json({ message: "Category and its services removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single service category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const category = await ServiceCategory.findOne({ slug }).populate({
      path: 'services',
      populate: {
        path: 'category',
        model: 'ServiceCategory'
      }
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all service categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({}).populate("services");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Admin
export const createService = async (req, res) => {
  const { name, description, category: categoryId } = req.body;
  const image = req.file ? `/uploads/services/${req.file.filename}` : null;

  try {
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const slug = slugify(name);
    const serviceExists = await Service.findOne({ slug });

    if (serviceExists) {
      return res
        .status(400)
        .json({ message: "Service with this name already exists" });
    }

    const service = await Service.create({
      name,
      slug,
      description,
      image,
      category: categoryId,
    });

    category.services.push(service._id);
    await category.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Admin
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (name) {
      const newSlug = slugify(name);
      if (newSlug !== service.slug) {
        const serviceWithSameSlug = await Service.findOne({ slug: newSlug });
        if (serviceWithSameSlug) {
          return res
            .status(400)
            .json({ message: "Another service with this name already exists" });
        }
      }
      service.name = name;
      service.slug = newSlug;
    }
    if (description) {
      service.description = description;
    }
    if (req.file) {
      service.image = `/uploads/services/${req.file.filename}`;
    }

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Admin
export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Remove service reference from categories
    await ServiceCategory.updateMany(
      { _id: service.category },
      { $pull: { services: id } }
    );

    await service.deleteOne();
    res.json({ message: "Service removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single service by slug
// @route   GET /api/services/:slug
// @access  Public
export const getServiceBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const service = await Service.findOne({ slug });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    console.log("SERVICE FOUND:", service); // Debugging log

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
  try {
    const { categoryId, location } = req.query;
    let query = {};

    if (location) {
      // Find vendors in this location
      const vendors = await Vendor.find({
        location: { $regex: location, $options: "i" },
        isAvailable: true
      }).select("servicesProvided");

      // Extract unique service IDs
      const serviceIds = new Set();
      vendors.forEach(v => {
        v.servicesProvided.forEach(sp => {
          if (sp.isActive) serviceIds.add(sp.serviceId.toString());
        });
      });

      // If categoryId is also present, it will just add to the query
      query._id = { $in: Array.from(serviceIds) };
    }

    if (categoryId) {
      query.category = categoryId;
    }

    const services = await Service.find(query);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};