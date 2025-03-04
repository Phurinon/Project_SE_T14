const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma.js");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const {
  authenticateUser,
  adminCheck,
  storeCheck,
} = require("../middleware/auth.js");
const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile); // Log profile to check its structure

        if (!profile || !profile.id) {
          return done(new Error("Google profile ID is missing"), null);
        }

        let user = await prisma.userGoogle.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await prisma.userGoogle.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  )
);

// เริ่มกระบวนการ login ด้วย Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback หลังจาก Google ยืนยันตัวตนสำเร็จ
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // สร้าง Token สำหรับผู้ใช้
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Redirect ไปยัง Frontend พร้อมส่ง Token
    res.redirect(`http://localhost:5173/?token=${token}`); // เปลี่ยน URL ให้ตรงกับ Frontend
  }
);

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
