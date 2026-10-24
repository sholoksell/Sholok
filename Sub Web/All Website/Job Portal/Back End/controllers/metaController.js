import Category from "../models/Category.js";
import Location from "../models/Location.js";
import Job from "../models/Job.js";

// GET /api/meta/categories — All categories with job counts
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });

    // Get job counts for each category
    const totalApproved = await Job.countDocuments({ status: "approved" });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Job.countDocuments({
          category: cat.name,
          status: "approved",
        });
        return {
          _id: cat._id,
          id: cat.name,
          name: cat.name,
          label: cat.label,
          count,
          order: cat.order,
        };
      })
    );

    // Add "all" category at the beginning
    categoriesWithCount.unshift({
      id: "all",
      name: "all",
      label: "সকল",
      count: totalApproved,
      order: -1,
    });

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/meta/locations — All locations
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ order: 1 });
    res.json(locations.map((l) => l.name));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/meta/stats — Public stats (total jobs, companies, etc.)
export const getPublicStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: "approved" });
    const totalCompanies = await Job.distinct("company", { status: "approved" });

    res.json({
      totalJobs,
      totalCompanies: totalCompanies.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/meta/categories — Admin creates category
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/meta/locations — Admin creates location
export const createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
