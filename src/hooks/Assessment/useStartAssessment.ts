import { useState } from 'react';
import { multimediaAssessmentApi } from '../../service/axiosApi';
import { MultimediaAssessmentSubmission } from "../../types/multimedia-assessment.types";

interface StartAssessmentResult {
  success: boolean;
  data?: MultimediaAssessmentSubmission;
  error?: string;
}

export const useStartAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<MultimediaAssessmentSubmission | null>(null);

  const startAssessment = async (assessmentId: string): Promise<StartAssessmentResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.startAssessment(assessmentId);
      
      if (response.data?.success && response.data?.data?.submission) {
        const submissionData = response.data.data.submission;
        setSubmission(submissionData);
        return { success: true, data: submissionData };
      } else {
        const errorMessage = response.data?.message || "Failed to start assessment";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while starting assessment. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSubmission(null);
  };

  return {
    startAssessment,
    loading,
    error,
    submission,
    resetState,
  };
};