import { z } from "zod";

// Created By Schema
const CreatedBySchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.email(),
  id: z.string(),
});

// Image Requirement Schema
const ImageRequirementSchema = z.object({
  _id: z.string(),
  label: z.string(),
  requiredCount: z.number(),
});

// Submission Stats Schema
const SubmissionStatsSchema = z.object({
  total: z.number(),
  in_progress: z.number(),
  completed: z.number(),
  under_review: z.number(),
  approved: z.number(),
  rejected: z.number(),
});

const TaskStatus =  z.union([
  z.enum([
    "pending",
    "draft",
    "ongoing",
    "processing",
    "active",
    "paused",
    "completed",
    "cancelled"
  ]),
//   z.string()
]);

// Task Schema
const TaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string(),
  status: TaskStatus,
  category: z.string(),
  createdBy: CreatedBySchema,
  payRate: z.number(),
  currency: z.string(),
  instructions: z.string().optional(),
  quality_guidelines: z.string().optional(),
  maxParticipants: z.number(),
  dueDate: z.string(),
  totalImagesRequired: z.number(),
  isActive: z.boolean(),
  imageRequirements: z.array(ImageRequirementSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  description: z.string(),
  submissionStats: SubmissionStatsSchema,
});

// Pagination Schema
const PaginationSchema = z.object({
  current_page: z.number(),
  per_page: z.number(),
  total_items: z.number(),
  total_pages: z.number(),
});

// Main Response Schema
 const MicroTasksResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    tasks: z.array(TaskSchema),
    pagination: PaginationSchema,
  }),
});

// Optional: Type inference
type MicroTasksResponseSchema = z.infer<typeof MicroTasksResponseSchema>;
type TaskSchema = z.infer<typeof TaskSchema>;

export {
    MicroTasksResponseSchema,
    TaskSchema
}