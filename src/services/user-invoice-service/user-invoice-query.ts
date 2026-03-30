import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import {
  InvoicesResponse,
  InvoiceResponse,
  InvoiceDashboardResponse,
  InvoiceFilters,
} from "../../types/invoice.types";
import { UnpaidInvoiceResponse } from "../../hooks/Auth/User/Invoices/invoice-type";
import { PaidInvoiceResponse } from "../../hooks/Auth/User/Invoices/paid-invoice-type";

const useUserInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserInvoices, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.paymentStatus) queryParams.append("paymentStatus", filters.paymentStatus);
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);

      const response = await axiosInstance.get<InvoicesResponse>(
        `${endpoints.userInvoice.getUserInvoices}?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: !!filters, // Only run query when filters are provided
  });
};

const useUnpaidInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUnpaidInvoices, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);

      const response = await axiosInstance.get<UnpaidInvoiceResponse>(
        `${endpoints.userInvoice.getUnpaidInvoices}?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: !!filters, // Only run query when filters are provided
  });
};

const usePaidInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getPaidInvoices, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);

      const response = await axiosInstance.get<PaidInvoiceResponse>(
        `${endpoints.userInvoice.getPaidInvoices}?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: !!filters, // Only run query when filters are provided
  });
};

const useUserInvoiceDashboard = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserInvoiceDashboard],
    queryFn: async () => {
      const response = await axiosInstance.get<InvoiceDashboardResponse>(
        endpoints.userInvoice.getInvoiceDashboard
      );
      return response.data;
    },
  });
};

const useUserInvoiceDetails = (invoiceId: string | null) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserInvoiceDetails, invoiceId],
    queryFn: async () => {
      const response = await axiosInstance.get<InvoiceResponse>(
        `${endpoints.userInvoice.getInvoiceDetails}/${invoiceId}`
      );
      return response.data;
    },
    enabled: !!invoiceId,
  });
};

const userInvoiceQueryService = {
  useUserInvoices,
  useUnpaidInvoices,
  usePaidInvoices,
  useUserInvoiceDashboard,
  useUserInvoiceDetails,
};

export default userInvoiceQueryService;