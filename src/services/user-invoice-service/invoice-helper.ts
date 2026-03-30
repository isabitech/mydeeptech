import { InvoiceFilters } from "../../types/invoice.types"

const invoiceQueryBuilder = (filters?: InvoiceFilters) => {
    return new URLSearchParams({
        ...(filters?.page ? {page: filters.page.toString()} : {}),
        ...(filters?.limit ? {limit: filters.limit.toString()} : {}),
        ...(filters?.startDate ? {startDate: filters.startDate.toString()} : {}),
        ...(filters?.endDate ? {endDate: filters.endDate.toString()} : {}),
        ...(filters?.paymentStatus ? {paymentStatus: filters.paymentStatus.toString()} : {}),
        ...(filters?.invoiceType ? {invoiceType: filters.invoiceType.toString()} : {}),
    }).toString();
}

export { invoiceQueryBuilder }