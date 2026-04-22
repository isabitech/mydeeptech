import { z } from "zod"

const OverviewSchema = z.object({
  totalUsers: z.number().optional().default(0),
  totalProjects: z.number().optional().default(0),
  totalInvoices: z.number().optional().default(0),
  totalRevenue: z.number().optional().default(0),
  pendingApplications: z.number().optional().default(0),
})

const DtUserStatisticsSchema = z.object({
  _id: z.any().optional(),
  totalUsers: z.number().optional().default(0),
  pendingAnnotators: z.number().optional().default(0),
  submittedAnnotators: z.number().optional().default(0),
  verifiedAnnotators: z.number().optional().default(0),
  approvedAnnotators: z.number().optional().default(0),
  rejectedAnnotators: z.number().optional().default(0),
  pendingMicroTaskers: z.number().optional().default(0),
  approvedMicroTaskers: z.number().optional().default(0),
  verifiedEmails: z.number().optional().default(0),
  usersWithPasswords: z.number().optional().default(0),
  usersWithResults: z.number().optional().default(0),
  fullyOnboardedUsers: z.number().optional().default(0),
})

const ProjectStatisticsSchema = z.object({
  _id: z.any().optional(),
  totalProjects: z.number().optional().default(0),
  activeProjects: z.number().optional().default(0),
  completedProjects: z.number().optional().default(0),
  pausedProjects: z.number().optional().default(0),
  cancelledProjects: z.number().optional().default(0),
  totalBudget: z.number().optional().default(0),
  totalSpent: z.number().optional().default(0),
})

const ApplicationStatisticsSchema = z.object({
  _id: z.any().optional(),
  totalApplications: z.number().optional().default(0),
  pendingApplications: z.number().optional().default(0),
  approvedApplications: z.number().optional().default(0),
  rejectedApplications: z.number().optional().default(0),
})

const InvoiceStatisticsSchema = z.object({
  _id: z.any().optional(),
  totalInvoices: z.number().optional().default(0),
  totalAmount: z.number().optional().default(0),
  paidAmount: z.number().optional().default(0),
  unpaidAmount: z.number().optional().default(0),
  overdueAmount: z.number().optional().default(0),
  paidCount: z.number().optional().default(0),
  unpaidCount: z.number().optional().default(0),
  overdueCount: z.number().optional().default(0),
  paidInvoices: z.number().optional().default(0),
  unpaidInvoices: z.number().optional().default(0),
  overdueInvoices: z.number().optional().default(0),
  totalRevenue: z.number().optional().default(0),
  pendingRevenue: z.number().optional().default(0),
  overdueRevenue: z.number().optional().default(0),
})

// --------------------
// Date Group (_id)
// --------------------
const DateGroupSchema = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
});

// --------------------
// Registration Trend
// --------------------
const RegistrationTrendSchema = z.object({
  _id: DateGroupSchema,
  count: z.number(),
});

// --------------------
// Main Schema
// --------------------
const TrendsSchema = z.object({
  recentRegistrations: z.array(RegistrationTrendSchema).default([]),

  // Currently empty array → keep flexible but structured if data appears later
  recentInvoiceActivity: z.array(
    z.object({
      _id: DateGroupSchema,
      invoicesCreated: z.number(),
      invoicesPaid: z.number(),
      amountPaid: z.number(),
    })
  ).default([]),
});

// --------------------
// Top Annotator
// --------------------
const TopAnnotatorSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.email(),
  submissionCount: z.number(),
  lastSubmission: z.string(), // ISO date
});

// --------------------
// Main Schema
// --------------------
const TopPerformersSchema = z.object({
  topAnnotators: z.array(TopAnnotatorSchema).default([]),
});


// --------------------
// Recent Users
// --------------------
const RecentUserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.email(),
  isEmailVerified: z.boolean(),
  annotatorStatus: z.string(),
  microTaskerStatus: z.string(),
  qaStatus: z.string(),
  createdAt: z.string(), // ISO date
});

// --------------------
// Created By
// --------------------
const CreatedBySchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
});

// --------------------
// Project Files
// --------------------
const ProjectFilesSchema = z.object({
  instructionDocuments: z.array(z.any()),
  sampleData: z.array(z.any()),
  guidelines: z.array(z.any()),
});

// --------------------
// Deletion OTP
// --------------------
const DeletionOTPSchema = z.object({
  code: z.string().nullable(),
  expiresAt: z.string().nullable(),
  requestedBy: z.string().nullable(),
  requestedAt: z.string().nullable(),
  verified: z.boolean(),
  verifiedAt: z.string().nullable(),
  verifiedBy: z.string().nullable(),
});

// --------------------
// Assessment
// --------------------
const AssessmentSchema = z.object({
  isRequired: z.boolean(),
  assessmentId: z.string().nullable(),
  assessmentInstructions: z.string(),
  attachedAt: z.string().nullable(),
  attachedBy: z.string().nullable(),
});

