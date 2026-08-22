const getUserId = require("../utils/getUserId");
const Application = require("../models/application.model");

async function createApplicationController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const { company, role } = req.body;
    if (!company?.trim() || !role?.trim()) {
      return res.status(400).json({ message: "Company and role are required." });
    }

    const application = await Application.create({
      user: userId,
      company: company.trim(),
      role: role.trim(),
      status: req.body.status || "wishlist",
      jobUrl: req.body.jobUrl || "",
      location: req.body.location || "",
      salaryRange: req.body.salaryRange || "",
      jobDescription: req.body.jobDescription || "",
      appliedAt: req.body.appliedAt || null,
      notes: req.body.notes || "",
      nextFollowUp: req.body.nextFollowUp || null,
    });

    res.status(201).json({ message: "Application saved.", application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save application." });
  }
}

async function listApplicationsController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const filter = { user: userId };
    if (req.query.status) filter.status = req.query.status;

    const applications = await Application.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ count: applications.length, applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateApplicationController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const allowed = [
      "company",
      "role",
      "status",
      "jobUrl",
      "location",
      "salaryRange",
      "jobDescription",
      "appliedAt",
      "notes",
      "nextFollowUp",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updates,
      { new: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({ message: "Application updated.", application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update application." });
  }
}

async function deleteApplicationController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const deleted = await Application.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({ message: "Application deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete application." });
  }
}

module.exports = {
  createApplicationController,
  listApplicationsController,
  updateApplicationController,
  deleteApplicationController,
};
