import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface SaveProgressResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useSaveTaskProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProgress = async (
    submissionId: string, 
    taskData: {
      taskNumber: number;
      conversation: {
        originalVideoId: string;
        startingPoint: 'video' | 'prompt';
        turns: Array<{
          turnNumber: number;
          userPrompt: string;
          aiResponse: {
            responseText: string;
            videoSegment: {
              startTime: number;
              endTime: number;
              segmentUrl: string;
              content: string;
              role?: 'ai_response';
            };
          };
        }>;
      };
    }
  ): Promise<SaveProgressResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.saveTaskProgress(submissionId, taskData);
      
      if (response?.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.data?.message || "Failed to save progress";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while saving progress. Please try again.";
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
    saveProgress,
    loading,
    error,
    resetState,
  };
};