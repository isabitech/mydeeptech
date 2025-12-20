import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, getErrorMessage } from '../../../service/apiUtils';
import { 
  QASubmissionsResponse,
  MultimediaAssessmentSubmission,
  QAReview,
  QATaskScore,
  HookOperationResult
} from '../../../types/multimedia-assessment.types';

export const useQAReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get submissions pending QA review
  const getPendingSubmissions = useCallback(async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      projectId?: string;
      submittedAfter?: string;
      submittedBefore?: string;
    }
  ): Promise<HookOperationResult<QASubmissionsResponse['data']>> => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { page, limit, status: 'under_review' };
      if (filters?.projectId) params.projectId = filters.projectId;
      if (filters?.submittedAfter) params.submittedAfter = filters.submittedAfter;
      if (filters?.submittedBefore) params.submittedBefore = filters.submittedBefore;

      const response = await apiGet('/qa/multimedia-assessments', { params });
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to fetch submissions';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get detailed submission for review
  const getSubmissionDetails = useCallback(async (
    submissionId: string
  ): Promise<HookOperationResult<MultimediaAssessmentSubmission>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(`/qa/multimedia-assessments/${submissionId}`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to fetch submission details';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit QA review
  const submitQAReview = useCallback(async (
    submissionId: string,
    reviewData: {
      taskScores: QATaskScore[];
      overallScore: number;
      feedback: string;
      decision: 'approved' | 'rejected';
      detailedComments: string;
    }
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost(`/qa/multimedia-assessments/${submissionId}/review`, reviewData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to submit review';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Save review progress (draft)
  const saveReviewProgress = useCallback(async (
    submissionId: string,
    reviewData: Partial<QAReview>
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPatch(`/qa/multimedia-assessments/${submissionId}/review-draft`, reviewData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to save review progress';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get QA statistics
  const getQAStatistics = useCallback(async (
    timeframe?: 'today' | 'week' | 'month'
  ): Promise<HookOperationResult<{
    totalReviews: number;
    pendingReviews: number;
    approvedCount: number;
    rejectedCount: number;
    averageScore: number;
    averageReviewTime: number; // in minutes
  }>> => {
    setLoading(true);
    setError(null);

    try {
      const params = timeframe ? { timeframe } : {};
      const response = await apiGet('/qa/multimedia-assessments/statistics', { params });
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to fetch statistics';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPendingSubmissions,
    getSubmissionDetails,
    submitQAReview,
    saveReviewProgress,
    getQAStatistics
  };
};