import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { BulkTransferPayloadSchema } from "../../validators/payment/payment-schema";

const useBulkInvoicePayment = () =>  {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.bulkInvoicePayment],
        mutationFn: async (payload: BulkTransferPayloadSchema) => {
            const response = await axiosInstance.post(endpoints.payments.initializeBulkTransferWithInvoices, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllInvoices] });
        }
    });

    return {
        bulkPaymentMutationIsPending: mutation.isPending,
        bulkPaymentMutationError: mutation.error,
        bulkPaymentMutate: mutation.mutate,
        bulkPaymentMutateAsync: mutation.mutateAsync,
        bulkPaymentData: mutation.data,
        ...mutation,
    }
}

const paymentMutationService = {
    useBulkInvoicePayment
}

export default paymentMutationService;