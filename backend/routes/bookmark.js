const express = require("express");
const {
    authenticateUser,
    adminCheck,
    storeCheck,
} = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");
const router = express.Router();

// Create bookmark
router.post("/bookmarks/:shopId", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const shopId = parseInt(req.params.shopId);
        const { category } = req.body;

        // Validate shopId
        if (isNaN(shopId) || shopId <= 0) {
            return res.status(400).json({ message: "รหัสร้านค้าไม่ถูกต้อง" });
        }

        // Validate category
        const validCategories = ["favorite", "wantToGo", "visited", "share"];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ message: "หมวดหมู่ไม่ถูกต้อง" });
        }

        // Check if shop exists
        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!shop) {
            return res.status(404).json({ message: "ไม่พบร้านค้า" });
        }

        // Check if already bookmarked
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_shopId: {
                    userId: userId,
                    shopId: shopId
                }
            }
        });

        if (existingBookmark) {
            return res.status(400).json({ message: "คุณได้บันทึกร้านนี้ไปแล้ว" });
        }

        // Create bookmark with transaction
        const bookmark = await prisma.$transaction(async (prisma) => {
            const newBookmark = await prisma.bookmark.create({
                data: {
                    userId: userId,
                    shopId: shopId,
                    category: category
                }
            });

            return newBookmark;
        });

        res.status(201).json({
            message: "บุ๊คมาร์คร้านค้าสำเร็จ",
            data: bookmark
        });

    } catch (error) {
        console.error("Create bookmark error:", error);
    }
});

// Remove bookmark
router.delete("/bookmarks/:shopId", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const shopId = parseInt(req.params.shopId);

        await prisma.bookmark.delete({
            where: {
                userId_shopId: {
                    userId: userId,
                    shopId: shopId
                }
            }
        });

        res.json({ message: "ลบบุ๊คมาร์คสำเร็จ" });

    } catch (error) {
        console.error("Delete bookmark error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ BookMark" });
    }
});

// Get user's bookmarks
router.get("/bookmarks", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: userId },
            include: {
                shop: {
                    include: {
                        images: true,
                        reviews: {
                            select: {
                                rating: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate average rating for each shop
        const bookmarksWithRating = bookmarks.map(bookmark => {
            const shop = bookmark.shop;
            const ratings = shop.reviews.map(review => review.rating);
            const avgRating = ratings.length > 0 
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
                : 0;

            return {
                ...bookmark,
                shop: {
                    ...shop,
                    averageRating: parseFloat(avgRating.toFixed(1)),
                    reviews: undefined // Remove raw reviews data
                }
            };
        });

        res.json({
            message: "ดึงข้อมูล BookMark สำเร็จ",
            data: bookmarksWithRating
        });

    } catch (error) {
        console.error("Get bookmarks error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล BookMark" });
    }
});

// Check if user has bookmarked a shop
router.get("/bookmarks/check/:shopId", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const shopId = parseInt(req.params.shopId);

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                userId_shopId: {
                    userId: userId,
                    shopId: shopId
                }
            }
        });

        res.json({
            isBookmarked: !!bookmark,
            category: bookmark?.category || null
        });

    } catch (error) {
        console.error("Check bookmark error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบ BookMark" });
    }
});

// Get bookmark count for a shop
router.get("/bookmarks/count/:shopId", async (req, res) => {
    try {
        const shopId = parseInt(req.params.shopId);

        const count = await prisma.bookmark.count({
            where: { shopId: shopId }
        });

        res.json({
            count: count
        });

    } catch (error) {
        console.error("Get bookmark count error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการนับจำนวน BookMark" });
    }
});

module.exports = router;