import { z } from "zod";

/**
 * 1. Enums
 */
const TaskStatusSchema = z.enum([
   "pending",
  "ongoing",
  "processing",
  "active",
  "paused",
  "completed",
  "cancelled",
  "approved",
  "rejected"
]);

/**
 * 2. Nested Schemas
 */

// Task application
const TaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string(),
  category: z.string() // change to enum if controlled
});

// Applicant
const ApplicantSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  id: z.string(),
  phone: z.string(),
});

const MetadataSchema = z.object({
  angle: z.string().nullable().optional(),
  taskCategory: z.string().nullable().optional(),
  imageSequence: z.number().nullable().optional(),
  uploadTimestamp: z.date().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  resolution: z.object({
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
  }).nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  publicId: z.string().nullable().optional(),
}).optional();

// Image
const ImageSchema = z.object({
  _id: z.string(),
  url: z.string().url(),
  publicId: z.string(),
  status: z.string(),
  label: z.string(), // Backend stores "View 1", "View 2", "View 3", "View 4"
  metadata: MetadataSchema,
  reviewedBy: ApplicantSchema,
  rejectionMessage: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * 3. Main Task Application Schema
 */
const TaskApplicationSchema = z.object({
  _id: z.string(),
  task: TaskSchema,
  applicant: ApplicantSchema,
  assignedBy: z.any().nullable(), // refine later if needed
  status: TaskStatusSchema,
  images: z.array(ImageSchema),
  dueDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  __v: z.number()
});

/**
 * 4. Pagination Schema
 */
const PaginationSchema = z.object({
  current_page: z.number(),
  per_page: z.number(),
  total_items: z.number(),
  total_pages: z.number()
});

/**
 * 5. Final API Response Schema
 */
const GetTasksFilterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    tasks: z.array(TaskApplicationSchema),
    pagination: PaginationSchema
  })
});

/**
 * 6. TypeScript Types (auto inferred)
 */
type TaskStatusSchema = z.infer<typeof TaskStatusSchema>;
type TaskSchema = z.infer<typeof TaskSchema>;
type ApplicantSchema = z.infer<typeof ApplicantSchema>;
type TaskApplicationSchema = z.infer<typeof TaskApplicationSchema>;
type PaginationSchema = z.infer<typeof PaginationSchema>;
type GetTasksFilterResponseSchema = z.infer<typeof GetTasksFilterResponseSchema>;

export {
TaskStatusSchema,
GetTasksFilterResponseSchema,
TaskApplicationSchema,
PaginationSchema,
TaskSchema,
ApplicantSchema 

}

/**
 * 7. Safe Parser (VERY important in real apps)
 */
export const parseGetTasksResponse = (data: unknown): GetTasksFilterResponseSchema => {
  const result = GetTasksFilterResponseSchema.safeParse(data);
  if (!result.success) {
    console.error("Zod validation error:", result.error.format());
    throw new Error("Invalid API response structure");
  }

  return result.data;
};