import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const submitResultsMutation = useMutation({
    mutationFn: async (payload: SubmitAssessmentForm): Promise<any> => {
      const { screenshots = [], ...rest } = payload;

      // Validate file sizes (max 1MB each) if screenshots are provided
      if (screenshots.length > 0) {
        const maxSize = 1024 * 1024; // 1MB in bytes
        const oversizedFiles = screenshots.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
          throw new Error(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 1MB per file.`);
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

      if (!data.success) {
        throw new Error(data.message || "Failed to submit assessment results");
      }

      return data.data;
    },
    onSuccess: () => {
      // Potentially invalidate queries here if needed
      // queryClient.invalidateQueries({ queryKey: [...] });
    }
  });

  const submitReviewMutation = useMutation({
    mutationKey: ["submitAssessmentReview"],
    mutationFn: async (payload: SubmitAssessmentReviewPayload): Promise<any> => {
      const data: any = await apiPost(endpoints.assessments.assessmentReview, payload);
      return data.data;
    }
  });

  const submitAssessmentResults = useCallback(async (
    payload: SubmitAssessmentForm
  ): Promise<HookOperationResult> => {
    try {
      const data = await submitResultsMutation.mutateAsync(payload);
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return { success: false, error: errorMessage };
    }
  }, [submitResultsMutation]);

  const submitAssessmentReview = useCallback(async (
    payload: SubmitAssessmentReviewPayload
  ): Promise<HookOperationResult> => {
    try {
      const data = await submitReviewMutation.mutateAsync(payload);
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return { success: false, error: errorMessage };
    }
  }, [submitReviewMutation]);

  const resetState = useCallback(() => {
    submitResultsMutation.reset();
    submitReviewMutation.reset();
  }, [submitResultsMutation, submitReviewMutation]);

  const loading = submitResultsMutation.isPending || submitReviewMutation.isPending;
  
  const error = useMemo(() => {
    const resError = submitResultsMutation.error ? getErrorMessage(submitResultsMutation.error) : null;
    const revError = submitReviewMutation.error ? getErrorMessage(submitReviewMutation.error) : null;
    return resError || revError;
  }, [submitResultsMutation.error, submitReviewMutation.error]);

  return {
    submitAssessmentResults,
    submitAssessmentReview,
    loading,
    error,
    resetState,
    // Expose mutations for advanced usage
    resultsMutation: submitResultsMutation,
    reviewMutation: submitReviewMutation,
  };
};