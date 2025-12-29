import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";
import { MultimediaAssessmentSubmission } from "../../types/multimedia-assessment.types";

interface GetSessionResult {
  success: boolean;
  data?: MultimediaAssessmentSubmission;
  error?: string;
}

export const useGetAssessmentSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<MultimediaAssessmentSubmission | null>(null);

  const getSession = async (submissionId: string): Promise<GetSessionResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.getAssessmentSession(submissionId);
      
      if (response.data?.success && response.data?.data?.submission) {
        const sessionData = response.data.data.submission;
        setSession(sessionData);
        return { success: true, data: sessionData };
      } else {
        const errorMessage = response.data?.message || "Failed to fetch assessment session";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching session. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSession(null);
  };

  return {
    getSession,
    loading,
    error,
    session,
    resetState,
  };
};