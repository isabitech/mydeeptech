export interface Invoice {
    _id?: string;
    name: string;
    amount: number;
    email: string;
    duration?: string | null;
    due_date: string | null;
    description?: string | null;
    currency: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

// NOTE: All API-related states and actions have been moved to TanStack Query.
// See: src/services/partner-invoice-service/
