import axios from "axios";

// ✅ Use environment variable for flexibility
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://amarneerfuelstationbackend.vercel.app";


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // change to true if you use cookies/session auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
