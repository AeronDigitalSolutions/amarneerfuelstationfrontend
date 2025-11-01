import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://amarneerfuelstationbackend.vercel.app"
      : "http://localhost:5000", // your local backend during dev
});

export default api;
