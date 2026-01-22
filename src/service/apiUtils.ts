import axiosInstance from "./axiosApi";
import { AxiosRequestConfig } from "axios";

/**
 * Enhanced API utility functions to replace fetch calls
 */

// GET request
export const apiGet = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    throw error; // Enhanced error from interceptor
  }
};

// POST request
export const apiPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT request
export const apiPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH request
export const apiPatch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE request
export const apiDelete = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to create a complete API URL
 * @param endpoint - The endpoint path from endpoints.ts
 * @param id - Optional ID to append to the endpoint
 * @returns Complete URL string
 */
export const createApiUrl = (endpoint: string, id?: string | number): string => {
  return id ? `${endpoint}/${id}` : endpoint;
};

/**
 * Helper function to handle file uploads
 * @param url - Upload endpoint
 * @param file - File to upload
 * @param additionalData - Any additional form data
 * @returns Upload response
 */
export const apiUpload = async <T = any>(
  url: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<T> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const bulkDeletePendingApplications = async (applicationIds: string[]) => {
  try {
    const response = await axiosInstance.delete('/admin/applications/bulk-delete-pending', {
      data: { applicationIds },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const bulkApprovePendingApplications = async (applicationIds: string[]) => {
  try {
    const response = await axiosInstance.patch('/admin/applications/bulk-approve-pending', {
      data: { applicationIds },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Helper to extract error message from API error
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  return "An unexpected error occurred. Please try again.";
};

/**
 * Helper to check if error is due to network issues
 * @param error - Error object from API call
 * @returns Boolean indicating if it's a network error
 */
export const isNetworkError = (error: any): boolean => {
  return error?.status === 0 || error?.code === 'NETWORK_ERROR';
};

/**
 * Helper to check if error is due to authentication
 * @param error - Error object from API call  
 * @returns Boolean indicating if it's an auth error
 */
export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.status === 403;
};