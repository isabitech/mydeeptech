import { useState } from 'react';
import { apiGet, getErrorMessage } from '../../../../service/apiUtils';

export interface QAUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  domains?: string[];
  annotatorStatus: string;
  qaStatus: 'approved' | 'pending' | 'rejected';
  qaApprovedAt?: string;
  qaApprovedBy?: string;
  qaRejectedAt?: string;
  qaRejectedBy?: string;
  qaReason?: string;
  isEmailVerified: boolean;
  resultLink?: string;
  idDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QAUsersFilters {
  qaStatus?: 'approved' | 'pending' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}

export interface QAUsersResponse {
  success: boolean;
  data: {
    qaUsers: QAUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    summary: {
      totalUsers: number;
      qaBreakdown: {
        approved: number;
        pending: number;
        rejected: number;
      };
    };
  };
  message?: string;
}

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export const useQAUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaUsers, setQaUsers] = useState<QAUser[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  // Get all QA users with filtering
  const getQAUsers = async (filters: QAUsersFilters = {}): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Add filters as query parameters
      if (filters.qaStatus) {
        queryParams.append('qaStatus', filters.qaStatus);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.page) {
        queryParams.append('page', filters.page.toString());
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const url = `/admin/qa-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response: QAUsersResponse = await apiGet(url);

      if (response.success) {setQaUsers(response.data.qaUsers);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
        return { 
          success: true, 
          data: response.data,
          message: response.message
        };
      } else {
        const errorMessage = response.message || 'Failed to fetch QA users';
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
  };

  // Get only approved QA users
  const getApprovedQAUsers = async (filters: Omit<QAUsersFilters, 'qaStatus'> = {}): Promise<HookOperationResult> => {
    return await getQAUsers({ ...filters, qaStatus: 'approved' });
  };

  // Get only pending QA users
  const getPendingQAUsers = async (filters: Omit<QAUsersFilters, 'qaStatus'> = {}): Promise<HookOperationResult> => {
    return await getQAUsers({ ...filters, qaStatus: 'pending' });
  };

  // Get only rejected QA users
  const getRejectedQAUsers = async (filters: Omit<QAUsersFilters, 'qaStatus'> = {}): Promise<HookOperationResult> => {
    return await getQAUsers({ ...filters, qaStatus: 'rejected' });
  };

  // Reset state
  const resetState = () => {
    setQaUsers([]);
    setPagination(null);
    setSummary(null);
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    loading,
    error,
    qaUsers,
    pagination,
    summary,
    
    // Actions
    getQAUsers,
    getApprovedQAUsers,
    getPendingQAUsers,
    getRejectedQAUsers,
    resetState,
    clearError,
    
    // State setters for manual control if needed
    setQaUsers,
    setLoading,
    setError,
  };
};