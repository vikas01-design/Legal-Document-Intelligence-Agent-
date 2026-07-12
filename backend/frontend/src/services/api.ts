import axios from "axios";

// In production on Render, frontend and backend are on different domains
// Use the backend URL from environment variable or default to the backend service
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.MODE === 'production' ? 'https://lexora-ai-w6cs.onrender.com' : ''),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;