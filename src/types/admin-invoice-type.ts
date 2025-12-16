export interface AdminInvoiceResponse {
  success: boolean
  data: AdminInvoiceResponseData
}

export interface AdminInvoiceResponseData {
  invoices: AdminInvoice[]
  pagination: Pagination
  summary: Summary
}

import { Currency, PaymentStatus, InvoiceStatus, PaymentMethod, InvoiceType } from './invoice.types';

export interface AdminInvoice {
  _id: string
  projectId: any
  dtUserId: DtUserId
  createdBy: CreatedBy
  invoiceAmount: number
  currency: Currency
  invoiceDate: string
  dueDate: string
  workPeriodStart?: string
  workPeriodEnd?: string
  description: string
  workDescription?: string
  paymentStatus: PaymentStatus
  hoursWorked?: number
  tasksCompleted?: number
  qualityScore?: number
  status: InvoiceStatus
  emailSent: boolean
  adminNotes?: string
  invoiceType: InvoiceType
  attachments: any[]
  createdAt: string
  updatedAt: string
  invoiceNumber: string
  __v: number
  emailSentAt: string
  paidAmount?: number
  paidAt?: string
  paymentMethod?: PaymentMethod
  paymentNotes?: string
  paymentReference?: string
  daysOverdue: number
  amountDue: number
  formattedInvoiceNumber: string
  id: string
}

export interface PaymentInfo {
  account_name: string
  account_number: string
  bank_name: string
  payment_currency: string
  payment_method: string
}

export interface DtUserId {
  payment_info?: PaymentInfo
  _id: string
  fullName: string
  phone: string
  email: string
}

export interface CreatedBy {
  _id: string
  fullName: string
  email: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalInvoices: number
  invoicesPerPage: number
}

export interface Summary {
  _id: any
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  overdueInvoices: number
}
