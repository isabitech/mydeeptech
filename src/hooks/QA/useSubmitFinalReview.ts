import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface SubmitFinalReviewResult {
  success: boolean;
  data?: {
    decision: 'Approve' | 'Reject' | 'Request Revision';
    overallScore: number;
    submissionStatus: string;
    userStatus: string;
    emailSent: boolean;
  };
  error?: string;
}

export const useSubmitFinalReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFinalReview = async (reviewData: {
    submissionId: string;
    overallScore: number;
    overallFeedback: string;
    decision: 'Approve' | 'Reject' | 'Request Revision';
    privateNotes?: string;
  }): Promise<SubmitFinalReviewResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.submitFinalReview(reviewData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || "Failed to submit final review";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while submitting review. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    submitFinalReview,
    loading,
    error,
    resetState,
  };
};