import axios from "axios";

const API = "http://localhost:3000/api";

export const getAirPollutionData = async (lat, lon) => {
  try {
    const response = await axios.get(`${API}/air/air-pollution`, {
      params: { lat, lon },
    });
    return response.data; // ข้อมูล PM2.5 และตำแหน่ง
  } catch (error) {
    console.error("Error fetching air pollution data:", error);
    throw error.response ? error.response.data : { message: "Network error" };
  }
};
