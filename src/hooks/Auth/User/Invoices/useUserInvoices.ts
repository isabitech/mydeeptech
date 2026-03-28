import { useState, useCallback } from "react";
import { message } from "antd";
import userInvoiceQueryService from "../../../../services/user-invoice-service/user-invoice-query";
import {
  InvoiceFilters,
  HookOperationResult,
} from "../../../../types/invoice.types";
import { UnpaidInvoice } from "./invoice-type";
import { PaidInvoice } from "./paid-invoice-type";
import errorMessage from "../../../../lib/error-message";

export const useUserInvoices = () => {
  const [filters, setFilters] = useState<InvoiceFilters | undefined>(undefined);
  const [unpaidFilters, setUnpaidFilters] = useState<InvoiceFilters | undefined>(undefined);
  const [paidFilters, setPaidFilters] = useState<InvoiceFilters | undefined>(undefined);

  // TanStack Query hooks
  const userInvoicesQuery = userInvoiceQueryService.useUserInvoices(filters);
  const unpaidInvoicesQuery = userInvoiceQueryService.useUnpaidInvoices(unpaidFilters);
  const paidInvoicesQuery = userInvoiceQueryService.usePaidInvoices(paidFilters);
  const dashboardQuery = userInvoiceQueryService.useUserInvoiceDashboard();

  // Helper function for consistent return values
  const createHookResult = useCallback((
    success: boolean, 
    data?: any, 
    error?: string
  ): HookOperationResult => {
    if (error) {
      message.error(error);
    }
    return { success, data, error };
  }, []);

  const getUserInvoices = useCallback(async (filterParams?: InvoiceFilters): Promise<HookOperationResult> => {
    try {
      setFilters(filterParams);
      
      // Note: TanStack Query will handle the actual API call
      // We return success immediately since the query will update reactively
      return createHookResult(true, null);
    } catch (error: any) {
      const errorMsg = errorMessage(error) ?? "An error occurred";
      return createHookResult(false, null, errorMsg);
    }
  }, [createHookResult]);

  const getUnpaidInvoices = useCallback(async (filterParams?: InvoiceFilters): Promise<HookOperationResult> => {
    try {
      setUnpaidFilters(filterParams);
      return createHookResult(true, null);
    } catch (error: any) {
      const errorMsg = errorMessage(error) ?? "An error occurred";
      return createHookResult(false, null, errorMsg);
    }
  }, [createHookResult]);

  const getPaidInvoices = useCallback(async (filterParams?: InvoiceFilters): Promise<HookOperationResult> => {
    try {
      setPaidFilters(filterParams);
      return createHookResult(true, null);
    } catch (error: any) {
      const errorMsg = errorMessage(error) ?? "An error occurred";
      return createHookResult(false, null, errorMsg);
    }
  }, [createHookResult]);

  const getInvoiceDashboard = useCallback(async (): Promise<HookOperationResult> => {
    try {
      // Dashboard query runs automatically, just refetch if needed
      await dashboardQuery.refetch();
      return createHookResult(true, dashboardQuery.data);
    } catch (error: any) {
      const errorMsg = errorMessage(error) ?? "An error occurred";
      return createHookResult(false, null, errorMsg);
    }
  }, [dashboardQuery, createHookResult]);

  const getInvoiceDetails = useCallback(async (invoiceId: string): Promise<HookOperationResult> => {
    try {
      // This would need to be handled differently since it's a dynamic query
      // For now, we'll indicate that this needs the component to use the hook directly
      return createHookResult(true, null, "Use userInvoiceQueryService.useUserInvoiceDetails(invoiceId) directly");
    } catch (error: any) {
      const errorMsg = errorMessage(error) ?? "An error occurred";
      return createHookResult(false, null, errorMsg);
    }
  }, [createHookResult]);

  const refreshInvoices = useCallback(async (filterParams?: InvoiceFilters): Promise<void> => {
    await getUserInvoices(filterParams);
    if (unpaidFilters) {
      await getUnpaidInvoices(unpaidFilters);
    }
    if (paidFilters) {
      await getPaidInvoices(paidFilters);
    }
    await dashboardQuery.refetch();
    message.success("Data refreshed");
  }, [getUserInvoices, getUnpaidInvoices, getPaidInvoices, dashboardQuery, unpaidFilters, paidFilters]);

  // Process and transform data to maintain backward compatibility
  const invoices = userInvoicesQuery.data?.data?.invoices || [];
  const unpaidInvoices: UnpaidInvoice[] = unpaidInvoicesQuery.data?.data?.unpaidInvoices || [];
  const paidInvoices: PaidInvoice[] = paidInvoicesQuery.data?.data?.paidInvoices || [];

  // Extract pagination from active query
  const activePagination = 
    unpaidInvoicesQuery.data?.data?.pagination ||
    paidInvoicesQuery.data?.data?.pagination ||
    userInvoicesQuery.data?.data?.pagination ||
    null;

  // Transform pagination to match expected structure
  const pagination = activePagination ? {
    currentPage: activePagination.currentPage,
    totalPages: activePagination.totalPages,
    totalInvoices: (activePagination as any).totalUnpaidInvoices || (activePagination as any).totalPaidInvoices || (activePagination as any).totalInvoices || 0,
    invoicesPerPage: activePagination.invoicesPerPage
  } : null;

  // Extract summary from dashboard or active query
  const rawSummary = 
    dashboardQuery.data?.data?.summary ||
    unpaidInvoicesQuery.data?.data?.summary ||
    paidInvoicesQuery.data?.data?.summary ||
    userInvoicesQuery.data?.data?.summary ||
    null;

  // Get specific summaries for better type safety
  const unpaidSummary = unpaidInvoicesQuery.data?.data?.summary;
  const paidSummary = paidInvoicesQuery.data?.data?.summary;
  const dashboardSummary = dashboardQuery.data?.data?.summary;

  // Transform summary to match expected structure  
  const summary = rawSummary ? {
    totalAmount: (dashboardSummary?.totalAmount || 0) + 
                (paidSummary?.totalEarnings || 0) + 
                (unpaidSummary?.totalAmountDue || 0),
    paidAmount: paidSummary?.totalEarnings || dashboardSummary?.paidAmount || 0,
    unpaidAmount: unpaidSummary?.totalAmountDue || dashboardSummary?.unpaidAmount || 0,
    totalInvoices: (dashboardSummary?.totalInvoices || 0) + 
                   (paidSummary?.paidCount || 0) + 
                   (unpaidSummary?.unpaidCount || 0),
    overdueAmount: unpaidSummary?.overdueAmount || dashboardSummary?.overdueAmount || 0
  } : null;

  const dashboardData = dashboardQuery.data?.data || null;

  // Aggregate loading states
  const loading = 
    userInvoicesQuery.isLoading ||
    unpaidInvoicesQuery.isLoading ||
    paidInvoicesQuery.isLoading ||
    dashboardQuery.isLoading;

  // Aggregate error states
  const error = 
    userInvoicesQuery.error?.message ||
    unpaidInvoicesQuery.error?.message ||
    paidInvoicesQuery.error?.message ||
    dashboardQuery.error?.message ||
    null;

  return {
    // State
    loading,
    error,
    invoices,
    unpaidInvoices,
    paidInvoices,
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

    // Expose TanStack Query objects for direct access if needed
    queries: {
      userInvoices: userInvoicesQuery,
      unpaidInvoices: unpaidInvoicesQuery,
      paidInvoices: paidInvoicesQuery,
      dashboard: dashboardQuery,
    }
  };
};