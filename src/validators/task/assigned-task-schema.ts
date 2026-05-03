import { z } from "zod";


const UserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  id: z.string(),
});

const TaskLiteSchema = z.object({
  _id: z.string(),
  taskTitle: z.string(),
  createdBy: UserSchema,
});

const StatusEnum = z.enum([
  "Pending",
  "In Progress",
  "Submitted",
  "Approved",
  "Rejected",
]);

const TaskAssignmentSchema = z.object({
  _id: z.string(),

  task: TaskLiteSchema,

  assignedTo: UserSchema,

  assignedBy: UserSchema,

  status: StatusEnum,

  dueDate: z.string().datetime(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  __v: z.number(),
});

const PaginationSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

const GetTaskAssignmentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(TaskAssignmentSchema),
  pagination: PaginationSchema,
});

type TaskAssignmentSchema = z.infer<typeof TaskAssignmentSchema>;
type GetTaskAssignmentsResponseSchema = z.infer<typeof GetTaskAssignmentsResponseSchema>;
type TaskUserSchema = z.infer<typeof UserSchema>;

export {
  TaskAssignmentSchema,
  GetTaskAssignmentsResponseSchema,
  type TaskUserSchema,
}