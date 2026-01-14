import { useState, useCallback } from "react";
import { apiGet, apiPost, getErrorMessage } from "../../service/apiUtils";

// Interfaces following the API documentation
export interface QuizQuestion {
  questionId: string;
  questionText: string;
  questionType: "multiple_choice";
  options: {
    optionId: string;
    optionText: string;
  }[];
  isCritical: boolean;
  points: number;
}

export interface Stage1Config {
  name: "Guideline Comprehension";
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface Stage2Config {
  name: "Mini Task Validation";
  timeLimit: number;
  referenceFiles: {
    fileName: string;
    fileUrl: string;
    description: string;
  }[];
  requirements: {
    promptMinLength: number;
    promptMaxLength: number;
    domainMinLength: number;
    domainMaxLength: number;
    failureMinLength: number;
    failureMaxLength: number;
    responseMinLength: number;
    responseMaxLength: number;
  };
}

export interface Stage3Config {
  name: "Golden Solution & Rubric";
  timeLimit: number;
  requirements: {
    positiveRubricMinLength: number;
    negativeRubricMinLength: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    minFiles: number;
    maxFiles: number;
  };
}

export interface Stage4Config {
  name: "Integrity Trap";
  timeLimit: number;
  trapInstruction: string;
  expectedBehavior: string;
}

export interface SpideyAssessment {
  id: string;
  type: "spidey_assessment";
  title: string;
  description: string;
  category: "quality_enforcement";
  difficulty: "expert";
  estimatedDuration: number;
  totalStages: number;
  stageLimits: {
    stage1: number;
    stage2: number;
    stage3: number;
    stage4: number;
  };
  passingScore: number;
  maxAttempts: number;
  cooldownDays: number;
  requirements: string[];
  warnings: string[];
  userStatus: {
    hasAttempted: boolean;
    status:
      | "not_started"
      | "in_progress"
      | "submitted"
      | "under_review"
      | "passed"
      | "failed";
    canRetake: boolean;
    nextRetakeAvailable: string | null;
  };
}

export interface SpideySession {
  submissionId: string;
  assessmentTitle: string;
  currentStage: "stage1" | "stage2" | "stage3" | "stage4" | "completed";
  stage1Config?: Stage1Config;
  stage2Config?: Stage2Config;
  stage3Config?: Stage3Config;
  stage4Config?: Stage4Config;
  instructions: string;
  sessionId: string;
}

// API Response interfaces
interface HookOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Stage1SubmitRequest {
  submissionData: {
    responses: Responses[];
  };
  timeSpent: number;
}

interface Responses {
  questionId: string;
  userAnswer: string | boolean | string[];
}

interface Stage2SubmitRequest {
  promptText: string;
  domain: string;
  failureExplanation: string;
  fileReferences: string[];
  response: string;
  timeSpent: number;
}

interface Stage3SubmitRequest {
  positiveRubric: string;
  negativeRubric: string;
  timeSpent: number;
}

interface Stage4SubmitRequest {
  instructionGiven: string;
  userResponse: string;
  violationFlagged: boolean;
  responseTime: number;
  timeSpent: number;
}

export const useSpideyAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available Spidey assessments
  const getAvailableSpideyAssessments = useCallback(async (): Promise<
    HookOperationResult<{
      assessments: SpideyAssessment[];
      summary: {
        totalAssessments: number;
        availableAssessments: number;
        userCanTake: number;
      };
      instructions: {
        spidey: string;
      };
    }>
  > => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet("/assessments/available");

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        const errorMessage =
          response.data?.message || "Failed to fetch available assessments";
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

  // Start Spidey assessment
  const startSpideyAssessment = useCallback(
    async (assessmentId: string): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiPost("/assessments/spidey/start", {
          assessmentId,
        });

        console.log("successful response", response);

        const responseData = response;

        if (responseData.success) {
          return {
            success: true,
            data: responseData,
            message: response.message,
          };
        } else {
          const errorMessage =
            response.data?.message || "Failed to start assessment";
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
    },
    []
  );

  // Submit Stage 1 (Guideline Comprehension)
  const submitStage1 = useCallback(
    async (
      submissionId: string,
      payload: Stage1SubmitRequest
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiPost(
          `/assessments/spidey/${submissionId}/stage1/submit`,
          payload
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          const errorMessage = response.message || "Stage 1 submission failed";
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
            data: response.data, // Include failure data for display
          };
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Submit Stage 2 (Mini Task Validation)
  const submitStage2 = useCallback(
    async (
      submissionId: string,
      payload: Stage2SubmitRequest
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiPost(
          `/assessments/spidey/${submissionId}/stage2/submit`,
          payload
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          const errorMessage = response.message || "Stage 2 submission failed";
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
            data: response.data, // Include violation details
          };
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Upload files for Stage 3
  const uploadStage3Files = useCallback(
    async (
      submissionId: string,
      files: File[]
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch(
          `/api/assessments/spidey/${submissionId}/stage3/files`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            data: result.data,
            message: result.message,
          };
        } else {
          const errorMessage = result.message || "File upload failed";
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
    },
    []
  );

  // Submit Stage 3 (Golden Solution & Rubric)
  const submitStage3 = useCallback(
    async (
      submissionId: string,
      payload: Stage3SubmitRequest
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiPost(
          `/assessments/spidey/${submissionId}/stage3/submit`,
          payload
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          const errorMessage = response.message || "Stage 3 submission failed";
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
    },
    []
  );

  // Submit Stage 4 (Integrity Trap)
  const submitStage4 = useCallback(
    async (
      submissionId: string,
      payload: Stage4SubmitRequest
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiPost(
          `/assessments/spidey/${submissionId}/stage4/submit`,
          payload
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          const errorMessage = response.message || "Assessment failed";
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
    },
    []
  );

  // Get assessment status
  const getAssessmentStatus = useCallback(
    async (submissionId: string): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGet(
          `/assessments/spidey/${submissionId}/status`
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message,
          };
        } else {
          const errorMessage =
            response.data?.message || "Failed to get assessment status";
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
    },
    []
  );

  // Auto-save progress
  const autoSaveProgress = useCallback(
    async (
      submissionId: string,
      stage: string,
      data: any
    ): Promise<HookOperationResult> => {
      try {
        const response = await apiPost(
          `/assessments/spidey/${submissionId}/autosave`,
          {
            stage,
            data,
            timestamp: new Date().toISOString(),
          }
        );

        return {
          success: response.success,
          data: response.data,
        };
      } catch (err: any) {
        return { success: false, error: getErrorMessage(err) };
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    getAvailableSpideyAssessments,
    startSpideyAssessment,
    submitStage1,
    submitStage2,
    uploadStage3Files,
    submitStage3,
    submitStage4,
    getAssessmentStatus,
    resetState,
  };
};
