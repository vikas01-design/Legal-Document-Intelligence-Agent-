import axios from "axios";

/**
 * Axios instance shared across the app.
 *
 * Dev:  baseURL="" — Vite proxy routes /chat, /upload, /analyze → localhost:3001
 * Prod: set VITE_API_URL to your backend URL (e.g. https://your-app.onrender.com)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  // 3 minutes — Gemini can be slow on first call
  timeout: 180_000,
  headers: { "Content-Type": "application/json" },
});

// Request logging (dev only)
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`[API →] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  api.interceptors.response.use(
    (res) => {
      console.log(`[API ←] ${res.status} ${res.config.url}`);
      return res;
    },
    (err) => {
      console.error(
        `[API ✗] ${err.config?.url}`,
        err.response?.status ?? err.code,
        err.response?.data ?? err.message
      );
      return Promise.reject(err);
    }
  );
}

export default api;
