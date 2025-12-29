import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface TimerControlResult {
  success: boolean;
  data?: {
    timerState: {
      isRunning: boolean;
      totalTimeSpent: number;
      timeRemaining: number;
      lastPausedAt?: string;
    };
  };
  error?: string;
}

export const useTimerControl = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controlTimer = async (
    submissionId: string,
    action: 'start' | 'pause' | 'resume'
  ): Promise<TimerControlResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.controlTimer(submissionId, action);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || `Failed to ${action} timer`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || `An error occurred while ${action}ing timer. Please try again.`;
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
    controlTimer,
    loading,
    error,
    resetState,
  };
};