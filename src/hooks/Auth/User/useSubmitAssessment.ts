import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiPost, getErrorMessage } from "../../../service/apiUtils";

export interface SubmitAssessmentForm {
  screenshots?: File[];
  folderLink?: string;
  testType: string;
  [key: string]: any;
}

export interface SubmitAssessmentResponse {
  success: boolean;
  message: string;
  data?: {
    submissionId: string;
    submittedAt: string;
  };
}

export interface SubmitAssessmentReviewPayload {
  fullName: string;
  emailAddress: string;
  dateOfSubmission: string;
  timeOfSubmission: string;
  submissionStatus: {
    englishTestUploaded: boolean;
    problemSolvingTestUploaded: boolean;
  };
  englishTestScore: string;
  problemSolvingScore: string;
  googleDriveLink: string;
  encounteredIssues?: "Yes, I encountered issues." | "No, the process was smooth.";
  issueDescription?: string;
  instructionClarityRating?: number;
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
    payload: SubmitAssessmentForm
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    const { screenshots = [], ...rest } = payload;

    try {
      // Validate file sizes (max 1MB each) if screenshots are provided
      if (screenshots.length > 0) {
        const maxSize = 1024 * 1024; // 1MB in bytes
        const oversizedFiles = screenshots.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
          const errorMessage = `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 1MB per file.`;
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      }

      // Create FormData to send files and data
      const formData = new FormData();
      
      // Add each screenshot to FormData
      screenshots.forEach((file) => {
        formData.append('screenshots', file);
      });
      
      // Add all other fields to FormData
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

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

  const submitAssessmentReview = useCallback(async (
    payload: SubmitAssessmentReviewPayload
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await apiPost(
        endpoints.assessments.assessmentReview,
        payload
      );

      // Check for success in various formats the backend might use
      if (data.success || data.statusCode === 201 || data.statusCode === 200) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to submit assessment review";
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
    submitAssessmentReview,
    loading,
    error,
    resetState,
  };
};