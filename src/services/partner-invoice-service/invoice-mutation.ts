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
            const payload: any = {
                name: invoice.name?.trim(),
                email: invoice.email?.trim(),
                amount: Number(invoice.amount),
                currency: invoice.currency || "USD",
                due_date: invoice.due_date ? (invoice.due_date as string).split("T")[0] : (invoice.due_date as string)?.split("T")[0]
            };

            if (invoice.description) payload.description = invoice.description.trim();
            if (invoice.duration) payload.duration = invoice.duration;

            const response = await axiosInstance.post(endpoints.partnerInvoice.create, payload);
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
            const { name, email, amount, due_date, currency, description, duration } = updatedInvoice;

            const invoiceData: any = {};
            if (name) invoiceData.name = name.trim();
            if (email) invoiceData.email = email.trim();
            if (amount !== undefined) invoiceData.amount = Number(amount);
            if (currency) invoiceData.currency = currency;
            if (description) invoiceData.description = description.trim();
            if (duration) invoiceData.duration = duration;

            if (due_date) {
                let finalDueDate = due_date as string;
                if (finalDueDate.includes("T")) finalDueDate = finalDueDate.split("T")[0];
                invoiceData.due_date = finalDueDate;
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
        mutationFn: async ({ id }: { id: string }) => {
            const response = await axiosInstance.post(endpoints.partnerInvoice.send, {
                id,
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
