const express = require("express");
const { authenticateUser, adminCheck, storeCheck } = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");
const { z } = require("zod");

const router = express.Router();

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content must be less than 500 characters"),
  shopId: z.number().positive("Shop ID must be a positive number"),
});

const reportSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(200, "Reason must be less than 200 characters"),
});

// get comments by shop id
router.get("/shop/:shopId", async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const comments = await prisma.comment.findMany({
      where: {
        shopId: shopId,
        status: "approved",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

// Create comment
router.post("/", authenticateUser, async (req, res) => {
  try {
    // Validate input
    const validatedData = commentSchema.parse(req.body);

    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: validatedData.shopId },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Check if user is active
    if (req.user.status !== "active") {
      return res.status(403).json({
        message: "Your account must be active to post comments",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        shopId: validatedData.shopId,
        userId: req.user.id,
        status: req.user.role === "admin" ? "approved" : "pending",
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
        errors: error.errors,
      });
    }
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Error creating comment" });
  }
});

// Update comment
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check authorization
    if (comment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        status: req.user.role === "admin" ? "approved" : "pending",
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment" });
  }
});

// Report comment
router.post("/:id/report", authenticateUser, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    // Validate report reason
    const validatedData = reportSchema.parse(req.body);

    // Check if comment exists and isn't already reported
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.reported) {
      return res.status(400).json({
        message: "Comment has already been reported",
      });
    }

    // Don't allow reporting your own comment
    if (comment.userId === req.user.id) {
      return res.status(400).json({
        message: "Cannot report your own comment",
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        reported: true,
        reason: validatedData.reason,
        status: "pending", // Reset to pending for review
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
        errors: error.errors,
      });
    }
    console.error("Error reporting comment:", error);
    res.status(500).json({ message: "Error reporting comment" });
  }
});

// Delete comment
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check authorization
    if (comment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

module.exports = router;
