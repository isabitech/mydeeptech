import { z } from "zod";


const UploadProgressSchema = z.object({
  Front: z.number(),
  Right: z.number(),
  Left: z.number(),
  Bottom: z.number(),
  total: z.number()
});


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


const UserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.email(),
  id: z.string()
});


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
 * 4. Task Schema
 */
const TaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string(),
  description: z.string(),
  category: z.string(), // can be enum if controlled
  payRate: z.number(),
  currency: z.string(),
  totalImagesRequired: z.number()
});


const MicroTaskSchema = z.object({
  uploadProgress: UploadProgressSchema,
  _id: z.string(),
  assignment: z.string(),
  applicant: UserSchema,
  images: z.array(ImageSchema),
  isComplete: z.boolean(),
  task: TaskSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  __v: z.number()
});

/**
 * 6. Final API Response Schema
 */
const GetMicroTaskResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: MicroTaskSchema
});

/**
 * 7. Types (auto inferred)
 */
type MicroTaskSchema = z.infer<typeof MicroTaskSchema>;
type GetMicroTaskResponseSchema = z.infer<typeof GetMicroTaskResponseSchema>;


export {
    GetMicroTaskResponseSchema,
    MicroTaskSchema
}