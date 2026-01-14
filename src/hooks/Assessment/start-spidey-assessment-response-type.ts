export interface StartSpideyAssessmentResponseType {
  success: boolean
  data: StartSpideyAssessmentResponseData
  message: string
}

export interface StartSpideyAssessmentResponseData {
  success: boolean
  submissionId: string
  currentStage: string
  assessmentTitle: string
  timeLimit: number
  message: string
  stageConfig: StageConfig
  assessmentInfo: AssessmentInfo
}

export interface StageConfig {
  name: string
  timeLimit: number
  passingScore: number
  questions: Question[]
}

export interface Question {
  questionId: string
  questionText: string
  questionType: string
  options: Option[]
  isCritical: boolean
  points: number
}

export interface Option {
  optionId: string
  optionText: string
}

export interface AssessmentInfo {
  totalStages: number
  description: string
  projectId: ProjectId
}

export interface ProjectId {
  projectFiles: ProjectFiles
  deletionOTP: DeletionOtp
  assessment: Assessment
  _id: string
  projectName: string
  projectDescription: string
  projectCategory: string
  payRate: number
  payRateCurrency: string
  payRateType: string
  status: string
  maxAnnotators: any
  deadline: string
  estimatedDuration: string
  difficultyLevel: string
  requiredSkills: string[]
  minimumExperience: string
  languageRequirements: string[]
  createdBy: string
  assignedAdmins: string[]
  totalApplications: number
  approvedAnnotators: number
  projectGuidelineLink: string
  projectGuidelineVideo: string
  projectCommunityLink: string
  projectTrackerLink: string
  tags: any[]
  isPublic: boolean
  applicationDeadline: string
  media: any[]
  createdAt: string
  updatedAt: string
  __v: number
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

export interface Assessment {
  isRequired: boolean
  assessmentId: any
  assessmentInstructions: string
  attachedAt: any
  attachedBy: any
}
