export interface DtUserDashboardResponse {
  success: boolean
  data: DtUserDashboardData
}

export interface DtUserDashboardData {
  userProfile: UserProfile
  profileCompletion: ProfileCompletion
  applicationStatistics: ApplicationStatistics
  financialSummary: FinancialSummary
  resultSubmissions: ResultSubmissions
  recentActivity: RecentActivity
  availableOpportunities: AvailableOpportunities
  performanceMetrics: PerformanceMetrics
  recommendations: Recommendations
  generatedAt: string
  timeframe: Timeframe
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  annotatorStatus: string
  microTaskerStatus: string
  isEmailVerified: boolean
  hasSetPassword: boolean
  joinedDate: string
  profilePicture: any
}

export interface ProfileCompletion {
  percentage: number
  sections: Sections
  completedSections: number
  totalSections: number
}

export interface Sections {
  basicInfo: BasicInfo
  personalInfo: PersonalInfo
  professionalBackground: ProfessionalBackground
  paymentInfo: PaymentInfo
  attachments: Attachments
  profilePicture: ProfilePicture
}

export interface BasicInfo {
  completed: boolean
  fields: string[]
}

export interface PersonalInfo {
  completed: boolean
  fields: string[]
}

export interface ProfessionalBackground {
  completed: boolean
  fields: string[]
}

export interface PaymentInfo {
  completed: boolean
  fields: string[]
}

export interface Attachments {
  completed: boolean
  fields: string[]
}

export interface ProfilePicture {
  completed: boolean
  fields: string[]
}

export interface ApplicationStatistics {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
}

export interface FinancialSummary {
  totalInvoices: number
  totalEarnings: number
  paidEarnings: number
  pendingEarnings: number
  overdueEarnings: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
}

export interface ResultSubmissions {
  totalSubmissions: number
  recentSubmissions: RecentSubmission[]
  lastSubmissionDate: number
}

export interface RecentSubmission {
  cloudinaryResultData: CloudinaryResultData
  originalResultLink: string
  submissionDate: string
  projectId: any
  taskId: string
  status: string
  uploadMethod: string
  notes: string
  _id: string
}

export interface CloudinaryResultData {
  publicId: string
  url: string
  optimizedUrl: string
  thumbnailUrl: string
  originalName: string
  size: number
  format: string
}

export interface RecentActivity {
  recentApplications: any[]
  recentInvoices: any[]
  recentPayments: any[]
}

export interface AvailableOpportunities {
  availableProjects: any[]
  projectCount: number
}

export interface PerformanceMetrics {
  profileCompletionPercentage: number
  applicationSuccessRate: number
  paymentRate: number
  avgEarningsPerInvoice: number
  accountStatus: AccountStatus
}

export interface AccountStatus {
  annotatorStatus: string
  microTaskerStatus: string
  isEmailVerified: boolean
  hasSetPassword: boolean
}

export interface Recommendations {
  nextSteps: NextStep[]
  priorityActions: number
}

export interface NextStep {
  priority: string
  action: string
  title: string
  description: string
}

export interface Timeframe {
  recentActivity: string
  availableProjects: string
}
