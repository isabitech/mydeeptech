import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { Invoice } from "../../store/useInvoiceStore";
import { getErrorMessage } from "../../service/apiUtils";

const useAddPartnerInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoice: Omit<Invoice, "_id">) => {
            const { amount, due_date, ...rest } = invoice as any;
            const isoDueDate = due_date && due_date.includes("T") ? due_date : `${due_date}T00:00:00.000Z`;
            const invoiceData = {
                ...rest,
                amount: amount,
                invoiceAmount: amount,
                due_date: due_date,
                dueDate: isoDueDate,
                invoiceDate: new Date().toISOString(),
                currency: rest.currency || "USD"
            };

            const response = await axiosInstance.post(endpoints.partnerInvoice.create, invoiceData);
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to create invoice");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices] });
        },
        onError: (error: any) => {
            console.error("Failed to add invoice. Full error:", error);
        }
    });
};

const useUpdatePartnerInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updatedInvoice }: { id: string; updatedInvoice: Partial<Invoice> }) => {
            const { amount, due_date, ...rest } = updatedInvoice as any;
            const invoiceData: any = { ...rest };
            if (amount !== undefined) {
                invoiceData.amount = amount;
                invoiceData.invoiceAmount = amount;
            }
            if (due_date) {
                const isoDueDate = due_date.includes("T") ? due_date : `${due_date}T00:00:00.000Z`;
                invoiceData.due_date = due_date;
                invoiceData.dueDate = isoDueDate;
            }

            const response = await axiosInstance.patch(`${endpoints.partnerInvoice.update}/${id}`, invoiceData);
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to update invoice");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices] });
        },
    });
};

const useDeletePartnerInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`${endpoints.partnerInvoice.delete}/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to delete invoice");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices] });
        },
    });
};

const useSendPartnerInvoice = () => {
    return useMutation({
        mutationFn: async ({ invoiceId, subject, message }: { invoiceId: string; subject: string; message: string }) => {
            const response = await axiosInstance.post(endpoints.partnerInvoice.send, {
                invoiceId,
                subject,
                message,
            });
            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to send invoice email");
            }
            return response.data;
        },
    });
};

const partnerInvoiceMutationService = {
    useAddPartnerInvoice,
    useUpdatePartnerInvoice,
    useDeletePartnerInvoice,
    useSendPartnerInvoice,
};

export default partnerInvoiceMutationService;
