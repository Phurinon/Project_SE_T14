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
    const types = [...new Set(shops.map((shop) => shop.type))];

    res.json({
      shops,
      types,
    });
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

    // Basic validation
    if (!name || !address || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: "name, address, phone, email are required",
      });
    }

    // Image validation
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }

    // Parse coordinates with validation
    const parsedLatitude = latitude ? parseFloat(latitude) : null;
    const parsedLongitude = longitude ? parseFloat(longitude) : null;

    if (latitude && isNaN(parsedLatitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude format",
      });
    }

    if (longitude && isNaN(parsedLongitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude format",
      });
    }

    // Create shop with transaction to ensure both shop creation and user update succeed
    const [shop, updatedUser] = await prisma.$transaction(async (prisma) => {
      const newShop = await prisma.shop.create({
        data: {
          name: name.trim(),
          address: address.trim(),
          description: description?.trim() || "",
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          openTime: openTime || null,
          closeTime: closeTime || null,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
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
              email: true,
            },
          },
        },
      });

      const userUpdate = await prisma.user.update({
        where: { id: req.user.id },
        data: { role: "store" },
      });

      return [newShop, userUpdate];
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: {
        shop,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Shop creation error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "A shop with this name already exists",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID or reference constraint failed",
      });
    }

    // Handle validation errors from Prisma
    if (error.code === "P2025") {
      return res.status(400).json({
        success: false,
        message: "Invalid record operation",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Error creating shop",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              code: error.code,
            }
          : undefined,
    });
  }
});

// Update shop
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { images: true },
    });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

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

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(address && { address: address.trim() }),
      ...(description && { description: description.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(openTime && { openTime }),
      ...(closeTime && { closeTime }),
      ...(latitude && { latitude: parseFloat(latitude) }),
      ...(longitude && { longitude: parseFloat(longitude) }),
      ...(type && { type: type.trim() }),
    };

    // จัดการรูปภาพอย่างปลอดภัย
    if (images && Array.isArray(images) && images.length > 0) {
      updateData.images = {
        // ลบรูปเก่าทั้งหมดก่อน
        deleteMany: {},
        // สร้างรูปใหม่
        create: {
          asset_id: images[0].asset_id || '',
          public_id: images[0].public_id || '',
          url: images[0].url || '',
          secure_url: images[0].secure_url || images[0].url || '',
        }
      };
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: updateData,
      include: {
        images: true,
        user: { select: { name: true, email: true } },
      },
    });

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: updatedShop,
    });
  } catch (error) {
    console.error('Shop update error:', error);
    res.status(500).json({ 
      message: 'Error updating shop', 
      error: error.message 
    });
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
      folder: "DustWatch",
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
      return res.status(400).json({ message: "Public ID is required" });
    }

    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Error deleting image", error });
      }
      res.json({ message: "Image removed successfully", result });
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
