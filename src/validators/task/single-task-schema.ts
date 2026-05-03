import { z } from "zod";


const userSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  id: z.string(),
});

const TaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string(),
  category: z.string(),
  createdBy: z.string(),
  payRate: z.number(),
  currency: z.string(),
  dueDate: z.string(), // ISO string
  description: z.string(),
});

const TaskAssignmentSchema = z.object({
  _id: z.string(),
  task: TaskSchema,
  assignedTo: userSchema,
  assignedBy: userSchema,
  status: z.enum([
    "Pending",
    "In Progress",
    "Submitted",
    "Approved",
    "Rejected",
  ]),
  dueDate: z.string(),
  __v: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


 const GetSingleTaskResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: TaskAssignmentSchema,
});

type GetSingleTaskResponseSchema = z.infer<typeof GetSingleTaskResponseSchema>;
type TaskAssignmentSchema = z.infer<typeof TaskAssignmentSchema>;
type TaskSchema = z.infer<typeof TaskSchema>;

export {
    GetSingleTaskResponseSchema,
    TaskAssignmentSchema,
    TaskSchema
}