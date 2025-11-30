const mongoose = require("mongoose");

// Schema for individual Text Books
const TextbookSchema = new mongoose.Schema({
  slNo: { type: Number, required: true },
  author: { type: String, required: true },
  title: { type: String, required: true },
  publisher: { type: String, required: true },
  editionYear: { type: String, required: true },
});

// Schema for Modules
const ModuleSchema = new mongoose.Schema({
  moduleNo: { type: Number, required: true },
  description: { type: String, required: true }, // Big text with numbers
  textBookRef: { type: String, required: true }, // "Text Book" (numbers e.g., "1" or "1,2")
  chapter: { type: String, required: true }, // "Chapter" (text with numbers)
  rbt: { type: String, required: true }, // "RBT" (text with numbers)
});

const SyllabusSchema = new mongoose.Schema(
  {
    // Teacher Info (from Auth0 later)
    userId: { type: String, required: true },

    // Basic Info
    semester: { type: Number, required: true },
    courseTitle: { type: String, required: true },
    courseCode: { type: String, required: true },
    credits: { type: Number, required: true },
    totalHours: { type: String, required: true }, // "40+10" etc.
    ltps: { type: String, required: true }, // "3:0:0:0"
    cie: { type: Number, required: true },
    see: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    examType: { type: String, required: true },
    examHours: { type: Number, required: true },

    // Long Text Fields
    courseObjectives: { type: String, required: true },
    teachingLearningProcess: { type: String, required: true },

    // Arrays of Sub-Schemas
    modules: [ModuleSchema],

    // Course Outcomes (Stored as an array of strings for flexibility)
    courseOutcomes: [{ type: String, required: true }],

    textBooks: [TextbookSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Syllabus", SyllabusSchema);
