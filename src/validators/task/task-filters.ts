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
  "cancelled"
]);

/**
 * 2. Nested Schemas
 */

// Task داخل application
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
  id: z.string()
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