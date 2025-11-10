import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiPost, getErrorMessage } from "../../../service/apiUtils";

export interface SubmitAssessmentForm {
  screenshots: File[];
  testType: 'e2f'; // Only e2f test now
}

export interface SubmitAssessmentResponse {
  success: boolean;
  message: string;
  data?: {
    submissionId: string;
    submittedAt: string;
    status: string;
  };
}

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useSubmitAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAssessmentResults = useCallback(async (
    screenshots: File[]
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Validate file sizes (max 1MB each)
      const maxSize = 1024 * 1024; // 1MB in bytes
      const oversizedFiles = screenshots.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        const errorMessage = `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 1MB per file.`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Create FormData to send files
      const formData = new FormData();
      
      // Add each screenshot to FormData
      screenshots.forEach((file, index) => {
        formData.append('screenshots', file);
      });
      
      // Add test type
      formData.append('testType', 'e2f');

      const data: SubmitAssessmentResponse = await apiPost(
        endpoints.authDT.submitResult, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to submit assessment results";
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

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    submitAssessmentResults,
    loading,
    error,
    resetState,
  };
};