import { z } from "zod"

const CloudinaryResultDataSchema = z.object({
  publicId: z.string(),
  url: z.string(),
  optimizedUrl: z.string(),
  thumbnailUrl: z.string(),
  originalName: z.string(),
  size: z.number(),
  format: z.string(),
})

const RecentSubmissionSchema = z.object({
  cloudinaryResultData: CloudinaryResultDataSchema,
  originalResultLink: z.string(),
  submissionDate: z.string(),
  projectId: z.any(),
  taskId: z.string(),
  status: z.string(),
  uploadMethod: z.string(),
  notes: z.string(),
  _id: z.string(),
})

const ResultSubmissionsSchema = z.object({
  totalSubmissions: z.number(),
  recentSubmissions: z.array(RecentSubmissionSchema),
  lastSubmissionDate: z.number().nullable(),
})

const BasicSectionSchema = z.object({
  completed: z.boolean(),
  fields: z.array(z.string()),
})

const SectionsSchema = z.object({
  basicInfo: BasicSectionSchema,
  personalInfo: BasicSectionSchema,
  professionalBackground: BasicSectionSchema,
  paymentInfo: BasicSectionSchema,
  attachments: BasicSectionSchema,
  profilePicture: BasicSectionSchema,
})

const ProfileCompletionSchema = z.object({
  percentage: z.number(),
  sections: SectionsSchema,
  completedSections: z.number(),
  totalSections: z.number(),
})

const UserProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  annotatorStatus: z.string(),
  microTaskerStatus: z.string(),
  isEmailVerified: z.boolean(),
  hasSetPassword: z.boolean(),
  joinedDate: z.string(),
  profilePicture: z.any(),
})

const ApplicationStatisticsSchema = z.object({
  totalApplications: z.number(),
  pendingApplications: z.number(),
  approvedApplications: z.number(),
  rejectedApplications: z.number(),
})

const FinancialSummarySchema = z.object({
  totalInvoices: z.number(),
  totalEarnings: z.number(),
  paidEarnings: z.number(),
  pendingEarnings: z.number(),
  overdueEarnings: z.number(),
  paidInvoices: z.number(),
  pendingInvoices: z.number(),
  overdueInvoices: z.number(),
})

const RecentActivitySchema = z.object({
  recentApplications: z.array(z.any()),
  recentInvoices: z.array(z.any()),
  recentPayments: z.array(z.any()),
})

const AvailableOpportunitiesSchema = z.object({
  availableProjects: z.array(z.any()),
  projectCount: z.number(),
})

const AccountStatusSchema = z.object({
  annotatorStatus: z.string(),
  microTaskerStatus: z.string(),
  isEmailVerified: z.boolean(),
  hasSetPassword: z.boolean(),
})

const PerformanceMetricsSchema = z.object({
  profileCompletionPercentage: z.number(),
  applicationSuccessRate: z.number(),
  paymentRate: z.number(),
  avgEarningsPerInvoice: z.number(),
  accountStatus: AccountStatusSchema,
})

const NextStepSchema = z.object({
  priority: z.string(),
  action: z.string(),
  title: z.string(),
  description: z.string(),
})

const RecommendationsSchema = z.object({
  nextSteps: z.array(NextStepSchema),
  priorityActions: z.number(),
})

const TimeframeSchema = z.object({
  recentActivity: z.string(),
  availableProjects: z.string(),
})

// --- Main Data Schema ---

const DtUserDashboardDataSchema = z.object({
  userProfile: UserProfileSchema,
  profileCompletion: ProfileCompletionSchema,
  applicationStatistics: ApplicationStatisticsSchema,
  financialSummary: FinancialSummarySchema,
  resultSubmissions: ResultSubmissionsSchema,
  recentActivity: RecentActivitySchema,
  availableOpportunities: AvailableOpportunitiesSchema,
  performanceMetrics: PerformanceMetricsSchema,
  recommendations: RecommendationsSchema,
  generatedAt: z.string(),
  timeframe: TimeframeSchema,
})

// --- Root Response Schema ---

const DtUserDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DtUserDashboardDataSchema,
});

type DtUserDashboardResponseSchema = z.infer<typeof DtUserDashboardResponseSchema>
type DtUserDashboardDataSchema = z.infer<typeof DtUserDashboardDataSchema>
type ResultSubmissionsSchema = z.infer<typeof ResultSubmissionsSchema>
type ApplicationStatisticsSchema = z.infer<typeof ApplicationStatisticsSchema>
type FinancialSummarySchema = z.infer<typeof FinancialSummarySchema>
type PerformanceMetricsSchema = z.infer<typeof PerformanceMetricsSchema>
type AvailableOpportunitiesSchema = z.infer<typeof AvailableOpportunitiesSchema>
type RecentActivitySchema = z.infer<typeof RecentActivitySchema>

export { 
    DtUserDashboardResponseSchema, 
    DtUserDashboardDataSchema, 
    ResultSubmissionsSchema,
    ApplicationStatisticsSchema,
    FinancialSummarySchema,
    PerformanceMetricsSchema,
    AvailableOpportunitiesSchema,
    RecentActivitySchema,
}