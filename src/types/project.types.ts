// Project Types
export interface Project {
  _id: string;
  projectName: string;
  projectDescription: string;
  projectCategory: ProjectCategory;
  payRate: number;
  payRateCurrency: Currency;
  payRateType: PayRateType;
  maxAnnotators: number | null;
  deadline: string;
  estimatedDuration: string;
  difficultyLevel: DifficultyLevel;
  requiredSkills: string[];
  minimumExperience: ExperienceLevel;
  languageRequirements: string[];
  tags: string[];
  applicationDeadline: string;
  status: ProjectStatus;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedAdmins: string[];
  totalApplications: number;
  approvedAnnotators: number;
  availableSlots?: number;
  hasApplied?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Application Types
export interface Application {
  _id: string;
  projectId: string | Project;
  applicantId: string | DTUser;
  status: ApplicationStatus;
  coverLetter: string;
  availability: Availability;
  proposedRate?: number;
  estimatedCompletionTime?: string;
  appliedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  workStartedAt?: string;
  reviewNotes?: string;
  rejectionReason?: RejectionReason;
}

// User Types (for project applications)
export interface DTUser {
  _id: string;
  fullName: string;
  email: string;
  skills?: string[];
  domains?: string[];
  annotatorStatus: string;
  microTaskerStatus: string;
  isEmailVerified: boolean;
  hasSetPassword: boolean;
}

// Enums
export type ProjectCategory = 
  | "Text Annotation"
  | "Image Annotation"
  | "Audio Annotation"
  | "Video Annotation"
  | "Data Labeling"
  | "Content Moderation"
  | "Transcription"
  | "Translation"
  | "Sentiment Analysis"
  | "Entity Recognition"
  | "Classification"
  | "Object Detection"
  | "Semantic Segmentation"
  | "Survey Research"
  | "Data Entry"
  | "Quality Assurance"
  | "Other";

export type Currency = "USD" | "EUR" | "GBP" | "NGN" | "KES" | "GHS";

export type PayRateType = "per_task" | "per_hour" | "per_project" | "per_annotation";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type ExperienceLevel = "none" | "beginner" | "intermediate" | "advanced";

export type ProjectStatus = "active" | "completed" | "paused" | "cancelled";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Availability = "full_time" | "part_time" | "flexible";

export type RejectionReason = 
  | "insufficient_experience"
  | "project_full"
  | "qualifications_mismatch"
  | "other";

// API Response Types
export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: {
    projects: Project[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProjects: number;
      projectsPerPage: number;
    };
    summary?: {
      totalProjects: number;
      activeProjects: number;
      completedProjects: number;
      pausedProjects: number;
    };
    userStats?: {
      totalApplications: number;
      activeProjects: number;
      completedProjects: number;
    };
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
    statistics?: {
      totalApplications: number;
      pendingApplications: number;
      approvedApplications: number;
      availableSlots: number;
    };
  };
}

export interface ApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: Application[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalApplications: number;
      applicationsPerPage: number;
    };
    summary: {
      statusBreakdown: {
        pending: number;
        approved: number;
        rejected: number;
      };
      totalApplications: number;
    };
  };
}

export interface ApplicationResponse {
  success: boolean;
  message: string;
  data: {
    application?: Application;
    applicationId?: string;
    applicantName?: string;
    projectName?: string;
    rejectionReason?: string;
    emailNotificationSent?: boolean;
  };
}

export interface ActiveProjectsResponse {
  success: boolean;
  message: string;
  data: {
    activeProjects: Application[];
    pendingApplications: Application[];
    statistics: {
      totalApplications: number;
      activeProjects: number;
      pendingApplicationions: number;
      rejectedApplications: number;
      completedProjects: number;
    };
  };
}

// Form Types
export interface CreateProjectForm {
  projectName: string;
  projectDescription: string;
  projectCategory: ProjectCategory;
  payRate: number;
  payRateCurrency: Currency;
  payRateType: PayRateType;
  maxAnnotators?: number;
  deadline: string;
  estimatedDuration: string;
  difficultyLevel: DifficultyLevel;
  requiredSkills: string[];
  minimumExperience: ExperienceLevel;
  languageRequirements: string[];
  tags: string[];
  applicationDeadline: string;
}

export interface UpdateProjectForm extends Partial<CreateProjectForm> {
  status?: ProjectStatus;
}

export interface ApplyToProjectForm {
  coverLetter: string;
  availability: Availability;
  proposedRate?: number;
  estimatedCompletionTime?: string;
}

export interface ApproveApplicationForm {
  reviewNotes: string;
}

export interface RejectApplicationForm {
  rejectionReason: RejectionReason;
  reviewNotes: string;
}

// Hook return types
export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}