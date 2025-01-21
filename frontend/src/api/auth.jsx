import axios from "axios";

const API = "http://localhost:3000/api";

// Current User
export const currentUser = async (token) => {
  return await axios.get(`${API}/auth/current-user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Current Admin
export const currentAdmin = async (token) => {
  return await axios.get(`${API}/auth/current-admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Current Store
export const currentStore = async (token) => {
  return await axios.get(`${API}/auth/current-store`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
