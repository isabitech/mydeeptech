import { useState, useCallback } from "react";
import { apiPost, apiGet, getErrorMessage } from "../../../service/apiUtils";
import { AssessmentTypeResponse, Question, AssessmentInfo } from "../../../types/assesment-type";

// User answer interface for submission
export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | boolean;
  timeSpent?: number;
}

export interface AssessmentSubmission {
  assessmentType: "annotator_qualification";
  startedAt: string | Date;
  completedAt: string | Date;
  answers: {
    question: string;
    questionId: string | number;
    userAnswer: string;
    section: string;
  }[];
  passingScore: number;
};

export interface AssessmentResult {
  assessmentId: string;
  results: {
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    passed: boolean;
    grade: string;
    timeSpent: string;
  };
  statusChanges: {
    statusChanged: boolean;
    before: {
      annotatorStatus: string;
      microTaskerStatus: string;
    };
    after: {
      annotatorStatus: string;
      microTaskerStatus: string;
    };
  };
  attemptInfo: {
    attemptNumber: number;
    isRetake: boolean;
    previousBestScore: number | null;
  };
}

export interface RetakeEligibility {
  canRetake: boolean;
  assessmentType: string;
  nextRetakeTime: string;
  latestAttempt: {
    date: string;
    score: number;
    passed: boolean;
    attemptNumber: number;
  };
  bestScore: {
    date: string;
    score: number;
    passed: boolean;
  };
}

interface HookOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useAssessmentSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAssessment = useCallback(async (
    assessmentData: any
  ): Promise<HookOperationResult<AssessmentResult>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost("/assessments/submit", assessmentData);

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to submit assessment";
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

  const checkRetakeEligibility = useCallback(async (): Promise<HookOperationResult<RetakeEligibility>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet("/assessments/retake-eligibility");

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to check retake eligibility";
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

  const getAssessmentHistory = useCallback(async (
    page = 1,
    limit = 10,
    filters?: Record<string, any>
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString()
      };

      // Add any additional filters
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined) {
            params[key] = filters[key].toString();
          }
        });
      }

      const response = await apiGet("/assessments/history", { params });

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to fetch assessment history";
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

  const getAssessmentQuestions = useCallback(async (
    questionsPerSection = 5,
    language?: 'en' | 'akan'
  ): Promise<HookOperationResult<AssessmentTypeResponse>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet("/assessments/questions", {
        params: language ? { questionsPerSection, language } : { questionsPerSection }
      });

      if (response.success) {
        return { 
          success: true, 
          data: response.data,
          message: response.message 
        };
      } else {
        const errorMessage = response.message || "Failed to fetch assessment questions";
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

  const getAssessmentSections = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Since sections are static (Comprehension, Vocabulary, Grammar, Writing), 
      // we can return them directly or fetch from a separate endpoint if available
      const staticSections = [
        {
          id: 1,
          title: "Comprehension",
          description: "Reading comprehension and text analysis skills",
          questionIds: [] // Will be populated when questions are loaded
        },
        {
          id: 2,
          title: "Vocabulary", 
          description: "Word knowledge, definitions, and usage",
          questionIds: []
        },
        {
          id: 3,
          title: "Grammar",
          description: "English grammar rules, sentence structure, and syntax",
          questionIds: []
        },
        {
          id: 4,
          title: "Writing",
          description: "Writing skills, style, and composition techniques",
          questionIds: []
        }
      ];

      return { 
        success: true, 
        data: staticSections,
        message: "Assessment sections loaded successfully" 
      };
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
    submitAssessment,
    checkRetakeEligibility,
    getAssessmentHistory,
    getAssessmentQuestions,
    getAssessmentSections,
    loading,
    error,
    resetState,
  };
};