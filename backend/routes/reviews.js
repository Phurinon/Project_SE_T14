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
        OR: [
          { status: "approved" },
          { status: "pending" },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ReviewLike: {
          select: {
            userId: true,
          },
        },
        shop: {
          select: {
            name: true,
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
      return res
        .status(400)
        .json({ message: "You have already reviewed this shop" });
    }

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        comment,
        shopId: parseInt(shopId),
        userId: req.user.id,
        status: "pending", // เพิ่มบรรทัดนี้
        reported: false    // เพิ่มบรรทัดนี้
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
      include: {
        // เพิ่ม include
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
          likes: likesCount,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ReviewLike: {  // Changed from likedBy to ReviewLike
            select: {
              userId: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: "Unliked successfully",
        review,
        userLiked: false,
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
        likes: likesCount,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ReviewLike: {  // Changed from likedBy to ReviewLike
          select: {
            userId: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Liked successfully",
      review,
      userLiked: true,
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

    if (!reason || reason.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Reason for reporting is required" });
    }

    const reviewToReport = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!reviewToReport) {
      return res.status(404).json({ message: "Review not found" });
    }

    // ป้องกันไม่ให้ user report review ของตัวเอง
    if (reviewToReport.userId === req.user.id) {
      return res
        .status(403)
        .json({ message: "คุณไม่สามารถรีพอตรีวิวของตัวเองได้" });
    }

    // ตรวจสอบว่า user เคย report review นี้หรือยัง
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId,
        userId: req.user.id,
      },
    });

    if (existingReport) {
      return res
        .status(400)
        .json({ message: "You have already reported this review" });
    }

    // สร้าง report ใหม่
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        userId: req.user.id,
        reason,
      },
    });

    // ตรวจสอบจำนวน report
    const reportCount = await prisma.reviewReport.count({
      where: { reviewId },
    });

    // ถ้ามี report เกิน threshold อาจต้องทำการ flag review
    if (reportCount >= 3) {
      // ตั้งเงื่อนไขตามความเหมาะสม
      await prisma.review.update({
        where: { id: reviewId },
        data: { reported: true },
      });
    }

    res.status(200).json({
      message: "Reported successfully",
      report,
      reportCount,
    });
  } catch (error) {
    console.error("Error reporting review:", error);
    res.status(500).json({
      message: "Error reporting review",
      errorDetails: error.message,
    });
  }
});

router.get("/:id/reports", authenticateUser, adminCheck, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const reports = await prisma.reviewReport.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            id: true, // Add user ID to identify user
          },
        },
        review: {
          select: {
            content: true,
            shop: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform reports to include more context
    const detailedReports = reports.map((report) => ({
      id: report.id,
      userId: report.user.id,
      userName: report.user.name,
      userEmail: report.user.email,
      reason: report.reason,
      createdAt: report.createdAt,
      reviewContent: report.review.content,
      shopName: report.review.shop.name,
    }));

    res.json(detailedReports);
  } catch (error) {
    console.error("Error fetching review reports:", error);
    res
      .status(500)
      .json({ message: "Error fetching review reports", error: error.message });
  }
});

router.get("/reported", authenticateUser, adminCheck, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { reported: true },
          { ReviewReport: { some: {} } }
        ],
        AND:{
          status: { not: "rejected" }
        }
      },
      include: {
        user: {
          select: { name: true }
        },
        shop: {
          select: { name: true }
        },
        ReviewReport: {
          select: {
            id: true,
            reason: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const reviewsWithReportCount = reviews.map(review => ({
      ...review,
      reportCount: review.ReviewReport.length,
      reported: review.reported || review.ReviewReport.length > 0,
      reason: review.ReviewReport.length > 0 
        ? review.ReviewReport[0].reason 
        : "Multiple reports"
    }));

    res.json(reviewsWithReportCount);
  } catch (error) {
    console.error("Error fetching reported reviews:", error);
    res.status(500).json({ 
      message: "Error fetching reported reviews",
      error: error.message 
    });
  }
});

router.put("/:id/moderate", authenticateUser, adminCheck, async (req, res) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { status } = req.body;

      // Validate input
      if (!status) {
        return res.status(400).json({
          message: "Status is required",
        });
      }

      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid moderation status",
          validStatuses,
        });
      }

      // Find the existing review
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      // If status is approved, delete the review and its related records
      if (status === "approved") {
        // Delete related ReviewLike records first
        await prisma.reviewLike.deleteMany({
          where: { reviewId: reviewId }
        });

        // Delete related ReviewReport records
        await prisma.reviewReport.deleteMany({
          where: { reviewId: reviewId }
        });

        // Now delete the review
        await prisma.review.delete({
          where: { id: reviewId },
        });

        return { message: "Review has been approved and deleted" };
      }

      // If status is rejected, update the review status and clear reports
      if (status === "rejected") {
        // Delete related ReviewReport records
        await prisma.reviewReport.deleteMany({
          where: { reviewId: reviewId }
        });

        // Update the review to be no longer reported
        const moderatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: {
            status,
            reported: false, // Changed from true to false
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            },
            shop: {
              select: {
                name: true,
              }
            }
          }
        });

        return moderatedReview;
      }

      // For other statuses (pending, etc.)
      const moderatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          status,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          },
          shop: {
            select: {
              name: true,
            }
          }
        }
      });

      return moderatedReview;
    } catch (error) {
      console.error("Moderation Error:", error);
      
      // More detailed error response
      throw {
        message: "Error moderating review",
        errorDetails: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  });

  // Send the response based on the transaction result
  if (transaction.message) {
    res.json(transaction);
  } else {
    res.json(transaction);
  }
});

router.get("/report/check/:id", authenticateUser, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId,
        userId: req.user.id,
      },
    });

    res.json({ hasReported: !!existingReport });
  } catch (error) {
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการตรวจสอบการรายงานรีวิว" });
  }
});

module.exports = router;
