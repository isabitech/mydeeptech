import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { retrieveTokenFromStorage, RESPONSE_CODE } from "../helpers";
import { baseURL } from "../store/api/endpoints";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./apiUtils";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

function logoutUser() {
  localStorage.removeItem("token");
  sessionStorage.clear();

  // optional: clear axios header
  delete axiosInstance.defaults.headers.common.Authorization;
  window.location.href = "/login";
}

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
    if (error.response?.status === 401) {
      logoutUser();
    }
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors properly
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the response for successful requests
    return response;
  },
  (error: AxiosError) => {

    if (error.response?.status === 401) {
      logoutUser();
    }

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
          errorMessage =
            typeof errorData.error === "string"
              ? errorData.error
              : errorData.error.message;
        } else if (errorData.errors) {
          // Handle validation errors
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors
              .map((err: any) => err.message || err)
              .join(", ");
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
          errorResponse.message =
            errorMessage || "You are not authorized to perform this action";
          // Optionally clear token and redirect to login
          break;
        case RESPONSE_CODE.invalidToken:
          errorResponse.message =
            errorMessage || "Your session has expired. Please login again";
          // Optionally clear token and redirect to login
          break;
        case RESPONSE_CODE.badRequest:
          errorResponse.message =
            errorMessage || "Invalid request. Please check your input";
          break;
        case RESPONSE_CODE.internalServerError:
          errorResponse.message =
            errorMessage || "Server error. Please try again later";
          break;
        case RESPONSE_CODE.dataDuplication:
          errorResponse.message = errorMessage || "Data already exists";
          break;
        default:
          errorResponse.message = errorMessage;
      }
    } else if (error.request) {
      // Network error
      errorResponse.message =
        "Network error. Please check your internet connection";
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
  },
);

// Export the configured instance
export default axiosInstance;

