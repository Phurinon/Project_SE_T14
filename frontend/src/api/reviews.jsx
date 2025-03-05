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
  try {
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
  } catch (error) {
    if (error.response) {
      // เซิร์ฟเวอร์ตอบกลับด้วยสถานะข้อผิดพลาด
      throw new Error(error.response.data.message || "เกิดข้อผิดพลาดในการรายงานรีวิว");
    } else if (error.request) {
      // ส่งคำขอแล้วแต่ไม่ได้รับการตอบกลับ
      throw new Error("ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์");
    } else {
      // เกิดข้อผิดพลาดในการตั้งค่าคำขอ
      throw new Error("เกิดข้อผิดพลาดในการส่งคำขอรายงานรีวิว");
    }
  }
};

export const getReviewReports = async (token, reviewId) => {
  const response = await axios.get(`${API}/reviews/${reviewId}/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const checkUserReviewReport = async (token, reviewId) => {
  try {
    const response = await axios.get(
      `${API}/reviews/report/check/${reviewId}`, // เปลี่ยนเส้นทาง
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.hasReported; // ใช้ hasReported แทน reported
  } catch (error) {
    console.log("เกิดข้อผิดพลาดในการตรวจสอบรายงานรีวิว:", error);
    return false;
  }
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

// Check if user has liked a review
export const checkUserReviewLike = async (token, reviewId) => {
  try {
    const response = await axios.get(
      `${API}/reviews/${reviewId}/liked`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.liked;
  } catch (error) {
    console.log("Error checking review like:", error);
    return false;
  }
};

// Check if user has reviewed a shop
// Modified to handle missing endpoint
export const checkUserShopReview = async (token, shopId) => {
  try {
    // First check if the endpoint exists
    const reviews = await getShopReviews(shopId);
    
    // If no token, user is not logged in so can't have reviewed
    if (!token) return false;
    
    // Extract user ID from token or token object
    const userId = typeof token === 'object' ? token.userId : null;
    
    // If we can't get user ID, assume not reviewed
    if (!userId) return false;
    
    // Check if any review is from this user
    const userReviews = reviews.filter(review => 
      review.userId === userId || (review.user && review.user.id === userId)
    );
    
    return userReviews.length > 0;
  } catch (error) {
    console.log("Error checking if user reviewed shop:", error);
    return false; // Assume user hasn't reviewed if there's an error
  }
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