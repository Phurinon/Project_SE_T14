import axios from "axios";

const API = "http://localhost:3000/api";

// Get current user profile with all related data
export const getCurrentUserProfile = async (token) => {
  const response = await axios.get(`${API}/users/allusers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData, token) => {
  const response = await axios.put(`${API}/users/update`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

