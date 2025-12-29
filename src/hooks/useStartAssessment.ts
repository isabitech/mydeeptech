import { useState } from 'react';
import { apiPost, getErrorMessage } from '../service/apiUtils';

interface StartAssessmentResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    submissionId: string;
    assessmentId: string;
    sessionId: string;
    timeLimit: number; // in minutes
    startedAt: string;
    expiresAt: string;
    instructions?: string;
    firstTaskId?: string;
  };
}

export const useStartAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a specific assessment
  const startAssessment = async (assessmentId: string): Promise<StartAssessmentResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost(`/api/assessments/start/${assessmentId}`);
      
      if (response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      } else {
        const errorMessage = response.message || 'Failed to start assessment';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset hook state
  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    startAssessment,
    resetState
  };
};