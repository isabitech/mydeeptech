// Multimedia Assessment System Types
export interface VideoReel {
  _id: string;
  title: string;
  description: string;
  videoUrl: string; // Will be YouTube embed URL format
  youtubeUrl?: string; // Original YouTube URL
  youtubeVideoId?: string; // Extracted video ID
  thumbnailUrl: string;
  highResThumbnailUrl?: string; // maxresdefault.jpg version
  niche: string;
  duration: number; // in seconds
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  metadata?: {
    viewCount?: number;
    likeCount?: number;
    publishedAt?: string;
    channelTitle?: string;
    tags?: string[];
    resolution?: string;
    fileSize?: number;
    format?: string;
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
  contentWarnings?: string[]; // New field for content warnings
  metrics?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  };
  usageCount?: number; // How many times used in assessments
  uploadedAt?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  isApproved?: boolean; // New approval field
  qualityScore?: number;
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

// New API Request/Response Types based on updated documentation

// Video Reel Management
export interface AddVideoReelRequest {
  youtubeUrl: string; // YouTube embed URL (preferred) or any supported format
  title?: string; // Auto-extracted if not provided
  description?: string; // Auto-extracted if not provided
  niche: string; // Required
  tags?: string[];
  contentWarnings?: string[];
}

export interface BulkAddVideoReelsRequest {
  youtubeUrls: string[];
  defaultNiche: string;
  defaultTags?: string[];
}

export interface BulkAddVideoReelsResponse {
  success: boolean;
  message: string;
  data: {
    successful: Array<{
      id: string;
      title: string;
      niche: string;
      duration: number;
      youtubeUrl: string;
    }>;
    failed: Array<{
      url: string;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

// Assessment Configuration
export interface AssessmentConfig {
  id: string;
  title: string;
  description: string;
  projectId: string;
  numberOfTasks: number;
  estimatedDuration: number;
  timeLimit: number;
  requirements: {
    allowPausing: boolean;
    requireAllTasks: boolean;
    randomizeReels: boolean;
  };
  scoringWeights: {
    conversationQuality: number;
    creativityAndEngagement: number;
    technicalAccuracy: number;
    timeManagement: number;
  };
  passingScore: number;
  maxRetries: number;
  retakeCooldownHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// QA Review Types
export interface QAReviewTaskData {
  submissionId: string;
  taskIndex: number;
  score: number;
  feedback: string;
  qualityRating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
  notes?: string;
}

export interface FinalReviewData {
  submissionId: string;
  overallScore: number;
  overallFeedback: string;
  decision: 'Approve' | 'Reject' | 'Request Revision';
  privateNotes?: string;
}

// Analytics Types
export interface AssessmentAnalytics {
  overview: {
    totalSubmissions: number;
    completedSubmissions: number;
    pendingReviews: number;
    totalReviews: number;
    totalUsers: number;
    totalReels: number;
    completionRate: number;
    avgReviewTimeHours: number;
  };
  trends: any[];
  assessmentPerformance: any[];
  qaPerformance: any[];
}

// Error Response Types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  errors?: string[];
}

// YouTube-specific error codes from API documentation
export type YouTubeErrorCode = 
  | 'INVALID_YOUTUBE_URL'
  | 'YOUTUBE_VIDEO_NOT_FOUND'
  | 'DUPLICATE_YOUTUBE_URL'
  | 'YOUTUBE_API_ERROR'
  | 'YOUTUBE_API_QUOTA_EXCEEDED';