import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.PROD
      ? "https://amarneerfuelstationbackend.onrender.com/"
      : "http://localhost:5001", // your local backend during dev
});

export default api;
