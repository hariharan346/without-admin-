import ServiceCategory from "../models/ServiceCategory.js";
import Service from "../models/Service.js";
import ServiceSubCategory from "../models/ServiceSubCategory.js";
import slugify from "../utils/slugify.js";

// @desc    Create a new service category
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

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
      category.image = `/uploads/${req.file.filename}`;
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

    // Also delete subcategories when a category is deleted
    await ServiceSubCategory.deleteMany({ category: category._id });

    await category.deleteOne();
    res.json({ message: "Category and its subcategories removed" });
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
    const category = await ServiceCategory.findOne({ slug }).populate(
      "services"
    );

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
    const categories = await ServiceCategory.find({}).populate({
      path: "subcategories",
      populate: {
        path: "services",
        model: "Service",
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Admin
export const createService = async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
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
    });

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
      service.image = `/uploads/${req.file.filename}`;
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

    // Remove service reference from subcategories
    await ServiceSubCategory.updateMany(
      { services: id },
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
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};