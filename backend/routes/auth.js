const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma.js");

const {
  authenticateUser,
  adminCheck,
  storeCheck,
} = require("../middleware/auth.js");
const router = express.Router();



// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Error logging out" });
    res.redirect("/");
  });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if user exists
    const User = await prisma.user.findFirst({
      where: { email },
    });

    if (User) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password doesn't match" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: "active" },
    });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: "Server Error" });
        }
        res.json({ payload, token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

router.get("/current-user", authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get("/current-admin", authenticateUser, adminCheck, async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin" });
  }
});

router.get("/current-store", authenticateUser, storeCheck, async (req, res) => {
  try {
    const store = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching store" });
  }
});

module.exports = router;
