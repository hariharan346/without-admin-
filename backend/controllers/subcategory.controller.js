import ServiceSubCategory from "../models/ServiceSubCategory.js";
import ServiceCategory from "../models/ServiceCategory.js";
import Service from "../models/Service.js";
import slugify from "../utils/slugify.js";

// @desc    Create a new service subcategory
// @route   POST /api/subcategories
// @access  Admin
export const createSubCategory = async (req, res) => {
  const { name, description, category: categoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const slug = slugify(name);
    const subCategoryExists = await ServiceSubCategory.findOne({ slug });

    if (subCategoryExists) {
      return res
        .status(400)
        .json({ message: "Subcategory with this name already exists" });
    }

    const subCategory = await ServiceSubCategory.create({
      name,
      slug,
      description,
      image,
      category: categoryId,
    });

    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service subcategory
// @route   PUT /api/subcategories/:id
// @access  Admin
export const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const subCategory = await ServiceSubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    if (name) {
      const newSlug = slugify(name);
      if (newSlug !== subCategory.slug) {
        const subCategoryWithSameSlug = await ServiceSubCategory.findOne({
          slug: newSlug,
        });
        if (subCategoryWithSameSlug) {
          return res
            .status(400)
            .json({
              message: "Another subcategory with this name already exists",
            });
        }
      }
      subCategory.name = name;
      subCategory.slug = newSlug;
    }
    if (description) {
      subCategory.description = description;
    }
    if (req.file) {
      subCategory.image = `/uploads/${req.file.filename}`;
    }

    const updatedSubCategory = await subCategory.save();
    res.json(updatedSubCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service subcategory
// @route   DELETE /api/subcategories/:id
// @access  Admin
export const deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const subCategory = await ServiceSubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    await subCategory.deleteOne();
    res.json({ message: "Subcategory removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single service subcategory by slug
// @route   GET /api/subcategories/:slug
//   Public
export const getSubCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const subCategory = await ServiceSubCategory.findOne({ slug }).populate(
      "services"
    );

    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all service subcategories
// @route   GET /api/subcategories
// @access  Public
export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await ServiceSubCategory.find({}).populate(
      "services"
    );
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
