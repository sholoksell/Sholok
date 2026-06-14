import Company from "../models/Company.js";
import Job from "../models/Job.js";

// GET /api/companies — All companies
export const getCompanies = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { industry: regex }];
    }

    const companies = await Company.find(filter).sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/companies/:id — Single company with its approved jobs
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Fetch approved jobs for this company
    const jobs = await Job.find({
      companyRef: company._id,
      status: "approved",
    }).sort({ createdAt: -1 });

    res.json({ company, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/companies — Admin/Super Admin creates a company
export const createCompany = async (req, res) => {
  try {
    const company = await Company.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/companies/:id — Admin/Super Admin updates a company
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/companies/:id — Super Admin deletes
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
