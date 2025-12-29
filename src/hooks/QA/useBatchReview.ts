import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface BatchReviewData {
  submissionIds: string[];
  decision: 'Approve' | 'Reject' | 'Request Revision';
  overallFeedback?: string;
}

interface BatchReviewResult {
  success: boolean;
  data?: {
    processedCount: number;
    successfulReviews: string[];
    failedReviews: string[];
    emailsSent: number;
  };
  error?: string;
}

export const useBatchReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchReview = async (batchData: BatchReviewData): Promise<BatchReviewResult> => {
    setLoading(true);
    setError(null);

    try {
      // Validate batch size (1-50 submissions as per documentation)
      if (batchData.submissionIds.length === 0 || batchData.submissionIds.length > 50) {
        throw new Error("Batch size must be between 1 and 50 submissions");
      }

      const response = await multimediaAssessmentApi.batchReviewSubmissions(batchData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || "Failed to process batch review";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during batch review. Please try again.";
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
    batchReview,
    loading,
    error,
    resetState,
  };
};