// Multimedia Assessment System Types
export interface VideoReel {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  niche: string;
  duration: number; // in seconds
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  metadata?: {
    resolution: string;
    fileSize: number;
    format: string;
  };
  uploadedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  creatorInfo?: {
    username: string;
    displayName: string;
    avatarUrl: string;
    followerCount: number;
    isVerified: boolean;
  };
  tags?: string[];
  metrics?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  };
  uploadedAt?: string;
  isAvailable?: boolean;
  qualityScore?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoSegment {
  startTime: number; // in seconds
  endTime: number; // in seconds
  segmentUrl?: string; // generated after cutting
  role: 'user_prompt' | 'ai_response';
  content: string; // the text content for this segment
}

export interface ConversationTurn {
  turnNumber: number;
  userPrompt: string;
  aiResponse: {
    videoSegment: VideoSegment;
    responseText: string;
  };
  timestamp: string;
}

export interface MultimediaConversation {
  _id?: string;
  originalVideoId: string;
  originalVideo: VideoReel;
  turns: ConversationTurn[];
  totalDuration: number;
  startingPoint: 'video' | 'prompt';
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentTask {
  _id?: string;
  taskNumber: number; // 1-5
  conversation: MultimediaConversation;
  timeSpent: number; // in seconds
  isCompleted: boolean;
  submittedAt?: string;
}

export interface MultimediaAssessmentSubmission {
  _id?: string;
  assessmentId: string;
  annotatorId: string;
  projectId: string;
  tasks: AssessmentTask[];
  totalTimeSpent: number;
  timerState: {
    isRunning: boolean;
    startTime?: string;
    pausedTime?: number;
    totalPausedDuration: number;
  };
  status: 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: string;
  qaReview?: QAReview;
}

export interface QAReview {
  _id?: string;
  submissionId: string;
  reviewerId: string;
  reviewer: {
    _id: string;
    fullName: string;
    email: string;
  };
  taskScores: QATaskScore[];
  overallScore: number; // 0-100
  feedback: string;
  decision: 'approved' | 'rejected';
  detailedComments: string;
  reviewedAt: string;
}

export interface QATaskScore {
  taskNumber: number;
  scores: {
    conversationQuality: number; // 0-20
    videoSegmentation: number; // 0-20  
    promptRelevance: number; // 0-20
    creativityAndCoherence: number; // 0-20
    technicalExecution: number; // 0-20
  };
  individualFeedback: string;
  totalScore: number; // 0-100
}

export interface MultimediaAssessmentConfig {
  _id?: string;
  projectId: string;
  title: string;
  description: string;
  instructions: string;
  requirements: {
    tasksPerAssessment: number; // default 5
    timeLimit: number; // in minutes, default 60
    allowPausing: boolean;
    retakePolicy: {
      allowed: boolean;
      cooldownHours: number; // default 24
      maxAttempts: number;
    };
  };
  videoReels: {
    totalAvailable: number;
    reelsPerNiche: { [niche: string]: number };
    randomizationEnabled: boolean;
  };
  scoring: {
    passingScore: number; // default 70
    qaRequired: boolean;
    autoApprovalThreshold?: number;
  };
  isActive: boolean;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VideoNiche {
  name: string;
  description: string;
  color: string; // for UI theming
  iconName: string;
  isActive: boolean;
}

// Enhanced User Status Types
export interface EnhancedUserInfo {
  annotatorStatus: 'pending' | 'approved' | 'rejected';
  microTaskerStatus: 'pending' | 'approved' | 'rejected';
  qaStatus: 'pending' | 'approved' | 'rejected'; // New QA status
  multimediaAssessmentStatus?: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'passed' | 'failed';
}

// API Response Types
export interface VideoReelsResponse {
  success: boolean;
  message: string;
  data: {
    reels: VideoReel[];
    niches: VideoNiche[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReels: number;
      reelsPerPage: number;
    };
  };
}

export interface AssessmentSessionResponse {
  success: boolean;
  message: string;
  data: {
    session: MultimediaAssessmentSubmission;
    availableReels: VideoReel[];
    config: MultimediaAssessmentConfig;
  };
}

export interface QASubmissionsResponse {
  success: boolean;
  message: string;
  data: {
    submissions: MultimediaAssessmentSubmission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSubmissions: number;
      submissionsPerPage: number;
    };
    statistics: {
      pendingReviews: number;
      approvedToday: number;
      rejectedToday: number;
      averageScore: number;
    };
  };
}

// Hook Operation Results
export interface HookOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Video Editor Types
export interface VideoEditAction {
  type: 'cut' | 'trim' | 'segment';
  startTime: number;
  endTime: number;
  label?: string;
}

export interface VideoEditorState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  segments: VideoSegment[];
  selectedSegment?: VideoSegment;
  editActions: VideoEditAction[];
}

export type MultimediaAssessmentStep = 
  | 'instructions'
  | 'reel_selection'
  | 'conversation_building'
  | 'task_submission'
  | 'assessment_complete';

export type QAReviewStep = 
  | 'submission_overview'
  | 'task_review'
  | 'scoring'
  | 'final_decision';