// Export a helper function for making requests with better error handling
export const apiRequest = async <T = any>(
  config: InternalAxiosRequestConfig,
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

// Multimedia Assessment API Service Functions
export const multimediaAssessmentApi = {
  // Assessment Session Management (Annotator)
  startAssessment: async (assessmentId: string) => {
    return apiPost(`/assessments/multimedia/${assessmentId}/start`);
  },

  getAssessmentSession: async (submissionId: string) => {
    return apiGet(`/assessments/multimedia/session/${submissionId}`);
  },

  saveTaskProgress: async (submissionId: string, taskData: any) => {
    return apiPost(
      `/assessments/multimedia/${submissionId}/save-progress`,
      taskData,
    );
  },

  submitTask: async (
    submissionId: string,
    taskNumber: number,
    taskData: any,
  ) => {
    return apiPost(
      `/assessments/multimedia/${submissionId}/submit-task/${taskNumber}`,
      taskData,
    );
  },

  controlTimer: async (
    submissionId: string,
    action: "start" | "pause" | "resume",
  ) => {
    return apiPost(`/assessments/multimedia/${submissionId}/timer`, { action });
  },

  submitFinalAssessment: async (submissionId: string) => {
    return apiPost(`/assessments/multimedia/${submissionId}/submit`);
  },

  getAvailableReels: async (
    assessmentId: string,
    params?: { niche?: string; limit?: number },
  ) => {
    return apiGet(`/assessments/multimedia/reels/${assessmentId}`, { params });
  },

  // QA Review System
  getPendingSubmissions: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    filterBy?: string;
    search?: string;
  }) => {
    return apiGet("/qa/submissions/pending", { params });
  },

  getApprovedSubmissions: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    filterBy?: string;
    search?: string;
  }) => {
    return apiGet("/qa/submissions/approved", { params });
  },

  getRejectedSubmissions: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    filterBy?: string;
    search?: string;
  }) => {
    return apiGet("/qa/submissions/rejected", { params });
  },

  getSubmissionStats: async () => {
    return apiGet("/qa/submissions/stats");
  },

  getSubmissionForReview: async (submissionId: string) => {
    return apiGet(`/qa/submissions/${submissionId}/review`);
  },

  reviewTask: async (reviewData: {
    submissionId: string;
    taskIndex: number;
    score: number;
    feedback?: string;
    qualityRating: "Excellent" | "Good" | "Fair" | "Poor";
    notes?: string;
  }) => {
    return apiPost("/qa/submissions/review-task", reviewData);
  },

  submitFinalReview: async (reviewData: {
    submissionId: string;
    overallScore: number;
    overallFeedback?: string;
    decision: "Approve" | "Reject" | "Request Revision";
    privateNotes?: string;
  }) => {
    return apiPost("/qa/submissions/final-review", reviewData);
  },

  getQADashboard: async () => {
    return apiGet("/qa/dashboard");
  },

  // Batch review multiple submissions
  batchReviewSubmissions: async (batchData: {
    submissionIds: string[];
    decision: "Approve" | "Reject" | "Request Revision";
    overallFeedback?: string;
  }) => {
    return apiPost("/qa/submissions/batch-review", batchData);
  },

  // Get QA analytics
  getQAAnalytics: async () => {
    return apiGet("/qa/analytics");
  },

  // Admin Assessment Management
  createAssessmentConfig: async (configData: any) => {
    return apiPost("/admin/assessments/config", configData);
  },

  getAssessmentConfigs: async (params?: {
    projectId?: string;
    isActive?: boolean;
  }) => {
    return apiGet("/admin/assessments/config", { params });
  },

  updateAssessmentConfig: async (assessmentId: string, configData: any) => {
    return apiPatch(`/admin/assessments/config/${assessmentId}`, configData);
  },

  // Video Reel Management (Admin)
  addVideoReel: async (reelData: {
    youtubeUrl: string;
    title?: string;
    description?: string;
    niche: string;
    tags?: string[];
    contentWarnings?: string[];
  }) => {
    return apiPost("/admin/multimedia-assessments/reels/add", reelData);
  },

  bulkAddVideoReels: async (bulkData: {
    youtubeUrls: string[];
    defaultNiche: string;
    defaultTags?: string[];
  }) => {
    return apiPost("/admin/multimedia-assessments/reels/bulk-add", bulkData);
  },

  getAllVideoReels: async (params?: {
    page?: number;
    limit?: number;
    niche?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    isActive?: boolean;
  }) => {
    return apiGet("/admin/multimedia-assessments/reels", { params });
  },

  updateVideoReel: async (reelId: string, reelData: any) => {
    return apiPut(`/admin/multimedia-assessments/reels/${reelId}`, reelData);
  },

  deleteVideoReel: async (reelId: string) => {
    return apiDelete(`/admin/multimedia-assessments/reels/${reelId}`);
  },

  // Analytics & Reporting
  getAssessmentAnalytics: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiGet("/analytics/assessment/dashboard", { params });
  },

  getReelAnalytics: async (params?: { period?: string }) => {
    return apiGet("/analytics/reels", { params });
  },

  getUserAnalytics: async (params?: { period?: string }) => {
    return apiGet("/analytics/users", { params });
  },

  // Assessment Submission Viewing
  getAssessmentSubmissions: async (
    assessmentType: string,
    assessmentId?: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
      userId?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ) => {
    // For specific assessment ID (multimedia assessments)
    if (assessmentId) {
      return apiGet(`/assessments/${assessmentId}/submissions`, { params });
    }
    // For assessment type (english-proficiency, general, etc.)
    return apiGet(`/assessments/${assessmentType}/submissions`, { params });
  },

  // Get available assessments for users
  getAvailableAssessments: async () => {
    return apiGet("/assessments/available");
  },

  // Start assessment for users
  startUserAssessment: async (assessmentId: string) => {
    // Multimedia assessments only
    return apiPost(`/assessments/multimedia/${assessmentId}/start`, {
      assessmentId,
    });
  },

  // Start general/english/akan assessment
  startGeneralAssessment: async (assessmentId: string) => {
    return apiPost(`/assessments/start/${assessmentId}`);
  },

  // Get assessment overview for admin dashboard
  getAssessmentOverview: async () => {
    return apiGet("/admin/assessments/overview");
  },
};
