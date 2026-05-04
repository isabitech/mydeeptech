import { z } from "zod";


const UploadProgressSchema = z.object({
  Front: z.number(),
  Right: z.number(),
  Left: z.number(),
  Bottom: z.number(),
  total: z.number()
});


const UserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.email(),
  id: z.string()
});


const ImageSchema = z.object({
  url: z.string().url(),
  label: z.enum(["Front", "Right", "Left", "Bottom"]),
  publicId: z.string(),
  _id: z.string(),
  uploadedAt: z.string()
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