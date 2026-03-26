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

const ReviewRatingSchema = z.union([
  z.number(),
  z.object({
    grade: z.string(),
    score: z.number(),
    level: z.string(),
  }),
  z.object({
    grade: z.string(),
    level: z.string(),
  }),
]);

// Assessment review schema
const AssessmentReviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  emailAddress: z.email(),
  dateOfSubmission: z.string(),
  timeOfSubmission: z.string(),
  submissionStatus: SubmissionStatusSchema,
  englishTestScore: z.string(),
  problemSolvingScore: z.string(),
  resume_url: z.string(),
  googleDriveLink: z.url(),
  encounteredIssues: z.string(),
  issueDescription: z.string().nullable(),
  instructionClarityRating: z.number(),
  reviewerComment: z.string().nullable(),
  reviewStatus: z.enum(["Pending", "Reviewed", "Rejected"]).or(z.string()),
  reviewRating: ReviewRatingSchema.nullable(),
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
    reviewerComment: z
      .string()
      .max(1000, "Comment too long"),
    reviewStatus: z.string().min(1, "Review status is required"),
    reviewRating: z.object({
      grade: z.string().min(1, "Grade is required"),
      level: z.string().min(1, "Level is required"),
    }),
    englishTestScore: z.number().min(0, "English test score must be at least 0"),
    problemSolvingScore: z.number().min(0, "Problem solving score must be at least 0"),
});

type GetSubmissionsResponseSchema = z.infer<typeof GetSubmissionsResponseSchema>;
type SubmitReviewSchema = z.infer<typeof SubmitReviewSchema>;

export {
    GetSubmissionsResponseSchema,
    SubmitReviewSchema,
}