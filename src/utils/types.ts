export interface ProfileResponse {
  success: boolean
  message: string
  profile: Profile
}

export interface Profile {
  id: string
  fullName: string
  email: string
  phone: string
  domains: string[]
  consent: boolean
  annotatorStatus: string
  microTaskerStatus: string
  isEmailVerified: boolean
  hasSetPassword: boolean
  resultLink: string
  personalInfo: PersonalInfo
  paymentInfo: PaymentInfo
  professionalBackground: ProfessionalBackground
  toolExperience: any[]
  annotationSkills: any[]
  languageProficiency: LanguageProficiency
  systemInfo: SystemInfo
  projectPreferences: ProjectPreferences
  attachments: Attachments
  accountMetadata: AccountMetadata
}

export interface PersonalInfo {
  fullName: string
  email: string
  phoneNumber: string
  country: string
  timeZone: string
  availableHoursPerWeek: number
  preferredCommunicationChannel: string
}

export interface PaymentInfo {
  accountName: string
  accountNumber: string
  bankName: string
  paymentMethod: string
  paymentCurrency: string
}

export interface ProfessionalBackground {
  educationField: string
  yearsOfExperience: number
  annotationExperienceTypes: any[]
}

export interface LanguageProficiency {
  primaryLanguage: string
  otherLanguages: any[]
  englishFluencyLevel: string
}

export interface SystemInfo {
  deviceType: string
  operatingSystem: string
  internetSpeedMbps: number
  powerBackup: boolean
  hasWebcam: boolean
  hasMicrophone: boolean
}

export interface ProjectPreferences {
  domainsOfInterest: any[]
  availabilityType: string
  ndaSigned: boolean
}

export interface Attachments {
  resumeUrl: string
  idDocumentUrl: string
  workSamplesUrl: any[]
}

export interface AccountMetadata {
  createdAt: string
  updatedAt: string
  status: string
  isEmailVerified: boolean
  hasSetPassword: boolean
}


