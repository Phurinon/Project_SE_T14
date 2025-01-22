const express = require("express");
const { authenticateUser, adminCheck } = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const safetyLevels = await prisma.safetyLevel.findMany({
      orderBy: {
        maxValue: "asc",
      },
    });
    res.json(safetyLevels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching safety levels" });
  }
});

router.post("/", authenticateUser, adminCheck, async (req, res) => {
  try {
    const { label, maxValue, color, description } = req.body;

    if (!label) {
      return res.status(400).json({ message: "Label is required" });
    }
    if (maxValue === undefined || maxValue === null) {
      return res.status(400).json({ message: "MaxValue is required" });
    }
    if (!color) {
      return res.status(400).json({ message: "Color is required" });
    }

    const maxValueInt = parseInt(maxValue);
    if (isNaN(maxValueInt)) {
      return res
        .status(400)
        .json({ message: "MaxValue must be a valid number" });
    }

    const safetyLevel = await prisma.safetyLevel.create({
      data: {
        label,
        maxValue: maxValueInt,
        color,
        description,
      },
    });

    res.status(201).json(safetyLevel);
  } catch (error) {
    console.log("Error creating safety level:", error.message);
    res
      .status(500)
      .json({ message: "Error creating safety level", error: error.message });
  }
});

// Update safety level (admin only)
router.put("/:id", authenticateUser, adminCheck, async (req, res) => {
  try {
    const updatedSafetyLevel = await prisma.safetyLevel.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updatedSafetyLevel);
  } catch (error) {
    res.status(500).json({ message: "Error updating safety level" });
  }
});

// Delete safety level (admin only)
router.delete("/:id", authenticateUser, adminCheck, async (req, res) => {
  try {
    await prisma.safetyLevel.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Safety level deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting safety level" });
  }
});

module.exports = router;
