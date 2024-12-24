const prisma = require("../config/prisma");
const { connect } = require("../routes/auth");

exports.createReview = async (req, res) => {
  try {
    const { rating, comment, user_id, shop_id } = req.body;

    // Validate input
    if (!rating) {
      return res.status(400).json({ message: "Rating is required!!!" });
    }
    if (!comment) {
      return res.status(400).json({ message: "Comment is required!!!" });
    }

    // Check if the user already reviewed
    const alreadyReview = await prisma.rEVIEW.findFirst({
      where: {
        user_id,
        shop_id,
      },
    });
    if (alreadyReview) {
      return res.status(400).json({ message: "User is already reviewed!!!" });
    }

    // Create a new review
    const newReview = await prisma.rEVIEW.create({
      data: {
        rating,
        comment,
        USERS: {
          connect: {
            user_id: user_id,
          },
        },
        SHOP: {
          connect: {
            shop_id: req.body.shop_id,
          },
        },
      },
    });

    res
      .status(201)
      .json({ message: "Review created successfully!", review: newReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listReview = async (req, res) => {
  try {
    const { shop_id, rating, comment, user_id } = req.body;
    if (!shop_id) {
      return res.status(400).json({ message: "Shop ID is required!!!" });
    }

    // Construct the where clause dynamically based on query params
    const whereClause = { shop_id: parseInt(shop_id) };

    if (rating) {
      whereClause.rating = parseInt(rating); // Filter by rating
    }
    if (comment) {
      whereClause.comment = { contains: comment, mode: "insensitive" }; // Filter by comment (case-insensitive)
    }
    if (user_id) {
      whereClause.user_id = parseInt(user_id); // Filter by user_id
    }

    // Fetch reviews for the specified shop_id
    const reviews = await prisma.rEVIEW.findMany({
      where: whereClause,
      include: {
        USERS: true, // Include user details
        SHOP: true, // Include shop details
      },
    });

    // Check if reviews were found
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: "No reviews for this shop!!!" });
    }

    // Return the matched reviews
    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.body;

    if (!review_id) {
      return res.status(400).json({ message: "Review ID is required!!!" });
    }

    //delete review
    await prisma.rEVIEW.delete({
      where: {
        review_id: review_id,
      },
    });
    res.status(200).json({ message: "Review deleted successfully!!!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { review_id, rating, comment } = req.body;

    if (!review_id) {
      return res.status(400).json({ message: "Review ID is required!!!" });
    }

    // Update review
    const updatedReview = await prisma.rEVIEW.update({
      where: {
        review_id: parseInt(review_id),
      },
      data: {
        rating,
        comment,
      },
    });

    res.status(200).json({
      message: "Review updated successfully!!!",
      review: updatedReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
