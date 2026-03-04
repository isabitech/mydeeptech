import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../../service/apiUtils";
import { App } from "antd";

export interface Invoice {
  _id?: string;
  name: string;
  amount: number;
  email: string;
  duration: string;
  due_date: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, "_id">) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  sendInvoice: (invoiceId: string, subject: string, message: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | null>(null);

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) throw new Error("InvoiceContext missing");
  return context;
};

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const { message } = App.useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await apiGet("partner-invoice");
      if (response.success) {
        // Sort by createdAt descending (newest first)
        const sortedInvoices = [...response.data].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setInvoices(sortedInvoices);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      message.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };


  const addInvoice = async (invoice: Omit<Invoice, "_id">) => {
    try {
      // Strip restricted fields
      const { ...invoiceData } = invoice as any;
      delete (invoiceData as any)._id;
      delete (invoiceData as any).__v;
      delete (invoiceData as any).createdAt;
      delete (invoiceData as any).updatedAt;

      // Ensure due_date is in YYYY-MM-DD format
      if (invoiceData.due_date) {
        invoiceData.due_date = invoiceData.due_date.split("T")[0];
      }

      const response = await apiPost("/partner-invoice", invoiceData);
      if (response.success) {
        setInvoices((prev) => [...prev, response.data]);
        message.success("Invoice created successfully");
      }
    } catch (error: any) {
      console.error("Failed to add invoice:", error);
      message.error(error.message || "Failed to create invoice");
      throw error;
    }
  };

  const updateInvoice = async (id: string, updatedInvoice: Partial<Invoice>) => {
    try {
      // Strip restricted fields
      const { ...invoiceData } = updatedInvoice;
      delete invoiceData._id;
      delete (invoiceData as any).__v;
      delete invoiceData.createdAt;
      delete invoiceData.updatedAt;

      // Ensure due_date is in YYYY-MM-DD format
      if (invoiceData.due_date) {
        invoiceData.due_date = invoiceData.due_date.split("T")[0];
      }

      const response = await apiPatch(`/partner-invoice/${id}`, invoiceData);
      if (response.success) {
        setInvoices((prev) =>
          prev.map((inv) => (inv._id === id ? response.data : inv))
        );
        message.success("Invoice updated successfully");
      }
    } catch (error: any) {
      console.error("Failed to update invoice:", error);
      message.error(error.message || "Failed to update invoice");
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const response = await apiDelete(`/partner-invoice/${id}`);
      if (response.success) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== id));
        message.success("Invoice deleted successfully");
      }
    } catch (error: any) {
      console.error("Failed to delete invoice:", error);
      message.error(error.message || "Failed to delete invoice");
      throw error;
    }
  };

  const sendInvoice = async (invoiceId: string, subject: string, emailMessage: string) => {
    try {
      setLoading(true);
      const response = await apiPost("/partner-invoice/send", {
        invoiceId,
        subject,
        message: emailMessage,
      });
      if (response.success) {
        message.success("Invoice sent successfully via email");
      }
    } catch (error: any) {
      console.error("Failed to send invoice:", error);
      message.error(error.message || "Failed to send invoice email");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        loading,
        fetchInvoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        sendInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};