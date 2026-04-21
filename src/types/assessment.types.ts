export interface AssessmentQuestionDetail {
  questionId: string;
  questionText: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface AssessmentRecord {
  _id: string;
  assessmentType: string;
  scorePercentage: number;
  passed: boolean;
  timeSpentMinutes: number;
  attemptNumber: number;
  createdAt: string;
  questions?: AssessmentQuestionDetail[];
}

export interface AssessmentStatistics {
  _id: string;
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttempt: string;
}

export interface RetakeEligibility {
  canRetake: boolean;
  assessmentType: string;
  nextRetakeTime: string | null;
  latestAttempt?: {
    date: string;
    score: number;
    passed: boolean;
    attemptNumber: number;
  };
  bestScore?: {
    date: string;
    score: number;
    passed: boolean;
  };
}

export interface AssessmentHistoryPagination {
  totalCount: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface AssessmentHistoryData {
  assessments: AssessmentRecord[];
  statistics: AssessmentStatistics[];
  pagination: AssessmentHistoryPagination;
}

export interface AssessmentHistoryResponse {
  success: boolean;
  message: string;
  data: AssessmentHistoryData;
}
