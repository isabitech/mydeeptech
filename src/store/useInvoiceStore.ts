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

// NOTE: All API-related states and actions have been moved to TanStack Query.
// See: src/services/partner-invoice-service/
