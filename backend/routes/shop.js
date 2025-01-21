const express = require("express");
const {
  authenticateUser,
  adminCheck,
  storeCheck,
} = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");
// const cloudinary = require("cloudinary").v2;

// Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const router = express.Router();

// Get all shops
router.get("/", async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        safetyLevel: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    res.json(shops);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching shops" });
  }
});

// Get shop by id
router.get("/:id", async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        safetyLevel: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching shop" });
  }
});

// create shop
router.post(
  "/",
  authenticateUser,
  storeCheck,
  async (req, res) => {
    try {
      const {
        name,
        address,
        description,
        phone,
        email,
        openTime,
        closeTime,
        latitude,
        longitude,
        type,
        images,
      } = req.body;

      const shop = await prisma.shop.create({
        data: {
          name,
          address,
          description,
          phone,
          email,
          openTime,
          closeTime,
          latitude,
          longitude,
          type,
          userId: req.user.id,
          images: {
            // Cloudinary
            create: images.map((item) => ({
              asset_id: item.asset_id,
              public_id: item.public_id,
              url: item.url,
              secure_url: item.secure_url,
            })),
          },
        },
      });

      res.status(201).json(shop);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating shop" });
    }
  }
);

// Update shop
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (shop.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedShop = await prisma.shop.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    res.json(updatedShop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating shop" });
  }
});

// Delete shop
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (shop.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.shop.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting shop" });
  }
});

module.exports = router;
