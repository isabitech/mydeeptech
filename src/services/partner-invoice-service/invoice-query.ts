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
                return (response.data.data as any[]).map(inv => ({
                    ...inv,
                    amount: inv.invoiceAmount || inv.amount,
                    due_date: inv.dueDate || inv.due_date
                })).sort((a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                ) as Invoice[];
            }
            throw new Error(response.data.message || "Failed to fetch invoices");
        },
    });
};

const partnerInvoiceQueryService = {
    useFetchPartnerInvoices,
};

export default partnerInvoiceQueryService;
