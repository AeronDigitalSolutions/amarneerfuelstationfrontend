import axios from "axios";

// Automatically choose the backend URL based on environment
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api" // 👈 local backend
    : "https://amarneerfuelstationbackend.vercel.app/api"); // 👈 production backend

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
