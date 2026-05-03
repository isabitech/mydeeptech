import { z } from "zod";

const UserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  id: z.string(),
});

const TaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string(),
  createdBy: z.string(),
  dueDate: z.string(),
  description: z.string(),
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

  task: TaskSchema,

  assignedTo: z.string(),

  assignedBy: UserSchema,

  status: StatusEnum,

  dueDate: z.string(),

  createdAt: z.string(),
  updatedAt: z.string(),

});

const PaginationSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

const GetMyAssignedTasksResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(TaskAssignmentSchema),
  pagination: PaginationSchema,
});

type UserSchema = z.infer<typeof UserSchema>;
type TaskSchema = z.infer<typeof TaskSchema>;
type StatusEnum = z.infer<typeof StatusEnum>;
type TaskAssignmentSchema = z.infer<typeof TaskAssignmentSchema>;
type PaginationSchema = z.infer<typeof PaginationSchema>;
type GetMyAssignedTasksResponseSchema = z.infer<typeof GetMyAssignedTasksResponseSchema>; 

export {
  GetMyAssignedTasksResponseSchema,
  TaskAssignmentSchema,
  TaskSchema,
  UserSchema,
  StatusEnum,
  PaginationSchema,
}