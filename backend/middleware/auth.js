const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma.js");

const authenticateUser = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res.status(401).json({ message: "No Token, Authorization" });
    }
    const token = headerToken.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;

    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
    });

    if (user.status !== "active") {
      return res.status(401).json({ message: "This account cannot access" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminCheck = async (req, res, next) => {
  try {
    const  email  = req.user.email;
    const adminUser = await prisma.user.findFirst({
      where: { email: email },
    });
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Acess Denied: Admin Only" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking admin role" });
  }
};

const storeCheck = async (req, res, next) => {
  try {
    const  email  = req.user.email;
    const storeUser = await prisma.user.findFirst({
      where: { email: email },
    });
    if (!storeUser || storeUser.role !== "store") {
      return res.status(403).json({ message: "Acess Denied: Shop only" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking store role" });
  }
};

module.exports = { authenticateUser, adminCheck, storeCheck };
