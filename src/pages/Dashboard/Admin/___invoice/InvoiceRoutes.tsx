import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { InvoiceProvider } from "./invoiceContext";
import InvoicePage from "./InvoicePage";
import NewInvoice from "./NewInvoice";
import InvoiceDetails from "./InvoiceDetails";
import SendInvoice from "./SendInvoice";
import EditInvoice from "./EditInvoice";

const InvoiceRoutes = () => {
    return (
        <InvoiceProvider>
            <Routes>
                <Route index element={<InvoicePage />} />
                <Route path="new" element={<NewInvoice />} />
                <Route path=":id" element={<InvoiceDetails />} />
                <Route path=":id/send" element={<SendInvoice />} />
                <Route path=":id/edit" element={<EditInvoice />} />
                <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
            <Outlet />
        </InvoiceProvider>
    );
};

export default InvoiceRoutes;
