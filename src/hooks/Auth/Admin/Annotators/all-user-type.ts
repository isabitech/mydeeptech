export interface GetAllDTUsersResult {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  users: User[]
  pagination: Pagination
  summary: Summary
}

export interface User {
  personal_info: PersonalInfo
  payment_info: PaymentInfo
  professional_background: ProfessionalBackground
  language_proficiency: LanguageProficiency
  system_info: SystemInfo
  project_preferences: ProjectPreferences
  attachments: Attachments
  _id: string
  fullName: string
  phone: string
  email: string
  domains: string[]
  socialsFollowed: any[]
  consent: boolean
  hasSetPassword: boolean
  isEmailVerified: boolean
  annotatorStatus: string
  microTaskerStatus: string
  qaStatus?: string  // Added QA status field
  resultLink: string
  tool_experience: any[]
  annotation_skills: any[]
  createdAt: string
  updatedAt: string
  __v: number
}

export interface PersonalInfo {
  country: string
  time_zone: string
  available_hours_per_week: number
  preferred_communication_channel: string
}

export interface PaymentInfo {
  account_name: string
  account_number: string
  bank_name: string
  payment_method: string
  payment_currency: string
}

export interface ProfessionalBackground {
  education_field: string
  years_of_experience: number
  annotation_experience_types: any[]
}

export interface LanguageProficiency {
  primary_language: string
  other_languages: any[]
  english_fluency_level: string
}

export interface SystemInfo {
  device_type: string
  operating_system: string
  internet_speed_mbps: number
  power_backup: boolean
  has_webcam: boolean
  has_microphone: boolean
}

export interface ProjectPreferences {
  domains_of_interest: any[]
  availability_type: string
  nda_signed: boolean
}

export interface Attachments {
  resume_url: string
  id_document_url: string
  work_samples_url: any[]
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalUsers: number
  usersPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface Summary {
  totalUsers: number
  statusBreakdown: StatusBreakdown
  filters: Filters
}

export interface StatusBreakdown {
  approved: number
  rejected: number
  pending: number
}

export interface Filters {}
