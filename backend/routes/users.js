const express = require("express");
const { authenticateUser} = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/allusers", authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        shop: true,
        reviews: true,
        comments: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

router.put("/update", authenticateUser, async (req, res) => {
  try {
    const { name, email, password, currentPassword } = req.body;

    // 1. ตรวจสอบข้อมูลที่ส่งมา
    if (!name && !email && !password) {
      return res.status(400).json({ message: "No data to update" });
    }

    // 2. สร้าง object สำหรับเก็บข้อมูลที่จะอัพเดท
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // 3. ถ้ามีการอัพเดท password
    if (password) {
      // 3.1 ตรวจสอบว่ามี currentPassword ส่งมาด้วย
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to update password",
        });
      }

      // 3.2 ตรวจสอบ currentPassword
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Current password is incorrect",
        });
      }

      // 3.3 hash password ใหม่
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 4. อัพเดทข้อมูลและเลือกข้อมูลที่จะส่งกลับ
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    res.status(500).json({ message: "Error updating profile" });
  }
});



module.exports = router;
