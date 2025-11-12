export interface UnpaidInvoiceResponse {
  success: boolean
  data: Data
}

export interface Data {
  unpaidInvoices: UnpaidInvoice[]
  pagination: Pagination
  summary: Summary
}

export interface UnpaidInvoice {
  _id: string
  projectId: ProjectId
  dtUserId: string
  createdBy: CreatedBy
  invoiceAmount: number
  currency: string
  invoiceDate: string
  dueDate: string
  workPeriodStart: string
  workPeriodEnd: string
  description: string
  workDescription: string
  paymentStatus: string
  hoursWorked: number
  tasksCompleted: number
  qualityScore: number
  status: string
  emailSent: boolean
  adminNotes: string
  invoiceType: string
  attachments: any[]
  createdAt: string
  updatedAt: string
  invoiceNumber: string
  __v: number
  emailSentAt: string
  daysOverdue: number
  amountDue: number
  formattedInvoiceNumber: string
  id: string
}

export interface ProjectId {
  _id: string
  projectName: string
  projectCategory: string
  id: string
}

export interface CreatedBy {
  _id: string
  fullName: string
  email: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalUnpaidInvoices: number
  invoicesPerPage: number
}

export interface Summary {
  totalAmountDue: number
  overdueAmount: number
  unpaidCount: number
}
