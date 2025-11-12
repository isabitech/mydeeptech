export interface ProjectStatusResponse {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  projects: Project[]
  pagination: Pagination
  filters: Filters
  userInfo: UserInfo
}

export interface Project {
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
  totalApplications: number
  approvedAnnotators: number
  tags: any[]
  isPublic: boolean
  applicationDeadline: any
  createdAt: string
  updatedAt: string
  __v: number
  currentApplications: number
  availableSlots: number
  canApply: boolean
  userApplication: UserApplication
  hasApplied: boolean
  applicationOpen: boolean
  daysUntilDeadline: any
}

export interface CreatedBy {
  _id: string
  fullName: string
  email: string
}

export interface UserApplication {
  applicationId: string
  status: string
  appliedAt: string
  rejectionReason: any
  reviewNotes: string
  coverLetter: string
  availability: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalProjects: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

export interface Filters {
  view: string
  applicationStatus: string
}

export interface UserInfo {
  annotatorStatus: string
  appliedProjects: number
  totalApplications: number
  applicationStats: ApplicationStats
}

export interface ApplicationStats {
  pending: number
  approved: number
  rejected: number
}
