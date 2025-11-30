const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
// 1. Import the routes
const syllabusRoutes = require("./routes/syllabusRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// 2. Use the routes
app.use("/api/syllabus", syllabusRoutes);

app.get("/", (req, res) => {
  res.send("Syllabus Portal API is Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
