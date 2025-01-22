const express = require("express");
const {
  authenticateUser,
  adminCheck,
  storeCheck,
} = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

router.get("/my-shop", authenticateUser, async (req, res) => {
  try {
    const shop = await prisma.shop.findFirst({
      where: { userId: req.user.id },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop" });
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
router.post("/", authenticateUser, async (req, res) => {
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

    if (!name || !address || !phone || !email) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: "name, address, phone, email are required"
      });
    }
    if (!Array.isArray(images)) {
      return res.status(400).json({
        message: "Images must be an array"
      });
    }

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    const shop = await prisma.shop.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        description: description?.trim() || "",
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        openTime: openTime || null,
        closeTime: closeTime || null,
        latitude: parsedLatitude || null,
        longitude: parsedLongitude || null,
        type: type?.trim() || "other",
        userId: req.user.id,
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id || "",
            public_id: item.public_id || "",
            url: item.url || "",
            secure_url: item.secure_url || item.url || "",
          })),
        },
      },
      include: {
        images: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { role: "store" },
    });

    res.status(201).json(shop,updatedUser);

  } catch (error) {
    console.error("Shop creation error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: "A shop with this name already exists"
      });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: "Invalid user ID or reference constraint failed" 
      });
    }
    res.status(500).json({ 
      message: "Error creating shop",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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

router.post("/createImages", authenticateUser, async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `Shop-${Date.now()}`,
      resource_type: "auto",
      folder: "DustAir",
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Upload error:", err);
    res
      .status(500)
      .json({ message: "Error uploading image", error: err.message });
  }
});

router.delete("/removeImage", authenticateUser, async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ message: "No public_id provided" });
    }

    const result = await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ message: "Image removed successfully", result });
  } catch (err) {
    console.error("Delete error:", err);
    res
      .status(500)
      .json({ message: "Error deleting image", error: err.message });
  }
});

module.exports = router;
