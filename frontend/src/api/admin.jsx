import axios from "axios";

const API = "http://localhost:3000/api";

export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API}/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const changeUserStatus = async (userId, status, token) => {
  try {
    const response = await axios.post(
      `${API}/admin/changeStatus`,
      { userId, status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing user status:", error);
    throw error;
  }
};

export const changeUserRole = async (userId, role, token) => {
  try {
    const response = await axios.post(
      `${API}/admin/changeRole`,
      { userId, role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing user role:", error);
    throw error;
  }
};
