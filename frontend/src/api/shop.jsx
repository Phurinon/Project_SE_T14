import axios from "axios";

const API = "http://localhost:3000/api";

// Get all shops
export const getAllShops = async () => {
  const response = await axios.get(`${API}/shops`);
  return response.data;
};

export const getMyShop = async (token) => {
  const response = await axios.get(`${API}/shops/my-shop`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
      'Content-Type': 'application/json'
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
    withCredentials: true,
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

export const createShopImages = async (image, token) => {
  const response = await axios.post(
    `${API}/shops/createImages`,
    { image },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const deleteShopImages = async (public_id, token) => {
  const response = await axios.delete(
    `${API}/shops/removeImage`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data: { public_id }
    }
  );
  return response.data;
};
