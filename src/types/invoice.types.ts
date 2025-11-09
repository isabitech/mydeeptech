// Invoice types based on API documentation
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  formattedInvoiceNumber: string;
  projectId: string | ProjectInfo;
  dtUserId: string | DTUserInfo;
  createdBy?: string | AdminInfo;
  invoiceAmount: number;
  currency: Currency;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  status: InvoiceStatus;
  description?: string;
  workDescription?: string;
  workPeriodStart?: string;
  workPeriodEnd?: string;
  hoursWorked?: number;
  tasksCompleted?: number;
  qualityScore?: number;
  invoiceType: InvoiceType;
  adminNotes?: string;
  emailSent?: boolean;
  emailSentAt?: string;
  paidAt?: string;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInfo {
  _id: string;
  projectName: string;
  projectDescription?: string;
  projectCategory?: string;
}

export interface DTUserInfo {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  skills?: string[];
}

export interface AdminInfo {
  _id: string;
  fullName: string;
  email: string;
}

export type Currency = "USD" | "EUR" | "GBP" | "NGN" | "KES" | "GHS";

export type PaymentStatus = "unpaid" | "paid" | "overdue" | "cancelled" | "disputed";

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

export type PaymentMethod = "bank_transfer" | "paypal" | "stripe" | "cryptocurrency" | "cash" | "other";

export type InvoiceType = "project_completion" | "milestone" | "hourly" | "fixed_rate" | "bonus";

// Request/Response types
export interface CreateInvoiceForm {
  projectId: string;
  dtUserId: string;
  invoiceAmount: number;
  currency?: Currency;
  dueDate: string;
  invoiceDate?: string;
  workPeriodStart?: string;
  workPeriodEnd?: string;
  description?: string;
  workDescription?: string;
  hoursWorked?: number;
  tasksCompleted?: number;
  qualityScore?: number;
  invoiceType?: InvoiceType;
  adminNotes?: string;
}

export interface UpdatePaymentStatusForm {
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentNotes?: string;
  paidAmount?: number;
}

export interface InvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: PaginationInfo;
    summary: InvoicesSummary;
  };
  message?: string;
}

export interface InvoiceResponse {
  success: boolean;
  data: {
    invoice: Invoice;
    computedFields?: {
      daysOverdue: number;
      amountDue: number;
      formattedInvoiceNumber: string;
    };
    emailNotificationSent?: boolean;
  };
  message?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalInvoices: number;
  invoicesPerPage: number;
}

export interface InvoicesSummary {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount?: number;
  totalInvoices: number;
  paidInvoices?: number;
  paidCount?: number;
  unpaidInvoices?: number;
  unpaidCount?: number;
  overdueInvoices?: number;
  overdueCount?: number;
  averageInvoiceAmount?: number;
  lastPaymentDate?: string;
  nextDueDate?: string;
}

export interface InvoiceDashboardResponse {
  success: boolean;
  data: {
    summary: InvoicesSummary;
    recentInvoices: Invoice[];
    upcomingPayments: Array<{
      _id: string;
      invoiceNumber: string;
      projectName: string;
      dueDate: string;
      amount: number;
      currency: Currency;
      daysUntilDue: number;
    }>;
  };
  message?: string;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  paymentStatus?: PaymentStatus;
  projectId?: string;
  dtUserId?: string;
  startDate?: string;
  endDate?: string;
  invoiceType?: InvoiceType;
}

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}