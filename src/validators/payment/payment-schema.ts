import { z } from "zod";

const BulkTransferPayloadSchema = z.object({
  transfers: z.array(
    z.object({
      invoiceId: z.string().min(1, "Invoice ID is required"),
      recipientName: z.string().min(1, "Recipient name is required"),
      recipientEmail: z.email("Invalid email address"),
      bankCode: z.string().min(1, "Bank code is required"),
      accountNumber: z.string().min(1, "Account number is required"),
      recipientPhone: z.string().min(1, "Recipient phone is required"),
    })
  ).min(1, "At least one transfer is required"),

  currency: z.string().optional(),
  source: z.string().min(1),

  metadata: z.object({
    initiated_from: z.string().min(1),
    notes: z.string().min(1),
    batch_name: z.string().min(1),
  }),
});

type BulkTransferPayloadSchema = z.infer<typeof BulkTransferPayloadSchema>;

export const PayloadOptionsSchema = z.object({
  initiatedBy: z.string().optional(),
  currency: z.string().optional(),
  source: z.string().optional(),
});

export {
    BulkTransferPayloadSchema,
}