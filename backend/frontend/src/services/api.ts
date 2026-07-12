import axios from "axios";

/**
 * In development: baseURL is '' so Vite's proxy handles routing
 *   /chat    → http://localhost:3001/chat
 *   /upload  → http://localhost:3001/upload
 *   /analyze → http://localhost:3001/analyze
 *
 * In production: use the explicit backend URL from env var
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  timeout: 120_000, // 2 min — AI can be slow
});

api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      `[API Error] ${err.config?.url}`,
      err.response?.status,
      err.response?.data ?? err.message
    );
    return Promise.reject(err);
  }
);

export default api;
