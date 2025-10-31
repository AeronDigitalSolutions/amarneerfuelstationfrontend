import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://amarneerfuelstationbackend.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
