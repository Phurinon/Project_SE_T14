const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/users.js');
const shopRoutes = require('./routes/shop.js');
const reviewRoutes = require('./routes/reviews.js');
const commentRoutes = require('./routes/comments.js');
const safetyLevelRoutes = require('./routes/safetyLevels.js');
const adminRoutes = require('./routes/admin.js');

//Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/safety-levels', safetyLevelRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

