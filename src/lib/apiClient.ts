import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Log API URL in development (only in browser)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("API URL:", API_URL);
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors with better error structure
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      // Log network errors for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.error("Network Error:", {
          message: error.message,
          code: error.code,
          baseURL: API_URL,
          url: error.config?.url,
        });
      }
      
      // Enhance error object with user-friendly message
      error.isNetworkError = true;
      error.userMessage = "Unable to connect to server. Please check your internet connection and ensure the server is running.";
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      error.isNetworkError = true;
      error.userMessage = "Request timed out. The server is taking too long to respond. Please try again.";
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

export default apiClient;


