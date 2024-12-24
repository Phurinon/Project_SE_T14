const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");

exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    //validate body
    if (!email) {
      return res.status(400).json({ message: "Email is required!!!" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required!!!" });
    }

    //check email in DB already?
    const user = await prisma.uSERS.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      return res.status(400).json({ message: "Email is already exists!!!" });
    }

    //hash password
    const hashPassword = await bcrypt.hash(password, 10);

    //register
    await prisma.uSERS.create({
      data: {
        username: username,
        email: email,
        password: hashPassword,
      },
    });

    res.send("Register success!!!");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check email
    const user = await prisma.uSERS.findFirst({
      where: {
        email: email,
      },
    });
    if (!user || !user.enable) {
      return res
        .status(400)
        .json({ message: "Email is not exists or not enabled!!!" });
    }
    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password Incorrect!!!" });
    }
    //create payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    console.log(payload);
    //generate token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        res.status(500).json({ message: "Server Error" });
      }
      res.json({ payload, token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    res.send("current user");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    //code
    const user = await prisma.uSERS.findFirst({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.json({ user });
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
