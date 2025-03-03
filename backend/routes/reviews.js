const express = require("express");
const {
  authenticateUser,
  adminCheck,
  storeCheck,
} = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");

const router = express.Router();

// Get reviews by shopId
router.get("/shop/:shopId", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        shopId: parseInt(req.params.shopId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        likedBy: {
          select: {
            userId: true,
          },
        },
      },
    });
    res.json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});
// Create review
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { content, rating, comment, shopId } = req.body;

    // Check if user has already reviewed this shop
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        shopId: parseInt(shopId),
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this shop" });
    }

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        comment,
        shopId: parseInt(shopId),
        userId: req.user.id,
      },
    });

    // Update shop rating
    const reviews = await prisma.review.findMany({
      where: { shopId: parseInt(shopId) },
    });

    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    await prisma.shop.update({
      where: { id: parseInt(shopId) },
      data: { rating: averageRating },
    });

    res.status(201).json(review);
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating review" });
  }
});

// Update review
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error updating review" });
  }
});

// Report review
router.post("/:id/report", authenticateUser, async (req, res) => {
  try {
    const { reason } = req.body;
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: {
        reported: true,
        reason,
      },
    });
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error reporting review" });
  }
});

// Shop owner reply to review
router.post("/:id/reply", authenticateUser, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await prisma.review.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { shop: true },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.shop.userId !== req.user.id) {
      return res.status(403).json({ message: "Only shop owner can reply" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: { reply },
      include: {  // เพิ่ม include
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error replying to review" });
  }
});

// เพิ่มไลค์ให้รีวิว
router.post("/like/:id", authenticateUser, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    // Check if user has already liked this review
    const existingLike = await prisma.reviewLike.findFirst({
      where: {
        userId: req.user.id,
        reviewId: reviewId,
      },
    });

    if (existingLike) {
      // Unlike the review
      await prisma.reviewLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Get the updated likes count
      const likesCount = await prisma.reviewLike.count({
        where: {
          reviewId: reviewId,
        },
      });

      // Update the review with correct likes count
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
          likes: likesCount, // Set the exact count instead of incrementing/decrementing
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          likedBy: {
            select: {
              userId: true,
            },
          },
        },
      });

      return res.status(200).json({ 
        message: "Unliked successfully", 
        review,
        userLiked: false 
      });
    }

    // Like the review
    await prisma.reviewLike.create({
      data: {
        userId: req.user.id,
        reviewId: reviewId,
      },
    });

    // Get the updated likes count
    const likesCount = await prisma.reviewLike.count({
      where: {
        reviewId: reviewId,
      },
    });

    // Update the review with correct likes count
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        likes: likesCount, // Set the exact count instead of incrementing/decrementing
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        likedBy: {
          select: {
            userId: true,
          },
        },
      },
    });

    res.status(200).json({ 
      message: "Liked successfully", 
      review,
      userLiked: true 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing like/unlike" });
  }
});

// รายงานรีวิว
router.post("/report/:id", authenticateUser, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ message: "Reason for reporting is required" });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reported: true,
        reason,
      },
    });

    res.status(200).json({ message: "Reported successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error reporting review" });
  }
});

router.get("/reported", authenticateUser, adminCheck, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        reported: true,
        status: "pending",
      },
      include: {
        user: {
          select: { name: true },
        },
        shop: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reported reviews" });
  }
});

router.put("/:id/moderate", authenticateUser, adminCheck, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid moderation status",
        validStatuses,
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    // If status is approved, delete the review
    if (status === "approved") {
      await prisma.review.delete({
        where: { id: reviewId },
      });
      return res.json({ message: "Review has been approved and deleted" });
    }

    // If status is rejected, update the review status
    const moderatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        reported: status === "rejected",
      },
    });

    res.json(moderatedReview);
  } catch (error) {
    console.error("Moderation Error:", error);
    res.status(500).json({
      message: "Error moderating review",
      errorDetails: error.message,
    });
  }
});
module.exports = router;
