import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const dusthStore = (set) => ({
  user: null,
  token: null,
  logout: () => {
    set({
      user: null,
      token: null,
    });
  },
  actionLogin: async (form) => {
    const res = await axios.post("http://localhost:3000/api/auth/login", form);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },
});

const usePersist = {
  name: "dust-store",
  storage: createJSONStorage(() => localStorage),
};

const useDusthStore = create(persist(dusthStore, usePersist));

export default useDusthStore;
