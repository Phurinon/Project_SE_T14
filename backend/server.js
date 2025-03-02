const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const passport = require("./config/passport");
const session = require("express-session");


const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/users.js");
const shopRoutes = require("./routes/shop.js");
const reviewRoutes = require("./routes/reviews.js");
const commentRoutes = require("./routes/comments.js");
const safetyLevelRoutes = require("./routes/safetyLevels.js");
const adminRoutes = require("./routes/admin.js");
const airRoutes = require("./routes/Air.js");

//Middleware
app.use(morgan("dev"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/safety-levels", safetyLevelRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/air", airRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
