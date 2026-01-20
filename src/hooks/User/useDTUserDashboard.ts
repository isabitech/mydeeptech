import { useState, useCallback } from 'react';
import { message } from "antd";
import apiUtils from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { DtUserDashboardData, DtUserDashboardResponse } from '../../types/dtuser-dashboard.types';

interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useDTUserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DtUserDashboardData | null>(null);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string
  ): Promise<HookOperationResult> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
    
      if (successMessage) {
        message.success(successMessage);
      }
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred while fetching dashboard data";
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardData = useCallback(async (): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const response = await apiUtils.get<DtUserDashboardResponse>(endpoints.userDashboard.getDashboard);

      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      }

      return response.data;
    });
  }, [handleApiCall]);

  const refreshDashboard = useCallback(async (): Promise<void> => {
    await getDashboardData();
  }, [getDashboardData]);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setDashboardData(null);
  }, []);

  return {
    // State
    loading,
    error,
    data: dashboardData,
    
    // Actions
    getDashboardData,
    refreshDashboard,
    resetState,
    refetch: refreshDashboard, // Alias for backward compatibility
  };
};