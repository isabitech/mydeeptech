import { queryOptions, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { PaginatedInvoiceResponseSchema, InvoiceSchema } from "./invoice-schema";

/**
 * Reusable query options for Invoices
 */
export const invoiceQueries = {
    all: () => queryOptions({
        queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.partnerInvoice.getAll);
            const body = PaginatedInvoiceResponseSchema.parse(response.data);
            
            let rawInvoices: any[] = [];
            if (Array.isArray(body.data)) {
                rawInvoices = body.data;
            } else {
                rawInvoices = body.data.invoices || body.data.data || [];
            }
            
            return rawInvoices
                .map(inv => InvoiceSchema.parse(inv))
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        },
    }),
    
    paginated: (params: { page: number; limit: number; search?: string }) => queryOptions({
        queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices, params],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.partnerInvoice.pagination, { params });
            const body = PaginatedInvoiceResponseSchema.parse(response.data);

            let rawInvoices: any[] = [];
            let totalCount = 0;
            let currentPage = params.page;
            let summary = null;

            if (Array.isArray(body.data)) {
                rawInvoices = body.data;
                totalCount = body.data.length;
            } else {
                rawInvoices = body.data.invoices || body.data.data || [];
                const pag = body.data.pagination || { totalCount: 0, page: params.page };
                totalCount = pag.totalCount;
                currentPage = pag.page;
                summary = body.data.summary;
            }

            const invoices = rawInvoices.map(inv => InvoiceSchema.parse(inv));

            return {
                invoices,
                pagination: {
                    page: Number(currentPage) || params.page,
                    limit: params.limit,
                    totalCount: Number(totalCount) || 0,
                },
                summary
            };
        },
    })
};

const useFetchPartnerInvoices = () => useQuery(invoiceQueries.all());

const useFetchPaginatedPartnerInvoices = (params: { page: number; limit: number; search?: string }) => 
    useQuery(invoiceQueries.paginated(params));

const partnerInvoiceQueryService = {
    useFetchPartnerInvoices,
    useFetchPaginatedPartnerInvoices,
};

export default partnerInvoiceQueryService;
