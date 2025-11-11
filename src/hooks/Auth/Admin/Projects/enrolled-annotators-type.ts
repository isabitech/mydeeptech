export interface AnnotatorProjectResponse {
  success: boolean
  message: string
  data: AnnotatorProjectResponseData
}

export interface AnnotatorProjectResponseData {
  project: Project
  applicationStats: ApplicationStats
  recentApplications: RecentApplication[]
}

export interface Project {
  projectFiles: ProjectFiles
  deletionOTP: DeletionOtp
  _id: string
  projectName: string
  projectDescription: string
  projectCategory: string
  payRate: number
  payRateCurrency: string
  payRateType: string
  status: string
  maxAnnotators: number
  deadline: any
  estimatedDuration: any
  difficultyLevel: string
  requiredSkills: any[]
  minimumExperience: string
  languageRequirements: any[]
  createdBy: CreatedBy
  assignedAdmins: AssignedAdmin[]
  totalApplications: number
  approvedAnnotators: number
  tags: any[]
  isPublic: boolean
  applicationDeadline: any
  createdAt: string
  updatedAt: string
  __v: number
  media: any[]
  id: string
}

export interface ProjectFiles {
  instructionDocuments: any[]
  sampleData: any[]
  guidelines: any[]
}

export interface DeletionOtp {
  code: any
  expiresAt: any
  requestedBy: any
  requestedAt: any
  verified: boolean
  verifiedAt: any
  verifiedBy: any
}

export interface CreatedBy {
  _id: string
  fullName: string
  phone: string
  email: string
}

export interface AssignedAdmin {
  _id: string
  fullName: string
  phone: string
  email: string
}

export interface ApplicationStats {
  rejected: number
  approved: number
}

export interface RecentApplication {
  _id: string
  projectId: string
  applicantId: ApplicantId
  status: string
  reviewedAt: string
  reviewedBy: string
  coverLetter: string
  proposedRate: number
  availability: string
  estimatedCompletionTime: string
  reviewNotes: string
  rejectionReason?: string
  applicantNotified: boolean
  adminNotified: boolean
  workStartedAt?: string
  workCompletedAt: any
  tasksCompleted: number
  qualityScore: any
  appliedAt: string
  createdAt: string
  updatedAt: string
  __v: number
  id: string
}

export interface ApplicantId {
  _id: string
  fullName: string
  email: string
  annotatorStatus: string
}
