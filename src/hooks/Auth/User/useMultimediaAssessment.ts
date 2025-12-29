import { useState, useCallback } from 'react';
import { multimediaAssessmentApi } from '../../../service/axiosApi';
import { apiGet, apiPatch, apiPost, getErrorMessage } from '../../../service/apiUtils';
import { 
  VideoReelsResponse,
  AssessmentSessionResponse,
  MultimediaAssessmentSubmission,
  MultimediaAssessmentConfig,
  AssessmentTask,
  HookOperationResult,
  AddVideoReelRequest,
  BulkAddVideoReelsRequest,
  AssessmentConfig,
  QAReviewTaskData,
  FinalReviewData,
  ApiError,
  YouTubeErrorCode
} from '../../../types/multimedia-assessment.types';

export const useMultimediaAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available video reels for assessment
  const getVideoReels = useCallback(async (
    niche?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<HookOperationResult<VideoReelsResponse['data']>> => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { page, limit };
      if (niche) params.niche = niche;

      const response = await multimediaAssessmentApi.getAllVideoReels(params);
      
      if (response.data?.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      } else {
        const errorMessage = response.data?.message || 'Failed to fetch video reels';
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

  // Start a new multimedia assessment session
  const startAssessmentSession = useCallback(async (
    projectId: string
  ): Promise<HookOperationResult<AssessmentSessionResponse['data']>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost('/assessments/multimedia/start', { projectId });
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data 
        };
      } else {
        const errorMessage = response.message || 'Failed to start assessment session';
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

  // Save assessment progress
  const saveAssessmentProgress = useCallback(async (
    submissionId: string,
    taskData: Partial<AssessmentTask>
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPatch(`/assessments/multimedia/${submissionId}/progress`, taskData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to save progress';
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

  // Submit a completed task
  const submitTask = useCallback(async (
    submissionId: string,
    taskNumber: number,
    taskData: AssessmentTask
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost(`/assessments/multimedia/${submissionId}/tasks/${taskNumber}/submit`, taskData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to submit task';
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

  // Submit final assessment
  const submitFinalAssessment = useCallback(async (
    submissionId: string
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost(`/assessments/multimedia/${submissionId}/submit`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to submit assessment';
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

  // Control assessment timer
  const controlTimer = useCallback(async (
    submissionId: string,
    action: 'start' | 'pause' | 'resume'
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost(`/assessments/multimedia/${submissionId}/timer`, { action });
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || `Failed to ${action} timer`;
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

  // Get current assessment session
  const getCurrentSession = useCallback(async (
    submissionId?: string
  ): Promise<HookOperationResult<MultimediaAssessmentSubmission>> => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = submissionId 
        ? `/assessments/multimedia/${submissionId}` 
        : '/assessments/multimedia/current';
      
      const response = await apiGet(endpoint);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to get current session';
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

  // Admin Functions - Video Reel Management
  const addVideoReel = useCallback(async (reelData: AddVideoReelRequest): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.addVideoReel(reelData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || 'Failed to add video reel';
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

  const bulkAddVideoReels = useCallback(async (bulkData: BulkAddVideoReelsRequest): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.bulkAddVideoReels(bulkData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || 'Failed to bulk add video reels';
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

  // QA Review Functions
  const getPendingSubmissions = useCallback(async (params?: any): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.getPendingSubmissions(params);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || 'Failed to get pending submissions';
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

  const reviewTask = useCallback(async (reviewData: any): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.reviewTask(reviewData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || 'Failed to review task';
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

  const submitFinalReview = useCallback(async (reviewData: FinalReviewData): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.submitFinalReview(reviewData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || 'Failed to submit final review';
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
    // Assessment Functions
    getVideoReels,
    startAssessmentSession,
    saveAssessmentProgress,
    submitTask,
    submitFinalAssessment,
    controlTimer,
    getCurrentSession,
    // Admin Functions
    addVideoReel,
    bulkAddVideoReels,
    // QA Functions
    getPendingSubmissions,
    reviewTask,
    submitFinalReview
  };
};