import { useState, useCallback } from "react";
import { apiGet, getErrorMessage } from "../../../service/apiUtils";

export interface AdminAssessmentRecord {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    annotatorStatus: string;
    microTaskerStatus: string;
  };
  assessmentType: string;
  scorePercentage: number;
  passed: boolean;
  attemptNumber: number;
  timeSpentMinutes: number;
  createdAt: string;
  questions?: Array<{
    questionId: string;
    questionText: string;
    userAnswer: string;
    isCorrect: boolean;
  }>;
}

export interface AdminAssessmentStatistics {
  totalAssessments: number;
  passedAssessments: number;
  averageScore: number;
  uniqueUserCount: number;
  passRate: number;
}

export interface AdminAssessmentFilters {
  page?: number;
  limit?: number;
  assessmentType?: string;
  passed?: boolean;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface HookOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useAdminAssessmentSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdminAssessments = useCallback(async (
    filters: AdminAssessmentFilters = {}
  ): Promise<HookOperationResult<{
    assessments: AdminAssessmentRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: AdminAssessmentStatistics;
  }>> => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params: Record<string, string> = {
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString()
      };

      // Add optional filters
      if (filters.assessmentType) params.assessmentType = filters.assessmentType;
      if (filters.passed !== undefined) params.passed = filters.passed.toString();
      if (filters.userId) params.userId = filters.userId;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await apiGet("/admin/assessments", { params });

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to fetch admin assessments";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssessmentDetails = useCallback(async (
    assessmentId: string
  ): Promise<HookOperationResult<AdminAssessmentRecord>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(`/admin/assessments/${assessmentId}`);

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to fetch assessment details";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserAssessmentHistory = useCallback(async (
    userId: string,
    filters: Omit<AdminAssessmentFilters, 'userId'> = {}
  ): Promise<HookOperationResult<{
    assessments: AdminAssessmentRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: AdminAssessmentStatistics;
  }>> => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        userId,
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString()
      };

      // Add optional filters
      if (filters.assessmentType) params.assessmentType = filters.assessmentType;
      if (filters.passed !== undefined) params.passed = filters.passed.toString();
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await apiGet("/admin/assessments", { params });

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to fetch user assessment history";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAssessments = useCallback(async (
    filters: AdminAssessmentFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<HookOperationResult<Blob>> => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        format,
        export: 'true'
      };

      // Add filters
      if (filters.assessmentType) params.assessmentType = filters.assessmentType;
      if (filters.passed !== undefined) params.passed = filters.passed.toString();
      if (filters.userId) params.userId = filters.userId;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      // Note: This would typically return a blob for file download
      const response = await apiGet("/admin/assessments/export", { 
        params,
        responseType: 'blob'
      });

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: 'Export generated successfully' 
        };
      } else {
        const errorMessage = response.message || "Failed to export assessments";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssessmentStatistics = useCallback(async (
    filters: Omit<AdminAssessmentFilters, 'page' | 'limit'> = {}
  ): Promise<HookOperationResult<AdminAssessmentStatistics>> => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};

      // Add filters
      if (filters.assessmentType) params.assessmentType = filters.assessmentType;
      if (filters.passed !== undefined) params.passed = filters.passed.toString();
      if (filters.userId) params.userId = filters.userId;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await apiGet("/admin/assessments/statistics", { params });

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to fetch assessment statistics";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    getAdminAssessments,
    getAssessmentDetails,
    getUserAssessmentHistory,
    exportAssessments,
    getAssessmentStatistics,
    loading,
    error,
    resetState,
  };
};