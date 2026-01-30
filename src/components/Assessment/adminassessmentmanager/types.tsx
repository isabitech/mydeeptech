export interface Project {
  id: string;
  name: string;
  status: string;
}

export interface RetakePolicy {
  allowed: boolean;
  maxAttempts: number;
  cooldownHours: number;
}

export interface AssessmentRequirements {
  retakePolicy: RetakePolicy;
  tasksPerAssessment: number;
  timeLimit: number;
  allowPausing: boolean;
}

export interface AssessmentStatistics {
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageTimeSpent: number;
  passRate: number;
}

export interface CreatedBy {
  _id: string;
  fullName: string;
  email: string;
}

export interface AssessmentConfig {
  id: string;
  title: string;
  description: string;
  project: Project;
  requirements: AssessmentRequirements;
  totalConfiguredReels: number;
  completionRate: number;
  statistics: AssessmentStatistics;
  isActive: boolean;
  createdBy: CreatedBy;
  createdAt: string;
}

export interface VideoReel {
  _id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  niche: string;
  duration: number;
  usageCount: number;
  isActive: boolean;
  qualityScore: number;
  tags?: string[];
}
