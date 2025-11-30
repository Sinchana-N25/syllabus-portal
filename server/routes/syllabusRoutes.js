const express = require("express");
const router = express.Router();
const Syllabus = require("../models/Syllabus");

// @route   POST /api/syllabus
// @desc    Create a new syllabus entry
router.post("/", async (req, res) => {
  try {
    const newSyllabus = new Syllabus(req.body);
    const savedSyllabus = await newSyllabus.save();
    res.status(201).json(savedSyllabus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/syllabus
// @desc    Get all syllabus (with optional Search functionality)
router.get("/", async (req, res) => {
  try {
    const { search, userId } = req.query;

    // Build query object
    let query = {};

    // If userId is provided, only show that teacher's subjects (optional, based on your preference)
    if (userId) {
      query.userId = userId;
    }

    // If search term exists, filter by Course Title OR Course Code
    if (search) {
      query.$or = [
        { courseTitle: { $regex: search, $options: "i" } }, // 'i' makes it case-insensitive
        { courseCode: { $regex: search, $options: "i" } },
      ];
    }

    const syllabusList = await Syllabus.find(query).sort({ createdAt: -1 }); // Newest first
    res.status(200).json(syllabusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/syllabus/:id
// @desc    Get a single syllabus by ID (for the popup/download)
router.get("/:id", async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) return res.status(404).json({ msg: "Syllabus not found" });
    res.status(200).json(syllabus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/syllabus/:id
// @desc    Delete a syllabus entry
router.delete("/:id", async (req, res) => {
  try {
    const deletedSyllabus = await Syllabus.findByIdAndDelete(req.params.id);
    if (!deletedSyllabus)
      return res.status(404).json({ msg: "Syllabus not found" });
    res.status(200).json({ msg: "Syllabus deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