// --------------------
// Recent Project
// --------------------
const RecentProjectSchema = z.object({
  _id: z.string(),
  projectName: z.string(),
  projectDescription: z.string(),
  projectCategory: z.string(),

  payRate: z.number(),
  payRateCurrency: z.string(),
  payRateType: z.string(),

  status: z.string(),
  openCloseStatus:  z.string(),

  maxAnnotators: z.number(),
  deadline: z.string(),

  estimatedDuration: z.string(),
  difficultyLevel: z.string(),

  requiredSkills: z.array(z.string()),
  minimumExperience: z.string(),
  languageRequirements: z.array(z.string()),

  createdBy: CreatedBySchema,
  assignedAdmins: z.array(z.string()),

  totalApplications: z.number(),
  approvedAnnotators: z.number(),

  projectGuidelineLink: z.string(),
  projectGuidelineVideo: z.string(),
  projectCommunityLink: z.string(),
  projectTrackerLink: z.string(),

  tags: z.array(z.string()),
  isPublic: z.boolean(),

  applicationDeadline: z.string(),

  projectFiles: ProjectFilesSchema,
  deletionOTP: DeletionOTPSchema,
  assessment: AssessmentSchema,

  isActive: z.boolean(),
  media: z.array(z.any()),

  createdAt: z.string(),
  updatedAt: z.string(),

  __v: z.number(),
});

const RecentActivitiesSchema = z.object({
  recentUsers: z.array(RecentUserSchema).default([]),
  recentProjects: z.array(RecentProjectSchema).default([]),
});

const ConversionRatesSchema = z.object({
  emailVerificationRate: z.number().optional().default(0),
  passwordSetupRate: z.number().optional().default(0),
  resultSubmissionRate: z.number().optional().default(0),
  approvalRate: z.number().optional().default(0),
})

const FinancialHealthSchema = z.object({
  paymentRate: z.number().optional().default(0),
  averageInvoiceAmount: z.number().optional().default(0),
  outstandingBalance: z.number().optional().default(0),
})

const DomainDistributionSchema = z.array(z.object({
  _id: z.string().optional().default(""),
  count: z.number().optional().default(0),
})).optional().default([])

const InsightsSchema = z.object({
  conversionRates: ConversionRatesSchema.optional(),
  financialHealth: FinancialHealthSchema.optional(),
  domainDistribution: DomainDistributionSchema,
})

const TimeframeSchema = z.object({
  start: z.string().optional().default(""),
  end: z.string().optional().default(""),
});

const AdminDashboardDataSchema = z.object({
  overview: OverviewSchema.optional(),
  dtUserStatistics: DtUserStatisticsSchema.optional(),
  projectStatistics: ProjectStatisticsSchema.optional(),
  applicationStatistics: ApplicationStatisticsSchema.optional(),
  invoiceStatistics: InvoiceStatisticsSchema.optional(),
  trends: TrendsSchema.optional().default({
    recentRegistrations: [],
    recentInvoiceActivity: []
  }),
  topPerformers: TopPerformersSchema.optional(),
  recentActivities: RecentActivitiesSchema.optional(),
  insights: InsightsSchema.optional(),
  generatedAt: z.string().optional(),
  timeframe: TimeframeSchema.optional(),
});

const AdminDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: AdminDashboardDataSchema,
})

// Export individual type schemas for component use
type AdminDashboardResponseSchema = z.infer<typeof AdminDashboardResponseSchema>
type AdminDashboardDataSchema = z.infer<typeof AdminDashboardDataSchema>
type OverviewSchema = z.infer<typeof OverviewSchema>
type DtUserStatisticsSchema = z.infer<typeof DtUserStatisticsSchema>
type ProjectStatisticsSchema = z.infer<typeof ProjectStatisticsSchema>
type ApplicationStatisticsSchema = z.infer<typeof ApplicationStatisticsSchema>
type InvoiceStatisticsSchema = z.infer<typeof InvoiceStatisticsSchema>
type TrendsSchema = z.infer<typeof TrendsSchema>
type TopPerformersSchema = z.infer<typeof TopPerformersSchema>
type RecentActivitiesSchema = z.infer<typeof RecentActivitiesSchema>
type InsightsSchema = z.infer<typeof InsightsSchema>
type TimeframeSchema = z.infer<typeof TimeframeSchema>

export {
    AdminDashboardResponseSchema,
    AdminDashboardDataSchema,
    OverviewSchema,
    DtUserStatisticsSchema,
    ProjectStatisticsSchema,
    ApplicationStatisticsSchema,
    InvoiceStatisticsSchema,
    TrendsSchema,
    TopPerformersSchema,
    RecentActivitiesSchema,
    InsightsSchema,
    TimeframeSchema,
}