import { Admin } from "./useAdminSignup"

export interface AdminDashboardResponse {
  success: boolean
  data: AdminDashboardData
}

export interface AdminDashboardData {
  overview: Overview
  dtUserStatistics: DtUserStatistics
  projectStatistics: ProjectStatistics
  applicationStatistics: ApplicationStatistics
  invoiceStatistics: InvoiceStatistics
  trends: Trends
  topPerformers: TopPerformers
  recentActivities: RecentActivities
  insights: Insights
  generatedAt: string
  timeframe: Timeframe
}

export interface Overview {
  totalUsers: number
  totalProjects: number
  totalInvoices: number
  totalRevenue: number
  pendingApplications: number
}

export interface DtUserStatistics {
  _id: any
  totalUsers: number
  pendingAnnotators: number
  submittedAnnotators: number
  verifiedAnnotators: number
  approvedAnnotators: number
  rejectedAnnotators: number
  pendingMicroTaskers: number
  approvedMicroTaskers: number
  verifiedEmails: number
  usersWithPasswords: number
  usersWithResults: number
}

export interface ProjectStatistics {
  _id: any
  totalProjects: number
  activeProjects: number
  completedProjects: number
  pausedProjects: number
  totalBudget: number
  totalSpent: number
}

export interface ApplicationStatistics {
  _id: any
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
}

export interface InvoiceStatistics {
  _id: any
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  overdueAmount: number
  paidCount: number
  unpaidCount: number
  overdueCount: number
}

export interface Trends {
  recentRegistrations: RecentRegistration[]
  recentInvoiceActivity: RecentInvoiceActivity[]
}

export interface RecentRegistration {
  _id: Id
  count: number
}

export interface Id {
  year: number
  month: number
  day: number
}

export interface RecentInvoiceActivity {
  _id: Id2
  invoicesCreated: number
  invoicesPaid: number
  amountPaid: number
}

export interface Id2 {
  year: number
  month: number
  day: number
}

export interface TopPerformers {
  topAnnotators: TopAnnotator[]
}

export interface TopAnnotator {
  _id: string
  fullName: string
  email: string
  submissionCount: number
  lastSubmission: string
}

export interface RecentActivities {
  recentUsers: RecentUser[]
  recentProjects: RecentProject[]
}

export interface RecentUser {
  _id: string
  fullName: string
  email: string
  isEmailVerified: boolean
  annotatorStatus: string
  microTaskerStatus: string
  createdAt: string
}

export interface RecentProject {
  _id: string
  projectName: string
  status: string
  createdAt: string
  id: string
}

export interface Insights {
  domainDistribution: DomainDistribution[]
  conversionRates: ConversionRates
  financialHealth: FinancialHealth
}

export interface DomainDistribution {
  _id: string
  count: number
}

export interface ConversionRates {
  emailVerificationRate: string
  passwordSetupRate: string
  resultSubmissionRate: string
  approvalRate: string
}

export interface FinancialHealth {
  paymentRate: string
  averageInvoiceAmount: string
  outstandingBalance: number
}

export interface Timeframe {
  registrationData: string
  invoiceActivity: string
}
