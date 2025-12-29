import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface ReviewTaskResult {
  success: boolean;
  data?: {
    taskReview: {
      taskIndex: number;
      score: number;
      feedback: string;
      qualityRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
      reviewedAt: string;
    };
    totalTasksReviewed: number;
  };
  error?: string;
}

export const useReviewTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewTask = async (reviewData: {
    submissionId: string;
    taskIndex: number;
    score: number;
    feedback?: string;
    qualityRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    notes?: string;
  }): Promise<ReviewTaskResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.reviewTask(reviewData);
      
      if (response?.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.data?.message || "Failed to submit task review";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while reviewing task. Please try again.";
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
    reviewTask,
    loading,
    error,
    resetState,
  };
};