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
import { invoiceQueryBuilder } from "./invoice-helper";

const useUserInvoices = (params?: InvoiceFilters) => {
  const queryParams = invoiceQueryBuilder(params);
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserInvoices, queryParams],
    queryFn: async () => {
      const response = await axiosInstance.get<InvoicesResponse>(`${endpoints.userInvoice.getUserInvoices}?${queryParams}`);
      return response.data;
    },
    enabled: !!queryParams, // Only run query when filters are provided
  });
};

const useUnpaidInvoices = (params?: InvoiceFilters) => {
  const queryParams = invoiceQueryBuilder(params);
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUnpaidInvoices, queryParams],
    queryFn: async () => {
      const response = await axiosInstance.get<UnpaidInvoiceResponse>(`${endpoints.userInvoice.getUnpaidInvoices}?${queryParams}`);
      return response.data;
    },
    enabled: !!queryParams, // Only run query when params are provided
  });
};

const usePaidInvoices = (params?: InvoiceFilters) => {
  const queryParams = invoiceQueryBuilder(params);
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getPaidInvoices, queryParams],
    queryFn: async () => {
      const response = await axiosInstance.get<PaidInvoiceResponse>(`${endpoints.userInvoice.getPaidInvoices}?${queryParams}`);
      return response.data;
    },
    enabled: !!queryParams, // Only run query when params are provided
  });
};

const useUserInvoiceDashboard = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserInvoiceDashboard],
    queryFn: async () => {
      const response = await axiosInstance.get<InvoiceDashboardResponse>(endpoints.userInvoice.getInvoiceDashboard);
      return response.data;
    },
  });
};

const useUserInvoiceDetails = (invoiceId: string | null) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserInvoiceDetails, invoiceId],
    queryFn: async () => {
        if(!invoiceId) {
            throw new Error("InvoiceId is required");
        }
      const response = await axiosInstance.get<InvoiceResponse>(`${endpoints.userInvoice.getInvoiceDetails}/${invoiceId}`);
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