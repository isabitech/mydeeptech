import { z } from "zod";

export const AssessmentTypeEnum = z.enum(['multimedia', 'english_proficiency', 'general']);
export const AssessmentDifficultyEnum = z.enum(['Beginner', 'Intermediate', 'Advanced']);
export const UserStatusEnum = z.enum(['not_started', 'in_progress', 'completed', 'passed', 'failed']);

export const AssessmentLastAttemptSchema = z.object({
  id: z.string(),
  score: z.number().optional(),
  completedAt: z.string().optional(),
  status: z.string(),
  canRetake: z.boolean(),
});

export const AssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: AssessmentTypeEnum,
  numberOfTasks: z.number(),
  estimatedDuration: z.number(),
  timeLimit: z.number(),
  passingScore: z.number(),
  difficulty: AssessmentDifficultyEnum,
  isActive: z.boolean(),
  userStatus: UserStatusEnum.optional(),
  lastAttempt: AssessmentLastAttemptSchema.optional(),
  maxAttempts: z.number().optional(),
  currentAttempts: z.number().optional(),
  instructions: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
});

export const AvailableAssessmentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.array(AssessmentSchema).optional(),
});

export const StartAssessmentDataSchema = z.object({
  submissionId: z.string(),
  assessmentId: z.string(),
  sessionId: z.string(),
  timeLimit: z.number(),
  startedAt: z.string(),
  expiresAt: z.string(),
  instructions: z.string().optional(),
  firstTaskId: z.string().optional(),
});

export const StartAssessmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: StartAssessmentDataSchema.optional(),
});

export const RetakeEligibilitySchema = z.object({
  canRetake: z.boolean(),
  assessmentType: z.string(),
  nextRetakeTime: z.string().nullable(),
  latestAttempt: z.object({
    date: z.string(),
    score: z.number(),
    passed: z.boolean(),
    attemptNumber: z.number(),
  }).optional(),
  bestScore: z.object({
    date: z.string(),
    score: z.number(),
    passed: z.boolean(),
  }).optional(),
});

export const RetakeEligibilityResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: RetakeEligibilitySchema.optional(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;
export type StartAssessmentData = z.infer<typeof StartAssessmentDataSchema>;
export type RetakeEligibility = z.infer<typeof RetakeEligibilitySchema>;
