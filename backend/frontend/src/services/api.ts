import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 25000, // 25s – safely under Render's 30s gateway limit
});

export default api;