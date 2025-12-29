import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";
import { QAReviewMultimediaResponseType, Submission } from "../../components/Assessment/QAReviews/qa-review-multimedia-response-type";

interface QAReview {
  overallScore: number;
  overallFeedback: string;
  decision: 'Approve' | 'Reject' | 'Request Revision';
  privateNotes: string;
  reviewedAt: string;
}

export const useGetSubmissionDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionDetails, setSubmissionDetails] = useState<Submission | null>(null);
  const [qaReview, setQaReview] = useState<QAReview | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);

  const getSubmissionDetails = async (submissionId: string): Promise<QAReviewMultimediaResponseType> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.getSubmissionForReview(submissionId);

      console.log("API response", response);
      
      if (response?.data?.success && response.data?.data) {
        const { submission, qaReview: reviewData, isReviewed: reviewStatus } = response.data.data;
        
        // Set the actual submission data from the API response
        setSubmissionDetails(submission);
        console.log("Setting submission details", submission);
        setQaReview(reviewData);
        setIsReviewed(reviewStatus);
        
        // Return the complete API response structure
        return { 
          success: true, 
          data: {
            submission,
            qaReview: reviewData,
            isReviewed: reviewStatus
          }
        };
      } else {
        const errorMessage = response?.data?.message || "Failed to fetch submission details";
        setError(errorMessage);
        return { 
          success: false, 
          data: undefined,
          error: errorMessage 
        } as any;
      }
    } catch (err: any) {
      console.error("API Error:", err);
      const errorMessage = err.message || "An error occurred while fetching submission details. Please try again.";
      setError(errorMessage);
      return { 
        success: false, 
        data: undefined,
        error: errorMessage 
      } as any;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSubmissionDetails(null);
    setQaReview(null);
    setIsReviewed(false);
  };

  return {
    getSubmissionDetails,
    loading,
    error,
    submissionDetails,
    qaReview,
    isReviewed,
    resetState,
  };
};