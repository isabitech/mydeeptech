import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { retrieveTokenFromStorage, RESPONSE_CODE } from "../helpers";
import { baseURL } from "../store/api/endpoints";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await retrieveTokenFromStorage();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors properly
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the response for successful requests
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error handling
    const errorResponse = {
      message: "An unexpected error occurred",
      status: error.response?.status || 500,
      data: null,
      errors: null,
    };

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Extract error message from various possible API response formats
      let errorMessage = "An error occurred";
      let errorData = data as any;
      
      if (errorData) {
        // Common API error formats
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === "string" ? errorData.error : errorData.error.message;
        } else if (errorData.errors) {
          // Handle validation errors
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map((err: any) => err.message || err).join(", ");
          } else if (typeof errorData.errors === "object") {
            errorMessage = Object.values(errorData.errors).flat().join(", ");
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      }

      errorResponse.message = errorMessage;
      errorResponse.status = status;
      errorResponse.data = errorData;

      // Handle specific status codes
      switch (status) {
        case RESPONSE_CODE.unauthorized:
          errorResponse.message = errorMessage || "You are not authorized to perform this action";
          // Optionally clear token and redirect to login
          break;
        case RESPONSE_CODE.invalidToken:
          errorResponse.message = errorMessage || "Your session has expired. Please login again";
          // Optionally clear token and redirect to login
          break;
        case RESPONSE_CODE.badRequest:
          errorResponse.message = errorMessage || "Invalid request. Please check your input";
          break;
        case RESPONSE_CODE.internalServerError:
          errorResponse.message = errorMessage || "Server error. Please try again later";
          break;
        case RESPONSE_CODE.dataDuplication:
          errorResponse.message = errorMessage || "Data already exists";
          break;
        default:
          errorResponse.message = errorMessage;
      }
    } else if (error.request) {
      // Network error
      errorResponse.message = "Network error. Please check your internet connection";
      errorResponse.status = 0;
    } else {
      // Other errors
      errorResponse.message = error.message || "An unexpected error occurred";
    }

    // Log error for debugging
    console.error("API Error:", {
      message: errorResponse.message,
      status: errorResponse.status,
      url: error.config?.url,
      method: error.config?.method,
      data: errorResponse.data,
    });

    return Promise.reject(errorResponse);
  }
);

// Export the configured instance
export default axiosInstance;

// Export a helper function for making requests with better error handling
export const apiRequest = async <T = any>(
  config: InternalAxiosRequestConfig
): Promise<{ data: T; message?: string; status: number }> => {
  try {
    const response = await axiosInstance(config);
    return {
      data: response.data,
      message: response.data?.message,
      status: response.status,
    };
  } catch (error: any) {
    throw error; // Re-throw the enhanced error from interceptor
  }
};
