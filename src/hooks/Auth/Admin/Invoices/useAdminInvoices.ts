import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage, createApiUrl } from "../../../../service/apiUtils";
import {
  Invoice,
  CreateInvoiceForm,
  UpdatePaymentStatusForm,
  InvoicesResponse,
  InvoiceResponse,
  InvoiceFilters,
  InvoicesSummary,
  PaginationInfo,
  HookOperationResult,
} from "../../../../types/invoice.types";
import {
  AdminInvoice,
  AdminInvoiceResponse,
} from "../../../../types/admin-invoice-type";

export const useAdminInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [summary, setSummary] = useState<InvoicesSummary | null>(null);

  const createInvoice = useCallback(async (invoiceData: CreateInvoiceForm): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: InvoiceResponse = await apiPost(endpoints.adminInvoice.createInvoice, invoiceData);

      if (data.success) {
        return { success: true, data: data.data.invoice };
      } else {
        const errorMessage = data.message || "Failed to create invoice";
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

  const getAllInvoices = useCallback(async (filters?: InvoiceFilters): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      if (filters?.page) queryParams.page = filters.page.toString();
      if (filters?.limit) queryParams.limit = filters.limit.toString();
      if (filters?.paymentStatus) queryParams.paymentStatus = filters.paymentStatus;
      if (filters?.projectId) queryParams.projectId = filters.projectId;
      if (filters?.dtUserId) queryParams.dtUserId = filters.dtUserId;
      if (filters?.startDate) queryParams.startDate = filters.startDate;
      if (filters?.endDate) queryParams.endDate = filters.endDate;
      if (filters?.invoiceType) queryParams.invoiceType = filters.invoiceType;

      const data: AdminInvoiceResponse = await apiGet(endpoints.adminInvoice.getAllInvoices, { params: queryParams });

      if (data.success) {
        setInvoices(data.data.invoices);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
        return { success: true, data: data.data };
      } else {
        const errorMessage = "Failed to fetch invoices";
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

  const getInvoiceDetails = useCallback(async (invoiceId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminInvoice.getInvoiceDetails}/${invoiceId}`;
      const data: any = await apiGet(url);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch invoice details";
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

  const updatePaymentStatus = useCallback(async (
    invoiceId: string,
    paymentData: UpdatePaymentStatusForm
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminInvoice.updatePaymentStatus}/${invoiceId}/payment-status`;
      const data: any = await apiPatch(url, paymentData);

      if (data.success) {
        // Update the invoice in the local state
        setInvoices(prevInvoices =>
          prevInvoices.map(inv => 
            inv._id === invoiceId 
              ? { ...inv, ...data.data.invoice }
              : inv
          )
        );
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to update payment status";
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

  const sendPaymentReminder = useCallback(async (invoiceId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminInvoice.sendPaymentReminder}/${invoiceId}/send-reminder`;
      const data: any = await apiPost(url, {});

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to send payment reminder";
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

  const deleteInvoice = useCallback(async (invoiceId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminInvoice.deleteInvoice}/${invoiceId}`;
      const data: any = await apiDelete(url);

      if (data.success) {
        // Remove the invoice from local state
        setInvoices(prevInvoices => prevInvoices.filter(inv => inv._id !== invoiceId));
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to delete invoice";
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

  // Bulk operations
  const bulkUpdatePaymentStatus = useCallback(async (
    invoiceIds: string[],
    paymentData: UpdatePaymentStatusForm
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        invoiceIds.map(id => updatePaymentStatus(id, paymentData))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        await getAllInvoices(); // Refresh the list
        return { 
          success: true, 
          data: { successful, failed, total: invoiceIds.length }
        };
      } else {
        const errorMessage = "Failed to update payment status for all invoices";
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
  }, [updatePaymentStatus, getAllInvoices]);

  // Utility function to refresh data
  const refreshInvoices = useCallback(async (filters?: InvoiceFilters) => {
    return await getAllInvoices(filters);
  }, [getAllInvoices]);

  // Bulk Authorize Payment
  const bulkAuthorizePayment = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await apiPost(endpoints.adminInvoice.bulkAuthorizePayment, {});

      if (data.success) {
        // Refresh the invoices after bulk authorization
        await getAllInvoices();
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        const errorMessage = data.message || "Failed to authorize bulk payments";
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
  }, [getAllInvoices]);

  // Generate Paystack CSV
  const generatePaystackCSV = useCallback(async (invoiceIds?: string[] | null): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      let url = endpoints.adminInvoice.generatePaystackCSV;
      
      // Add invoice IDs as query parameters if provided
      if (invoiceIds && invoiceIds.length > 0) {
        const params = new URLSearchParams();
        invoiceIds.forEach(id => params.append('invoiceIds[]', id));
        url += `?${params.toString()}`;
      }

      const data: any = await apiGet(url);

      if (data.success) {
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        const errorMessage = data.message || "Failed to generate Paystack CSV";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage, 
          message: data.message,
          details: data.details
        };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate MPESA CSV
  const generateMpesaCSV = useCallback(async (invoiceIds?: string[] | null): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      let url = endpoints.adminInvoice.generateMpesaCSV;
      
      // Add invoice IDs as query parameters if provided
      if (invoiceIds && invoiceIds.length > 0) {
        const params = new URLSearchParams();
        invoiceIds.forEach(id => params.append('invoiceIds[]', id));
        url += `?${params.toString()}`;
      }

      const data: any = await apiGet(url);

      if (data.success) {
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        const errorMessage = data.message || "Failed to generate MPESA CSV";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage, 
          message: data.message,
          details: data.details
        };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    invoices,
    pagination,
    summary,
    
    // Actions
    createInvoice,
    getAllInvoices,
    getInvoiceDetails,
    updatePaymentStatus,
    sendPaymentReminder,
    deleteInvoice,
    bulkUpdatePaymentStatus,
    bulkAuthorizePayment,
    generatePaystackCSV,
    generateMpesaCSV,
    refreshInvoices,
    
    // State setters for manual control if needed
    setInvoices,
    setLoading,
    setError,
  };
};