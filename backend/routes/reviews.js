const express = require("express");
const router = express.Router();
const {
  createReview,
  listReview,
  deleteReview,
  updateReview,
} = require("../controllers/reviews");

router.post("/reviews", createReview);
router.post("/reviews", updateReview);
router.get("/reviews", listReview);
router.delete("/reviews", deleteReview);

module.exports = router;
