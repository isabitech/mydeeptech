import { useState, useCallback } from "react";
import { message } from "antd";
import apiUtils from "../../../service/axiosApi";
import {
  AdminDashboardResponse,
  AdminDashboardData,
  Overview,
  DtUserStatistics,
  ProjectStatistics,
  ApplicationStatistics,
  InvoiceStatistics,
  RecentRegistration,
  RecentInvoiceActivity,
  Trends,
  TopAnnotator,
  TopPerformers,
  RecentUser,
  RecentProject,
  RecentActivities,
  DomainDistribution,
  ConversionRates,
  FinancialHealth,
  Insights,
} from "./admin-dashboard-type";

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type { 
  AdminDashboardResponse,
  AdminDashboardData,
  Overview,
  DtUserStatistics,
  ProjectStatistics,
  ApplicationStatistics,
  InvoiceStatistics,
  Trends,
  TopPerformers,
  RecentActivities,
  Insights
} from "./admin-dashboard-type";

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);

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
      const errorMessage = error.response?.data?.message || error.message || "An error occurred";
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardData = useCallback(async (): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const response = await apiUtils.get<AdminDashboardResponse>("/admin/dashboard");

      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      }

      return response.data;
    });
  }, [handleApiCall]);

  const refreshDashboard = useCallback(async (): Promise<void> => {
    await getDashboardData();
  }, [getDashboardData]);

  return {
    // State
    loading,
    error,
    dashboardData,

    // Actions
    getDashboardData,
    refreshDashboard,
  };
};