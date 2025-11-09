import { useState, useCallback } from "react";
import { message } from "antd";
import apiUtils from "../../../../service/axiosApi";
import {
  Invoice,
  InvoicesResponse,
  InvoiceResponse,
  InvoiceDashboardResponse,
  InvoiceFilters,
  InvoicesSummary,
  PaginationInfo,
  HookOperationResult,
} from "../../../../types/invoice.types";

export const useUserInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [summary, setSummary] = useState<InvoicesSummary | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

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

  const getUserInvoices = useCallback(async (filters?: InvoiceFilters): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.paymentStatus) queryParams.append("paymentStatus", filters.paymentStatus);
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);

      const response = await apiUtils.get<InvoicesResponse>(
        `/auth/invoices?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        setInvoices(response.data.data.invoices);
        setPagination(response.data.data.pagination);
        setSummary(response.data.data.summary);
      }

      return response.data;
    });
  }, [handleApiCall]);

  const getUnpaidInvoices = useCallback(async (filters?: InvoiceFilters): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);

      const response = await apiUtils.get<InvoicesResponse>(
        `/auth/invoices/unpaid?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        setInvoices(response.data.data.invoices);
        setPagination(response.data.data.pagination);
        setSummary(response.data.data.summary);
      }

      return response.data;
    });
  }, [handleApiCall]);

  const getPaidInvoices = useCallback(async (filters?: InvoiceFilters): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);

      const response = await apiUtils.get<InvoicesResponse>(
        `/auth/invoices/paid?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        setInvoices(response.data.data.invoices);
        setPagination(response.data.data.pagination);
        setSummary(response.data.data.summary);
      }

      return response.data;
    });
  }, [handleApiCall]);

  const getInvoiceDashboard = useCallback(async (): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const response = await apiUtils.get<InvoiceDashboardResponse>("/auth/invoices/dashboard");

      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
        setSummary(response.data.data.summary);
      }

      return response.data;
    });
  }, [handleApiCall]);

  const getInvoiceDetails = useCallback(async (invoiceId: string): Promise<HookOperationResult> => {
    return handleApiCall(async () => {
      const response = await apiUtils.get<InvoiceResponse>(`/auth/invoices/${invoiceId}`);
      return response.data;
    });
  }, [handleApiCall]);

  const refreshInvoices = useCallback(async (filters?: InvoiceFilters): Promise<void> => {
    await getUserInvoices(filters);
  }, [getUserInvoices]);

  return {
    // State
    loading,
    error,
    invoices,
    pagination,
    summary,
    dashboardData,

    // Actions
    getUserInvoices,
    getUnpaidInvoices,
    getPaidInvoices,
    getInvoiceDashboard,
    getInvoiceDetails,
    refreshInvoices,
  };
};