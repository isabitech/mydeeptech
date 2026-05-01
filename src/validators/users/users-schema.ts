import { z } from "zod";

// Sub-schemas
const PersonalInfoSchema = z.object({
  country_of_origin: z.string(),
  date_of_birth: z.string().nullable(),
  age: z.number().nullable(),
  gender: z.string(),
  recruiter_name: z.string(),
  recruiter_id: z.string().nullable(),
  available_hours_per_week: z.number(),
  country: z.string(),
  preferred_communication_channel: z.string(),
  time_zone: z.string(),
});

const PaymentInfoSchema = z.object({
  bank_slug: z.string(),
  account_name: z.string(),
  account_number: z.string(),
  bank_name: z.string(),
  payment_currency: z.string(),
  payment_method: z.string(),
  bank_code: z.string(),
});

const ProfessionalBackgroundSchema = z.object({
  annotation_experience_types: z.array(z.string()),
  education_field: z.string(),
  years_of_experience: z.number(),
});

const LanguageProficiencySchema = z.object({
  english_fluency_level: z.string(),
  other_languages: z.array(z.string()),
  primary_language: z.string(),
  native_languages: z.array(z.string()).optional(), // only on some records
});

const SystemInfoSchema = z.object({
  device_type: z.string(),
  has_microphone: z.boolean(),
  has_webcam: z.boolean(),
  internet_speed_mbps: z.number(),
  operating_system: z.string(),
  power_backup: z.boolean(),
});

const ProjectPreferencesSchema = z.object({
  availability_type: z.string(),
  domains_of_interest: z.array(z.string()),
  nda_signed: z.boolean(),
});

const AttachmentsSchema = z.object({
  id_document_url: z.string(),
  resume_url: z.string(),
  work_samples_url: z.array(z.string()),
});

const ProfilePictureSchema = z.object({
  optimizedUrl: z.string(),
  publicId: z.string(),
  thumbnail: z.string(),
  url: z.string(),
});

const SopAcceptanceSchema = z.object({
  has_accepted: z.boolean(),
  accepted_at: z.string().nullable(),
});

const CloudinaryResultDataSchema = z.object({
  publicId: z.string(),
  url: z.string(),
  optimizedUrl: z.string(),
  thumbnailUrl: z.string(),
  originalName: z.string(),
  size: z.number(),
  format: z.string(),
});

const ResultSubmissionSchema = z.object({
  cloudinaryResultData: CloudinaryResultDataSchema,
  originalResultLink: z.string(),
  submissionDate: z.string(),
  projectId: z.string().nullable(),
  taskId: z.string(),
  status: z.string(),
  uploadMethod: z.string(),
  notes: z.string(),
  _id: z.string(),
  id: z.string(),
});

const UserSchema = z.object({
  personal_info: PersonalInfoSchema,
  payment_info: PaymentInfoSchema,
  professional_background: ProfessionalBackgroundSchema,
  language_proficiency: LanguageProficiencySchema,
  system_info: SystemInfoSchema,
  project_preferences: ProjectPreferencesSchema,
  attachments: AttachmentsSchema,
  profilePicture: ProfilePictureSchema,
  sop_acceptance: SopAcceptanceSchema,
  role_permission: z.string().nullable(),
  _id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.email(),
  domains: z.array(z.string()),
  socialsFollowed: z.array(z.string()),
  consent: z.boolean(),
  annotatorStatus: z.string(),
  microTaskerStatus: z.string(),
  qaStatus: z.string(),
  multimediaAssessmentStatus: z.string(),
  spideyAssessmentStatus: z.string(),
  resultLink: z.string(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  annotation_skills: z.array(z.string()),
  hasSetPassword: z.boolean(),
  tool_experience: z.array(z.string()),
  password: z.string().nullable(),
  resultSubmissions: z.array(ResultSubmissionSchema),
  passwordResetAttempts: z.number(),
  passwordResetExpires: z.string().nullable(),
  passwordResetToken: z.string().nullable(),
  role: z.string(),
  assessmentSubmission: z.boolean(),
  id: z.string(),
});

const GetUsersResponseSchema = z.object({
  message: z.string(),
  data: z.array(UserSchema),
  success: z.boolean(),
  error: z.string().nullable(),
});

// Inferred Types
type UserSchema = z.infer<typeof UserSchema>;
type GetUsersResponseSchema = z.infer<typeof GetUsersResponseSchema>;
type PersonalInfoSchema = z.infer<typeof PersonalInfoSchema>;
type PaymentInfoSchema = z.infer<typeof PaymentInfoSchema>;
type ProfessionalBackgroundSchema = z.infer<typeof ProfessionalBackgroundSchema>;
type LanguageProficiencySchema = z.infer<typeof LanguageProficiencySchema>;
type SystemInfoSchema = z.infer<typeof SystemInfoSchema>;
type ProjectPreferencesSchema = z.infer<typeof ProjectPreferencesSchema>;
type AttachmentsSchema = z.infer<typeof AttachmentsSchema>;
type ProfilePictureSchema = z.infer<typeof ProfilePictureSchema>;
type SopAcceptanceSchema = z.infer<typeof SopAcceptanceSchema>;
type ResultSubmissionSchema = z.infer<typeof ResultSubmissionSchema>;

export {
  GetUsersResponseSchema,
  UserSchema,
  PersonalInfoSchema,
  PaymentInfoSchema,
  ProfessionalBackgroundSchema,
  LanguageProficiencySchema,
  SystemInfoSchema,
  ProjectPreferencesSchema,
  AttachmentsSchema,
  ProfilePictureSchema,
  SopAcceptanceSchema,
  ResultSubmissionSchema,
};