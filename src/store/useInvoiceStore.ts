import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage } from "../service/apiUtils";
import { endpoints } from "./api/endpoints";

export interface Invoice {
    _id?: string;
    name: string;
    amount: number;
    email: string;
    duration: string;
    due_date: string;
    description?: string;
    currency: string;
    createdAt?: string;
    updatedAt?: string;
}

type InvoiceStates = {
    invoices: Invoice[];
    loading: boolean;
    error: string | null;
};

type InvoiceActions = {
    fetchInvoices: () => Promise<void>;
    addInvoice: (invoice: Omit<Invoice, "_id">) => Promise<void>;
    updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    sendInvoice: (invoiceId: string, subject: string, message: string) => Promise<void>;
    setError: (error: string | null) => void;
};

type InvoiceStore = InvoiceStates & InvoiceActions;

const initialStates: InvoiceStates = {
    invoices: [],
    loading: false,
    error: null,
};

const useInvoiceStore = create<InvoiceStore>((set, get) => ({
    ...initialStates,

    setError: (error) => set({ error }),

    fetchInvoices: async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiGet(endpoints.partnerInvoice.getAll);
            if (response.success) {
                // Sort by createdAt descending (newest first)
                const sortedInvoices = [...response.data].sort((a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                set({ invoices: sortedInvoices });
            } else {
                set({ error: response.message || "Failed to fetch invoices" });
            }
        } catch (error: any) {
            console.error("Failed to fetch invoices:", error);
            const message = getErrorMessage(error);
            set({ error: message });
        } finally {
            set({ loading: false });
        }
    },

    addInvoice: async (invoice) => {
        set({ loading: true, error: null });
        try {
            const { amount, due_date, ...rest } = invoice as any;
            const isoDueDate = due_date && due_date.includes("T") ? due_date : `${due_date}T00:00:00.000Z`;
            const invoiceData = {
                ...rest,
                amount: amount, // Backend explicitly asked for 'amount'
                invoiceAmount: amount, // Backup for different endpoints
                due_date: due_date, // Original UI field
                dueDate: isoDueDate, // Mapped field
                invoiceDate: new Date().toISOString(),
                currency: rest.currency || "USD"
            };
            delete invoiceData._id;
            delete (invoiceData as any).__v;
            delete invoiceData.createdAt;
            delete invoiceData.updatedAt;

            const response = await apiPost(endpoints.partnerInvoice.create, invoiceData);
            if (response.success) {
                // Map response back to frontend schema
                const newInvoice = {
                    ...response.data,
                    amount: response.data.invoiceAmount || response.data.amount,
                    due_date: response.data.dueDate || response.data.due_date
                };
                set((state) => ({
                    invoices: [newInvoice, ...state.invoices]
                }));
            } else {
                const message = response.message || "Failed to create invoice";
                set({ error: message });
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Failed to add invoice. Full error:", error);
            const message = getErrorMessage(error);
            set({ error: message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateInvoice: async (id, updatedInvoice) => {
        set({ loading: true, error: null });
        try {
            // Map to backend schema
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

            delete invoiceData._id;
            delete invoiceData.createdAt;
            delete invoiceData.updatedAt;
            delete invoiceData.__v;

            const response = await apiPatch(`${endpoints.partnerInvoice.update}/${id}`, invoiceData);
            if (response.success) {
                const updated = {
                    ...response.data,
                    amount: response.data.invoiceAmount || response.data.amount,
                    due_date: response.data.dueDate || response.data.due_date
                };
                set((state) => ({
                    invoices: state.invoices.map((inv) => (inv._id === id ? updated : inv))
                }));
            } else {
                const message = response.message || "Failed to update invoice";
                set({ error: message });
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Failed to update invoice:", error);
            const message = getErrorMessage(error);
            set({ error: message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteInvoice: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await apiDelete(`${endpoints.partnerInvoice.delete}/${id}`);
            if (response.success) {
                set((state) => ({
                    invoices: state.invoices.filter((inv) => inv._id !== id)
                }));
            } else {
                const message = response.message || "Failed to delete invoice";
                set({ error: message });
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Failed to delete invoice:", error);
            const message = getErrorMessage(error);
            set({ error: message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    sendInvoice: async (invoiceId, subject, emailMessage) => {
        set({ loading: true, error: null });
        try {
            const response = await apiPost(endpoints.partnerInvoice.send, {
                invoiceId,
                subject,
                message: emailMessage,
            });
            if (!response.success) {
                const message = response.message || "Failed to send invoice email";
                set({ error: message });
                throw new Error(message);
            }
        } catch (error: any) {
            console.error("Failed to send invoice:", error);
            const message = getErrorMessage(error);
            set({ error: message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));

const useInvoiceActions = () => {
    return useInvoiceStore(
        useShallow((state) => ({
            fetchInvoices: state.fetchInvoices,
            addInvoice: state.addInvoice,
            updateInvoice: state.updateInvoice,
            deleteInvoice: state.deleteInvoice,
            sendInvoice: state.sendInvoice,
            setError: state.setError,
        }))
    );
};

const useInvoiceStates = () => {
    return useInvoiceStore(
        useShallow((state) => ({
            invoices: state.invoices,
            loading: state.loading,
            error: state.error,
        }))
    );
};

export { useInvoiceStates, useInvoiceActions, useInvoiceStore };
