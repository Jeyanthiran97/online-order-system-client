import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://online-order-system-api.vercel.app/api";

// Log API URL in development (only in browser)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("API URL:", API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData, browser will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("Network Error:", {
        message: error.message,
        code: error.code,
        baseURL: API_URL,
        url: error.config?.url,
      });
    }

    if (error.response?.status === 401) {
      // Auto logout on 401
      Cookies.remove("token");
      Cookies.remove("user");
      // Only redirect if we are in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
