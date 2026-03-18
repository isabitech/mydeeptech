import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { ApiResponseSchema, Invoice } from "./invoice-schema";

/**
 * Hook to add a new partner invoice
 */
export const useAddPartnerInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoice: Omit<Invoice, "_id">) => {
            const payload = {
                name: invoice.name?.trim(),
                email: invoice.email?.trim(),
                amount: Number(invoice.amount),
                currency: invoice.currency || "USD",
                due_date: invoice.due_date ? String(invoice.due_date).split("T")[0] : null,
                description: invoice.description?.trim(),
                duration: invoice.duration
            };

            const response = await axiosInstance.post(endpoints.partnerInvoice.create, payload);
            return ApiResponseSchema.parse(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices] });
        },
    });
};

/**
 * Hook to update an existing partner invoice
 */
export const useUpdatePartnerInvoice = () => {
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
                invoiceData.due_date = String(due_date).split("T")[0];
            }

            const response = await axiosInstance.patch(`${endpoints.partnerInvoice.update}/${id}`, invoiceData);
            return ApiResponseSchema.parse(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices] });
        },
    });
};

/**
 * Hook to delete a partner invoice
 */
export const useDeletePartnerInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`${endpoints.partnerInvoice.delete}/${id}`);
            return ApiResponseSchema.parse(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getPartnerInvoices] });
        },
    });
};

/**
 * Hook to send a partner invoice via email
 */
export const useSendPartnerInvoice = () => {
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const response = await axiosInstance.post(endpoints.partnerInvoice.send, { id });
            return ApiResponseSchema.parse(response.data);
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
