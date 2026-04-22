import { z } from "zod";

// User Domain schema for annotators
const UserDomainSchema = z.object({
  _id: z.string(),
  name: z.string(),
  assignmentId: z.string().optional(),
});

// Personal Info nested schema
const PersonalInfoSchema = z.object({
  country: z.string(),
  time_zone: z.string(),
  available_hours_per_week: z.number(),
  preferred_communication_channel: z.string(),
});

// Payment Info nested schema  
const PaymentInfoSchema = z.object({
  account_name: z.string(),
  account_number: z.string(),
  bank_name: z.string(),
  payment_method: z.string(),
  payment_currency: z.string(),
});

// Professional Background nested schema
const ProfessionalBackgroundSchema = z.object({
  education_field: z.string(),
  years_of_experience: z.number(),
  annotation_experience_types: z.array(z.any()),
});

// Language Proficiency nested schema
const LanguageProficiencySchema = z.object({
  primary_language: z.string(),
  other_languages: z.array(z.any()),
  english_fluency_level: z.string(),
});

// System Info nested schema
const SystemInfoSchema = z.object({
  device_type: z.string(),
  operating_system: z.string(),
  internet_speed_mbps: z.number(),
  power_backup: z.boolean(),
  has_webcam: z.boolean(),
  has_microphone: z.boolean(),
});

// Project Preferences nested schema
const ProjectPreferencesSchema = z.object({
  domains_of_interest: z.array(z.any()),
  availability_type: z.string(),
  nda_signed: z.boolean(),
});

// Attachments nested schema
const AttachmentsSchema = z.object({
  resume_url: z.string(),
  id_document_url: z.string(),
  work_samples_url: z.array(z.any()),
});

// Main Annotator User schema
const AnnotatorUserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  domains: z.array(z.string()),
  userDomains: z.array(UserDomainSchema).optional(),
  socialsFollowed: z.array(z.any()),
  consent: z.boolean(),
  hasSetPassword: z.boolean(),
  isEmailVerified: z.boolean(),
  annotatorStatus: z.string(),
  microTaskerStatus: z.string(),
  qaStatus: z.string().optional(),
  resultLink: z.string(),
  tool_experience: z.array(z.any()),
  annotation_skills: z.array(z.any()),
  personal_info: PersonalInfoSchema,
  payment_info: PaymentInfoSchema,
  professional_background: ProfessionalBackgroundSchema,
  language_proficiency: LanguageProficiencySchema,
  system_info: SystemInfoSchema,
  project_preferences: ProjectPreferencesSchema,
  attachments: AttachmentsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

// Pagination schema
// const PaginationSchema = z.object({
//   currentPage: z.number(),
//   totalPages: z.number(),
//   totalUsers: z.number(),
//   usersPerPage: z.number(),
//   hasNextPage: z.boolean(),
//   hasPreviousPage: z.boolean(),
// });

// Pagination Schema
 const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalUsers: z.number(),
  usersPerPage: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

// Status Breakdown schema  
const StatusBreakdownSchema = z.object({
  approved: z.number(),
  rejected: z.number(),
  pending: z.number(),
  submitted: z.number().optional(),
});

// QA Breakdown schema
const QABreakdownSchema = z.object({
  approved: z.number().optional(),
  rejected: z.number().optional(),
  pending: z.number().optional(),
});

// Summary schema
const SummarySchema = z.object({
  totalUsers: z.number(),
  statusBreakdown: StatusBreakdownSchema,
  qaBreakdown: QABreakdownSchema.optional(),
  filters: z.object({}).optional(),
});

// Main API Response schema
const GetAllDTUsersDataSchema = z.object({
  users: z.array(AnnotatorUserSchema),
  pagination: PaginationSchema,
  summary: SummarySchema,
});

const GetAllDTUsersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: GetAllDTUsersDataSchema,
});

// Query params schema
const AnnotatorsQueryParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  country: z.string().optional(),
  qaStatus: z.string().optional(),
}).optional();


// Reusable enums (optional but cleaner)
const StatusEnum = z.enum(["pending", "approved", "rejected"]).nullable();

// QA User Schema
const QAUserSchema = z.object({
  _id: z.string(),
  id: z.string(),
  fullName: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  annotatorStatus: StatusEnum,
  microTaskerStatus: StatusEnum,
  qaStatus: StatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Optional fields that may be populated
  userDomains: z.array(UserDomainSchema).optional(),
  domains: z.array(z.string()).optional(),
  resultLink: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  personal_info: PersonalInfoSchema.partial().optional(),
  professional_background: ProfessionalBackgroundSchema.partial().optional(),
  language_proficiency: LanguageProficiencySchema.partial().optional(),
  qaApprovedAt: z.string().optional(),
  qaApprovedBy: z.string().optional(), 
  qaReason: z.string().optional(),
  idDocuments: z.array(z.string()).optional(),
});



// Status Counts Schema
const StatusCountsSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  total: z.number(),
  null: z.number(),
});

// Filters Schema
const FiltersSchema = z.object({
  qaStatus: StatusEnum,
  search: z.string().nullable(),
});

// Main Response Schema
const GetQAUsersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    qaUsers: z.array(QAUserSchema),
    pagination: PaginationSchema,
    statusCounts: StatusCountsSchema,
    filters: FiltersSchema,
  }),
});

// Export types
type AnnotatorUserSchema = z.infer<typeof AnnotatorUserSchema>;
type AnnotatorUser = AnnotatorUserSchema; // Alias for backwards compatibility
type PaginationSchema = z.infer<typeof PaginationSchema>;
type StatusBreakdownSchema = z.infer<typeof StatusBreakdownSchema>;
type QABreakdownSchema = z.infer<typeof QABreakdownSchema>;
type SummarySchema = z.infer<typeof SummarySchema>;
type GetAllDTUsersDataSchema = z.infer<typeof GetAllDTUsersDataSchema>;
type GetAllDTUsersResponseSchema = z.infer<typeof GetAllDTUsersResponseSchema>;
type AnnotatorsQueryParamsSchema = z.infer<typeof AnnotatorsQueryParamsSchema>;
type GetQAUsersResponseSchema = z.infer<typeof GetQAUsersResponseSchema>;
type QAUserSchema = z.infer<typeof QAUserSchema>;


export {
    AnnotatorUserSchema,
    PaginationSchema,
    StatusBreakdownSchema,
    QABreakdownSchema,
    SummarySchema,
    GetAllDTUsersDataSchema,
    GetAllDTUsersResponseSchema,
    AnnotatorsQueryParamsSchema,
    GetQAUsersResponseSchema,
    QAUserSchema,
};

export type { AnnotatorUser }; // Export alias for backwards compatibility