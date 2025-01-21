import axios from "axios";

const API = "http://localhost:3000/api";

// Get reviews by shop ID
export const getShopReviews = async (shopId) => {
  try {
    const response = await axios.get(`${API}/reviews/shop/${shopId}`);
    return response.data;
  } catch (error) {
    throw handleReviewError(error);
  }
};

// Create new review
export const createReview = async (token, reviewData) => {
  try {
    const { content, rating, comment, shopId } = reviewData;

    if (!content || !rating || !shopId) {
      throw new Error("Content, rating, and shop ID are required");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const response = await axios.post(
      `${API}/reviews`,
      { content, rating, comment, shopId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleReviewError(error);
  }
};

// Update review
export const updateReview = async (token, reviewId, updateData) => {
  try {
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const response = await axios.put(`${API}/reviews/${reviewId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleReviewError(error);
  }
};

// Report review
export const reportReview = async (token, reviewId, reason) => {
  try {
    if (!reason || reason.trim().length === 0) {
      throw new Error("Reason is required");
    }

    const response = await axios.post(
      `${API}/reviews/${reviewId}/report`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleReviewError(error);
  }
};

// Shop owner reply to review
export const replyToReview = async (token, reviewId, reply) => {
  try {
    if (!reply || reply.trim().length === 0) {
      throw new Error("Reply content is required");
    }

    const response = await axios.post(
      `${API}/reviews/${reviewId}/reply`,
      { reply },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleReviewError(error);
  }
};

const handleReviewError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return new Error(data.message || "Invalid request");
      case 401:
        return new Error("You must be logged in");
      case 403:
        return new Error(data.message || "Not authorized");
      case 404:
        return new Error("Review not found");
      case 500:
        return new Error("Server error - Please try again later");
      default:
        return new Error(data.message || "An unexpected error occurred");
    }
  }
  return error;
};

export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
};
