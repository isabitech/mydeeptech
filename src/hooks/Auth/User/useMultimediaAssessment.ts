import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, getErrorMessage } from '../../../service/apiUtils';
import { 
  VideoReelsResponse,
  AssessmentSessionResponse,
  MultimediaAssessmentSubmission,
  MultimediaAssessmentConfig,
  AssessmentTask,
  HookOperationResult
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

      const response = await apiGet('/assessments/multimedia/reels', { params });
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data 
        };
      } else {
        const errorMessage = response.message || 'Failed to fetch video reels';
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

  return {
    loading,
    error,
    getVideoReels,
    startAssessmentSession,
    saveAssessmentProgress,
    submitTask,
    submitFinalAssessment,
    controlTimer,
    getCurrentSession
  };
};