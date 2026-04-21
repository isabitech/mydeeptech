import { z } from "zod";

export const AssessmentQuestionDetailSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  userAnswer: z.string(),
  isCorrect: z.boolean(),
});

export const AssessmentRecordSchema = z.object({
  _id: z.string(),
  assessmentType: z.string(),
  scorePercentage: z.number(),
  passed: z.boolean(),
  timeSpentMinutes: z.number(),
  attemptNumber: z.number(),
  createdAt: z.string(),
  questions: z.array(AssessmentQuestionDetailSchema).optional(),
});

export const AssessmentStatisticsSchema = z.object({
  _id: z.string(),
  totalAttempts: z.number(),
  passedAttempts: z.number(),
  averageScore: z.number(),
  bestScore: z.number(),
  lastAttempt: z.string(),
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

export const AssessmentHistoryPaginationSchema = z.object({
  totalCount: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});

export const AssessmentHistoryDataSchema = z.object({
  assessments: z.array(AssessmentRecordSchema),
  statistics: z.array(AssessmentStatisticsSchema),
  pagination: AssessmentHistoryPaginationSchema,
});

export const AssessmentHistoryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: AssessmentHistoryDataSchema,
});
