import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface SubmitTaskResult {
  success: boolean;
  data?: {
    taskNumber: number;
    score: number;
    isCompleted: boolean;
    submittedAt: string;
    feedback: {
      conversationQuality: string;
      technicalAccuracy: string;
      creativity: string;
    };
  };
  error?: string;
}

export const useSubmitTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTask = async (
    submissionId: string,
    taskData: {
      taskNumber: number;
      conversation: {
        turns: Array<{
          speaker: 'user' | 'assistant';
          message: string;
          timestamp: string;
        }>;
      };
      videoSegments?: Array<{
        startTime: number;
        endTime: number;
        description: string;
      }>;
    }
  ): Promise<SubmitTaskResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.submitTask(submissionId, taskData);
      
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || "Failed to submit task";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while submitting task. Please try again.";
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
    submitTask,
    loading,
    error,
    resetState,
  };
};