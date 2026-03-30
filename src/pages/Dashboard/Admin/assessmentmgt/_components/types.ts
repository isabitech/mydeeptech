export interface Assessment {
  _id: string;
  userId: string;
  fullName: string;
  emailAddress: string;
  dateOfSubmission: string;
  timeOfSubmission: string;
  submissionStatus: {
    englishTestUploaded: boolean;
    problemSolvingTestUploaded: boolean;
  };
  englishTestScore: string;
  problemSolvingScore: string;
  googleDriveLink: string;
  encounteredIssues: string;
  issueDescription: string | null;
  instructionClarityRating: number;
  reviewerComment: string | null;
  reviewStatus: string;
  reviewRating: string | number | {
    grade: string;
    score: number;
    level: string;
  } | null;
  reviewerId: string | {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
  resume_url?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}