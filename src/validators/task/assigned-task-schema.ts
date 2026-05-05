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

const TaskAssignmentSchema = z.object({
    _id: z.string(),
    task: TaskLiteSchema,
    applicant: ApplicantSchema,
    assignedBy: z.any().nullable(), // refine later if needed
    assignedTo: ApplicantSchema, // refine later if needed
    status: TaskStatusSchema,
    images: z.array(ImageSchema),
    dueDate: z.string().datetime(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    __v: z.number()
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