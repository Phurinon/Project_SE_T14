import axios from "axios";

const API = "http://localhost:3000/api";

// Get all shops
export const getAllShops = async () => {
  const response = await axios.get(`${API}/shops`);
  return response.data;
};

// Get shop by ID
export const getShopById = async (id) => {
  const response = await axios.get(`${API}/shops/${id}`);
  return response.data;
};

// Create new shop
export const createShop = async (shopData, token) => {
  const response = await axios.post(`${API}/shops`, shopData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update shop
export const updateShop = async (id, shopData, token) => {
  const response = await axios.put(`${API}/shops/${id}`, shopData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete shop
export const deleteShop = async (id, token) => {
  const response = await axios.delete(`${API}/shops/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
