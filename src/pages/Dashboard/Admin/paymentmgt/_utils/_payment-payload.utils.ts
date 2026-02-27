import { AdminInvoice } from "../../../../../types/admin-invoice-type";
import { BulkTransferPayloadSchema } from "../../../../../validators/payment/payment-schema";

export interface BulkTransferPayload {
  transfers: {
    invoiceId: string;
    recipientName: string;
    recipientEmail: string;
    bankCode: string;
    accountNumber: string;
    recipientPhone: string;
  }[];
  currency?: string;
  source: string;
  metadata: {
    initiated_from: string;
    notes: string;
    // initiatedBy: string;
    batch_name: string;
  };
}

export interface PayloadOptions {
  initiatedBy?: string;
  currency?: string;
  source?: string;
}

export const constructBulkTransferPayload = (
  selectedInvoices: AdminInvoice[],
  options: PayloadOptions
): BulkTransferPayloadSchema => {
  const {
    currency,
    source = "balance",
  } = options;

  return {
    transfers: selectedInvoices.map(invoice => {
      const dtUser = invoice.dtUserId;
      const paymentInfo = typeof dtUser === 'string' ? null : dtUser?.payment_info;
      
      return {
        invoiceId: invoice._id,
        recipientName: typeof dtUser === 'string' ? dtUser : (dtUser?.fullName || 'Unknown User'),
        recipientEmail: typeof dtUser === 'string' ? 'N/A' : (dtUser?.email || 'N/A'),
        bankCode: paymentInfo ? (paymentInfo as any)?.bank_code || '' : '',
        accountNumber: paymentInfo?.account_number || '',
        recipientPhone: paymentInfo ? (paymentInfo as any)?.phone || (dtUser as any)?.phone || '' : ''
      };
    }),
    currency,
    source,
    metadata: {
      initiated_from: "admin_dashboard",
      notes: `Bulk transfer for ${selectedInvoices.length} selected invoices`,
      batch_name: `Bulk Payment ${new Date().toISOString()}`,
    }
  };
};
