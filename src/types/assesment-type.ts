export interface AssessmentTypeResponse {
  success: boolean
  message: string
  data: AssessmentTypeResponseData
}

export interface AssessmentTypeResponseData {
  questions: Question[]
  assessmentInfo: AssessmentInfo
}

export interface Question {
  id: number
  section: string
  question: string
  options: string[]
  points: number
}

export interface AssessmentInfo {
  totalQuestions: number
  questionsPerSection: number
  sections: string[]
  passingScore: number
  timeLimit: number
  assessmentType: string
  instructions: string
}
