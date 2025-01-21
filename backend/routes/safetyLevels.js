const express = require('express');
const { authenticateUser, adminCheck } = require("../middleware/auth.js");
const prisma = require('../config/prisma.js');

const router = express.Router();

// Get all safety levels
router.get('/', async (req, res) => {
  try {
    const safetyLevels = await prisma.safetyLevel.findMany({
      orderBy: {
        maxValue: 'asc'
      }
    });
    res.json(safetyLevels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching safety levels' });
  }
});

// Create safety level (admin only)
router.post('/', authenticateUser, adminCheck, async (req, res) => {
  try {
    const { label, maxValue, color, description, shopId } = req.body;
    console.log(req.body);
    // Check if shop already has a safety level
    const existingLevel = await prisma.safetyLevel.findUnique({
      where: { shopId: parseInt(shopId) }
    });

    if (existingLevel) {
      return res.status(400).json({ message: 'Shop already has a safety level' });
    }

    const safetyLevel = await prisma.safetyLevel.create({
      data: {
        label,
        maxValue,
        color,
        description,
        shopId: parseInt(shopId)
      }
    });
    res.status(201).json(safetyLevel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating safety level' });
  }
});

// Update safety level (admin only)
router.put('/:id', authenticateUser, adminCheck, async (req, res) => {
  try {
    const updatedSafetyLevel = await prisma.safetyLevel.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(updatedSafetyLevel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating safety level' });
  }
});

// Delete safety level (admin only)
router.delete('/:id', authenticateUser, adminCheck, async (req, res) => {
  try {
    await prisma.safetyLevel.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Safety level deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting safety level' });
  }
});

module.exports = router;