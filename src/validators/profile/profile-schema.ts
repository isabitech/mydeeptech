import { z } from "zod";

const PersonalInfoSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  timeZone: z.string().optional(),
  availableHoursPerWeek: z.number().optional(),
  preferredCommunicationChannel: z.string().optional(),
});

const PaymentInfoSchema = z.object({
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentCurrency: z.string().optional(),
  bankCode: z.string().optional(),
  bank_slug: z.string().optional(),
});

const ProfessionalBackgroundSchema = z.object({
  educationField: z.string().optional(),
  yearsOfExperience: z.number().optional(),
});

const LanguageProficiencySchema = z.object({
  nativeLanguages: z.array(z.string()).optional(),
  otherLanguages: z.array(z.string()).optional(),
  primaryLanguage: z.string().optional(),
  englishFluencyLevel: z.string().optional(),
});

const SystemInfoSchema = z.object({
  deviceType: z.string().optional(),
  operatingSystem: z.string().optional(),
  internetSpeedMbps: z.number().optional(),
  powerBackup: z.boolean().optional(),
  hasWebcam: z.boolean().optional(),
  hasMicrophone: z.boolean().optional(),
});

const ProjectPreferencesSchema = z.object({
  domains: z.array(z.string()).optional(),
  preferredComplexity: z.string().optional(),
  availableTimeSlots: z.array(z.string()).optional(),
});

const AttachmentsSchema = z.object({
  resumeUrl: z.string().optional(),
  idDocumentUrl: z.string().optional(),
});

const AccountMetadataSchema = z.object({
  profileCompleteness: z.number().optional(),
  verificationStatus: z.string().optional(),
  lastProfileUpdate: z.string().optional(),
});

// Domain object schema for userDomains
const UserDomainSchema = z.object({
  _id: z.string(),
  name: z.string(),
  assignmentId: z.string().optional(), // ID for domain-to-user relationship removal
});

export const ProfileSchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  email: z.string().optional(), 
  phone: z.string().optional(),
  domains: z.array(z.string()).optional(), // Legacy domain field
  userDomains: z.array(UserDomainSchema).optional(), // New structured domain field
  consent: z.boolean().optional(),
  annotatorStatus: z.string().optional(),
  microTaskerStatus: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  hasSetPassword: z.boolean().optional(),
  resultLink: z.string().optional(),
  personalInfo: PersonalInfoSchema.optional(),
  paymentInfo: PaymentInfoSchema.optional(),
  professionalBackground: ProfessionalBackgroundSchema.optional(),
  toolExperience: z.array(z.any()).optional(),
  annotationSkills: z.array(z.any()).optional(),
  languageProficiency: LanguageProficiencySchema.optional(),
  systemInfo: SystemInfoSchema.optional(),
  projectPreferences: ProjectPreferencesSchema.optional(),
  attachments: AttachmentsSchema.optional(),
  accountMetadata: AccountMetadataSchema.optional(),
});

export const ProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  profile: ProfileSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;