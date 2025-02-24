import axios from "axios";

const API = "http://localhost:3000/api";

// Get reviews by shop ID
export const getShopReviews = async (shopId) => {
  const response = await axios.get(`${API}/reviews/shop/${shopId}`);
  return response.data;
};

// Create new review
export const createReview = async (token, reviewData) => {
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
};

// Update review
export const updateReview = async (token, reviewId, updateData) => {
  if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  const response = await axios.put(`${API}/reviews/${reviewId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Report review
export const reportReview = async (token, reviewId, reason) => {
  if (!reason || reason.trim().length === 0) {
    throw new Error("Reason is required");
  }

  const response = await axios.post(
    `${API}/reviews/report/${reviewId}`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Add like to a review
export const likeReview = async (token, reviewId) => {
  const response = await axios.post(
    `${API}/reviews/like/${reviewId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const checkUserReviewLike = async (token, reviewId) => {
  const response = await axios.get(
    `${API}/reviews/${reviewId}/liked`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.liked;
};

export const checkUserShopReview = async (token, shopId) => {
  const response = await axios.get(
    `${API}/reviews/user/shop/${shopId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.hasReviewed;
};

// Shop owner reply to review
export const replyToReview = async (token, reviewId, reply) => {
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
};

// Calculate average rating from reviews
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
};

export const getReportedReviews = async (token) => {
  const response = await axios.get(`${API}/reviews/reported`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const moderateReview = async (token, reviewId, status) => {
  const validStatuses = ["pending", "approved", "rejected"];

  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const response = await axios.put(
    `${API}/reviews/${reviewId}/moderate`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

