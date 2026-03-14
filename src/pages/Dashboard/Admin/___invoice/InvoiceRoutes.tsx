import { Routes, Route, Navigate } from "react-router-dom";
import InvoicePage from "./InvoicePage";
import PartnerInvoiceTable from "../invoicemgt/PartnerInvoiceTable";

const InvoiceRoutes = () => {
    return (
        <Routes>
            <Route index element={<InvoicePage />} />
            <Route path="paginated" element={<PartnerInvoiceTable />} />
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
};

export default InvoiceRoutes;
