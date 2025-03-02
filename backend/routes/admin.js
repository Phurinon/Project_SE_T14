const express = require("express");
const { authenticateUser, adminCheck } = require("../middleware/auth.js");
const prisma = require("../config/prisma.js");

const router = express.Router();

router.get("/", authenticateUser, adminCheck, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.post("/changeStatus", authenticateUser, adminCheck, async (req, res) => {
  try {
    const { userId, status } = req.body;
    console.log("Updating status:", userId, status);

    // ตรวจสอบว่า role เป็น 'admin' หรือไม่
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId)
      },
      select: {
        role: true,
      }
    });

    // ถ้า role เป็น admin ให้ status เป็น active
    const newStatus = user?.role === "admin" ? "active" : status;

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId)
      },
      data: {
        status: newStatus
      }
    });

    res.json({ message: "Status updated successfully", user: updatedUser });
  } catch (error) {
    console.log("Error changing status:", error);
    res.status(500).json({ message: "Error changing user status" });
  }
});

router.post("/changeRole", authenticateUser, adminCheck, async (req, res) => {
  try {
    const { userId, role } = req.body;
    console.log("Updating role:", userId, role);

    const user = await prisma.user.update({
      where: {
        id: Number(userId)
      },
      data: {
        role: role
      }
    });

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    console.log("Error changing role:", error);
    res.status(500).json({ message: "Error changing user role" });
  }
});

router.delete('/remove/:userId', authenticateUser, adminCheck, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Deleting user:", userId);

    await prisma.user.delete({
      where: {
        id: Number(userId)
      }
    });
    res.json({ message: "User deleted successfully" });
  }catch (err){
    console.log("Can not delete user:", error);
    res.status(500).json({ message: "Can not delete user" });
  }
})

module.exports = router;
