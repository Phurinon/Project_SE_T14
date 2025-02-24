import axios from "axios";

const API = "http://localhost:3000/api";

// Helper function to get token from dust-store
const getAuthToken = () => {
  try {
    // Try getting token from dust-store first
    const dustStore = localStorage.getItem("dust-store");
    if (dustStore) {
      const storeData = JSON.parse(dustStore);
      return storeData.state.token;
    }
    
    // Fallback to direct token if dust-store is not available
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Axios instance with interceptor for auth header
const authAxios = axios.create();

authAxios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Create bookmark for a shop
export const createBookmark = async (shopId, category = null) => {
  try {
    // Validate inputs before making request
    if (!shopId || isNaN(parseInt(shopId))) {
      throw new Error("Invalid shop ID");
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึกร้านค้า");
    }

    console.log("Creating bookmark:", { shopId, category, token: !!token });

    const response = await authAxios.post(`${API}/bookmarks/${shopId}`, { 
      category 
    });

    console.log("Bookmark created successfully:", response.data);
    return response.data;

  } catch (error) {
    // Log detailed error information
    console.error("Create bookmark error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });

    // Handle specific error cases
    if (!error.response) {
      throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }

    if (error.response?.status === 401) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึกร้านค้า");
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || "ข้อมูลไม่ถูกต้อง");
    }

    if (error.response?.status === 404) {
      throw new Error("ไม่พบร้านค้าที่ต้องการบันทึก");
    }

    // If we get here, it's a 500 error or something unexpected
    throw new Error(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกร้านค้า");
  }
};

// Remove bookmark for a shop
export const removeBookmark = async (shopId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนลบบุ๊คมาร์ค");
    }

    console.log("Removing bookmark:", { shopId, token: !!token });

    const response = await authAxios.delete(`${API}/bookmarks/${shopId}`);
    
    console.log("Bookmark removed successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("Remove bookmark error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (!error.response) {
      throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }

    if (error.response?.status === 401) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนลบบุ๊คมาร์ค");
    }

    throw new Error(error.response?.data?.message || "เกิดข้อผิดพลาดในการลบบุ๊คมาร์ค");
  }
};

// Get all bookmarks for the current user
export const getUserBookmarks = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนดูบุ๊คมาร์ค");
    }

    const response = await authAxios.get(`${API}/bookmarks`);
    return response.data;

  } catch (error) {
    console.error("Get bookmarks error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (!error.response) {
      throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }

    if (error.response?.status === 401) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนดูบุ๊คมาร์ค");
    }

    throw new Error(error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลบุ๊คมาร์ค");
  }
};

// Check if user has bookmarked a shop
export const checkBookmarkStatus = async (shopId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { isBookmarked: false, category: null };
    }

    const response = await authAxios.get(`${API}/bookmarks/check/${shopId}`);
    return response.data;

  } catch (error) {
    console.error("Check bookmark status error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 401) {
      return { isBookmarked: false, category: null };
    }

    return { isBookmarked: false, category: null };
  }
};

// Get bookmark count for a shop (no auth required)
export const getBookmarkCount = async (shopId) => {
  try {
    const response = await axios.get(`${API}/bookmarks/count/${shopId}`);
    return response.data;
  } catch (error) {
    console.error("Get bookmark count error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { count: 0 };
  }
};