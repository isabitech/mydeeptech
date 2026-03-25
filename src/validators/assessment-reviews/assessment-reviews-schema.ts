import { z } from "zod";


const Timestamps = {
  createdAt: z.string(),
  updatedAt: z.string(),
};

const MongoMeta = {
  __v: z.number().optional(),
//   deleted_at: z.string().nullable(),
};

// Submission status schema
const SubmissionStatusSchema = z.object({
  englishTestUploaded: z.boolean(),
  problemSolvingTestUploaded: z.boolean(),
});

// Assessment review schema
const AssessmentReviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  emailAddress: z.email(),
  dateOfSubmission: z.string(),
  timeOfSubmission: z.string(), // e.g. "09:30 AM"
  submissionStatus: SubmissionStatusSchema,
  englishTestScore: z.string(), // kept as string since API returns "82"
  problemSolvingScore: z.string(),
  googleDriveLink: z.url(),
  encounteredIssues: z.string(),
  issueDescription: z.string().nullable(),
  instructionClarityRating: z.number(),
  reviewerComment: z.string().nullable(), // Changed from reviewerComments to reviewerComment
  reviewStatus: z.enum(["Pending", "Reviewed", "Rejected"]).or(z.string()),
  reviewRating: z.number().nullable(),
  reviewerId: z.string().nullable(),
  ...Timestamps,
  ...MongoMeta,
});

// Data wrapper schema
const DataSchema = z.object({
  assessmentReviews: z.array(AssessmentReviewSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Final response schema
const GetSubmissionsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: DataSchema,
});

const SubmitReviewSchema = z.object({
  assessmentId: z.string().min(1, "Assessment ID is required"),
  reviewStatus: z.string().min(1, "Review status is required"),
  reviewRating: z.coerce.number().min(1, "Rating must be at least 1").max(10, "Rating cannot exceed 10"),
  reviewerComment: z.string().max(1000, "Comment too long").optional(),
});

type GetSubmissionsResponseSchema = z.infer<typeof GetSubmissionsResponseSchema>;
type SubmitReviewSchema = z.infer<typeof SubmitReviewSchema>;

export {
    GetSubmissionsResponseSchema,
    SubmitReviewSchema,
}