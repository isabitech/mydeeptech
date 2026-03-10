import { Routes, Route, Navigate } from "react-router-dom";
import InvoicePage from "./InvoicePage";

const InvoiceRoutes = () => {
    return (
        <Routes>
            <Route index element={<InvoicePage />} />
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
};

export default InvoiceRoutes;
