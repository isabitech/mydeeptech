import { z } from "zod";


// Upload Progress
const UploadProgressSchema = z.object({
  Front: z.number(),
  Right: z.number(),
  Left: z.number(),
  Bottom: z.number(),
  total: z.number(),
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


const ApplicantSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  id: z.string(),
  phone: z.string(),
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

// Submission Data
const SubmissionStatisticsSchema = z.object({
  _id: z.string(),
  assignment: z.string(),
  submittedBy: z.string(),
  uploadProgress: UploadProgressSchema,
  images: z.array(ImageSchema),
  isComplete: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});


const GetSubmissionStatisticsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: SubmissionStatisticsSchema,
});


type GetSubmissionStatisticsResponseSchema = z.infer<typeof GetSubmissionStatisticsResponseSchema>;
type SubmissionStatisticsSchema = z.infer<typeof SubmissionStatisticsSchema>;
type UploadProgressSchema = z.infer<typeof UploadProgressSchema>;
type ImageSchema = z.infer<typeof ImageSchema>;   

export {
    GetSubmissionStatisticsResponseSchema,
    SubmissionStatisticsSchema,
    UploadProgressSchema,
    ImageSchema,
}