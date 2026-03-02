import { createContext, useContext, useState, ReactNode } from "react";

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: number;
  number: string;
  client: string;
  email: string;
  location: string;

  // Needed for InvoicePage table
  amount: string;
  status: string;
  created: string;
  due: string;

  // Needed for Edit/New page
  dueDate: string;
  items: InvoiceItem[];
}
interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
}

const InvoiceContext = createContext<InvoiceContextType | null>(null);

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) throw new Error("InvoiceContext missing");
  return context;
};

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice]);
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (String(inv.id) === String(updatedInvoice.id) ? updatedInvoice : inv))
    );
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
};