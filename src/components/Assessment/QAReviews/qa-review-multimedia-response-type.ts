export interface QAReviewMultimediaResponseType {
  success: boolean
  data: QAReviewMultimediaResponseData
}

export interface QAReviewMultimediaResponseData {
  submission: Submission
  qaReview: any
  isReviewed: boolean
}

export interface Submission {
  _id: string
  assessmentId: AssessmentId
  annotatorId: AnnotatorId
  projectId: string
  tasks: Task[]
  totalTimeSpent: number
  timerState: TimerState
  status: string
  submittedAt: string
  qaReview: any
  totalScore: any
  attemptNumber: number
  previousAttempt: string
  sessionMetadata: SessionMetadata
  autoSaveCount: number
  lastAutoSave: string
  createdAt: string
  updatedAt: string
  __v: number
  metrics: Metrics
}

export interface AssessmentId {
  _id: string
  title: string
  description: string
}

export interface AnnotatorId {
  _id: string
  fullName: string
  email: string
}

export interface Task {
  taskNumber: number
  conversation: Conversation
  timeSpent: number
  isCompleted: boolean
  submittedAt: string
  qaScore: QaScore
  _id: string
}

export interface Conversation {
  originalVideoId: string
  turns: Turn[]
  totalDuration: number
  startingPoint: string
}

export interface Turn {
  turnNumber: number
  userPrompt: string
  aiResponse: AiResponse
  _id: string
  timestamp: string
}

export interface AiResponse {
  videoSegment: VideoSegment
  responseText: string
}

export interface VideoSegment {
  startTime: number
  endTime: number
  segmentUrl: string
  role: string
  content: string
  cloudinaryData: CloudinaryData
  _id: string
}

export interface CloudinaryData {
  resourceType: string
}

export interface QaScore {
  conversationQuality: any
  videoSegmentation: any
  promptRelevance: any
  creativityAndCoherence: any
  technicalExecution: any
  taskTotal: any
  individualFeedback: string
}

export interface TimerState {
  isRunning: boolean
  startTime: string
  pausedTime: number
  totalPausedDuration: number
  lastPauseStart: string
}

export interface SessionMetadata {
  browserInfo: string
  ipAddress: string
  deviceType: string
  screenResolution: string
}

export interface Metrics {
  totalScore: number
  averageScore: number
  completionTime: number
  tasksCompleted: number
  conversationsCreated: number
}
