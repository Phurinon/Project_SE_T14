import axios from "axios";

const API = "http://localhost:3000/api";

export const getAllSafetyLevels = async () => {
  try {
    const response = await axios.get(`${API}/safety-levels`);
    return response.data;
  } catch (error) {
    console.error("Error fetching safety levels:", error);
    throw new Error("Failed to fetch safety levels.");
  }
};

export const createSafetyLevel = async (token, safetyLevelData) => {
  try {
    const response = await axios.post(`${API}/safety-levels`, safetyLevelData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating safety level:", error);
    throw new Error("Failed to create safety level.");
  }
};

export const updateSafetyLevel = async (token, levelId, updateData) => {
  try {
    const response = await axios.put(
      `${API}/safety-levels/${levelId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating safety level:", error);
    throw new Error("Failed to update safety level.");
  }
};

export const deleteSafetyLevel = async (token, levelId) => {
  try {
    const response = await axios.delete(`${API}/safety-levels/${levelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting safety level:", error);
    throw new Error("Failed to delete safety level.");
  }
};
