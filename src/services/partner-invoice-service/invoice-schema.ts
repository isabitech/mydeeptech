import { z } from "zod";

/**
 * Single Invoice Item Schema
 * Handles common field mapping and variations from backend
 */
export const InvoiceSchema = z.object({
    _id: z.string().optional(),
    name: z.string().nullish().transform(val => val ?? "N/A"),
    email: z.string().nullish().transform(val => val ?? "N/A"),
    // Flexible amount handling
    invoiceAmount: z.coerce.number().optional(),
    amount: z.coerce.number().nullish().transform(val => val ?? 0),
    currency: z.string().nullish().transform(val => val ?? "USD"),
    duration: z.string().nullish(),
    // Date variations
    dueDate: z.string().nullish(),
    due_date: z.string().nullish(),
    invoiceDate: z.string().nullish(),
    description: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
}).transform((data) => ({
    ...data,
    // Normalize fields for the application
    amount: data.invoiceAmount !== undefined ? data.invoiceAmount : data.amount,
    due_date: data.dueDate || data.due_date || data.invoiceDate || null,
}));

export type Invoice = z.infer<typeof InvoiceSchema>;

/**
 * API Response Schemas
 */
export const ApiResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
});

export const PaginatedInvoiceResponseSchema = ApiResponseSchema.extend({
    data: z.object({
        invoices: z.array(InvoiceSchema).optional(),
        data: z.array(InvoiceSchema).optional(), // Some endpoints return .data.data
        pagination: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(10),
            totalCount: z.coerce.number().default(0),
        }).optional(),
        summary: z.any().nullish(),
    }).or(z.array(InvoiceSchema)),
});

export type PaginatedInvoiceResponse = z.infer<typeof PaginatedInvoiceResponseSchema>;
