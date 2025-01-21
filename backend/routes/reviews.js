const express = require('express');
const { authenticateUser, adminCheck, storeCheck } = require("../middleware/auth.js");
const prisma = require('../config/prisma.js');

const router = express.Router();

// Get reviews by shopId
router.get('/shop/:shopId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        shopId: parseInt(req.params.shopId),
        status: 'approved'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Create review
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { content, rating, comment, shopId } = req.body;
    
    // Check if user already reviewed this shop
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        shopId: parseInt(shopId)
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this shop' });
    }

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        comment,
        shopId: parseInt(shopId),
        userId: req.user.id
      }
    });

    // Update shop rating
    const reviews = await prisma.review.findMany({
      where: { shopId: parseInt(shopId) }
    });
    
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    
    await prisma.shop.update({
      where: { id: parseInt(shopId) },
      data: { rating: averageRating }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Update review
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Report review
router.post('/:id/report', authenticateUser, async (req, res) => {
  try {
    const { reason } = req.body;
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: {
        reported: true,
        reason
      }
    });
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error reporting review' });
  }
});

// Shop owner reply to review
router.post('/:id/reply', authenticateUser, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await prisma.review.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { shop: true }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.shop.userId !== req.user.id) {
      return res.status(403).json({ message: 'Only shop owner can reply' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: { reply }
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to review' });
  }
});

module.exports = router;