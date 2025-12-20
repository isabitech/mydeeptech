import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

interface PendingSubmission {
  userId: string;
  userName: string;
  userEmail: string;
  assessmentTitle: string;
  submittedAt: string;
  avgScore: number;
  completionTime: number;
  waitingTime: number;
  attemptNumber: number;
  tasksCompleted: number;
  totalTasks: number;
  status: string;
}

interface GetPendingResult {
  success: boolean;
  data?: {
    submissions: PendingSubmission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

export const useGetPendingSubmissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const getPendingSubmissions = async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    filterBy?: string;
  }): Promise<GetPendingResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.getPendingSubmissions(params);
      
      if (response.data?.success && response.data?.data) {
        const { submissions: submissionsData, pagination: paginationData } = response.data.data;
        setSubmissions(submissionsData);
        setPagination(paginationData);
        return { success: true, data: response.data.data };
      } else {
        const errorMessage = response.data?.message || "Failed to fetch pending submissions";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching submissions. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSubmissions([]);
    setPagination(null);
  };

  return {
    getPendingSubmissions,
    loading,
    error,
    submissions,
    pagination,
    resetState,
  };
};