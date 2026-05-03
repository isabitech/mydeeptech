import { z } from "zod";


// Upload Progress
const UploadProgressSchema = z.object({
  Front: z.number(),
  Right: z.number(),
  Left: z.number(),
  Bottom: z.number(),
  total: z.number(),
});

// Image
const ImageSchema = z.object({
  url: z.string().url(),
  label: z.enum(["Front", "Right", "Left", "Bottom"]),
  publicId: z.string(),
  _id: z.string(),
  uploadedAt: z.string(),
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