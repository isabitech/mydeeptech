import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { Invoice } from "../../store/useInvoiceStore";

const useFetchPartnerInvoices = () => {
    return useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.partnerInvoice.getAll);
            if (response.data.success) {
                // Return original structure but ensure field mapping for UI
                const rawData = Array.isArray(response.data.data) ? response.data.data : [];
                return rawData.map((inv: any) => ({
                    ...inv,
                    amount: inv.invoiceAmount !== undefined ? inv.invoiceAmount : (inv.amount || 0),
                    due_date: inv.dueDate || inv.due_date || inv.invoiceDate || null,
                })).sort((a: any, b: any) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                ) as Invoice[];
            }
            throw new Error(response.data.message || "Failed to fetch invoices");
        },
    });
};
const useFetchPaginatedPartnerInvoices = (params: { page: number; limit: number; search?: string }) => {
    return useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices, params],
        queryFn: async () => {
            // Try the standard pagination first, but prepare to be loose with the endpoint
            const endpoint = endpoints.partnerInvoice.pagination;
            // +1 Look-ahead: Request one extra item to see if a next page exists
            const fetchParams = { ...params, limit: params.limit + 1 };
            const response = await axiosInstance.get(endpoint, { params: fetchParams });
            const body = response.data;
            
            if (body && body.success === false) {
                throw new Error(body.message || "Failed to fetch invoices");
            }

            // Super-flexible extraction: look for data, then body itself, then any array
            let data = body?.data !== undefined ? body.data : body;
            
            let rawInvoices: any[] = [];
            let totalCount = 0;
            let currentPage = params.page;

            // 1. If it's a flat array
            if (Array.isArray(data)) {
                rawInvoices = data;
                totalCount = data.length;
            } 
            // 2. If it's the standard paginated object
            else if (data && typeof data === 'object') {
                rawInvoices = data.invoices || data.data || [];
                // If we still don't have an array, look for any array property
                if (!Array.isArray(rawInvoices)) {
                    const foundArray = Object.values(data).find(v => Array.isArray(v));
                    rawInvoices = Array.isArray(foundArray) ? foundArray : [];
                }
                
                const pag = data.pagination || body.pagination || {};
                totalCount = pag.totalCount || pag.total || pag.totalInvoices || 0;
                currentPage = pag.page || pag.currentPage || params.page;
            }

            // BLIND FORWARD / LOOK-AHEAD LOGIC: 
            // If backend provides a real totalCount, use it.
            // Otherwise, use our look-ahead results to definitively set totalCount.
            const hasMore = rawInvoices.length > params.limit;
            
            if (!totalCount || totalCount <= params.limit) {
                if (hasMore) {
                    // There is at least a next page
                    totalCount = params.page * params.limit + 1;
                } else {
                    // No more items
                    totalCount = (params.page - 1) * params.limit + rawInvoices.length;
                }
            }

            let invoices = rawInvoices
                .filter(Boolean)
                .map((inv: any) => ({
                    ...inv,
                    // Robust field name variations
                    amount: inv.invoiceAmount !== undefined ? inv.invoiceAmount : (inv.amount !== undefined ? inv.amount : 0),
                    due_date: inv.dueDate || inv.due_date || inv.invoiceDate || null,
                }));

            // Always trim the look-ahead item for display
            if (invoices.length > params.limit) {
                invoices = invoices.slice(0, params.limit);
            }

            return {
                invoices: invoices as Invoice[],
                pagination: {
                    page: Number(currentPage) || params.page,
                    limit: params.limit,
                    totalCount: Number(totalCount) || 0,
                },
                summary: data?.summary || body?.summary || null
            };
        },
    });
};

    const partnerInvoiceQueryService = {
        useFetchPartnerInvoices,
        useFetchPaginatedPartnerInvoices,
    };

    export default partnerInvoiceQueryService;
