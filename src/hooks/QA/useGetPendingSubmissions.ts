import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";

// Multimedia Assessment Submissions Hook
// Handles fetching submissions with different statuses: pending, approved, rejected
export interface PendingSubmissionRaw {
  _id: string;
  annotatorId?: string | null;
  status: string;
  attemptNumber?: number | null;
  avgScore?: number | null;
  completionTime?: number | null;
  waitingTime?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  assessmentTitle?: string | null;
  submittedAt?: string | null;
  tasksCompleted?: number | null;
  // any additional fields the backend may provide
  [key: string]: any;
}

// Mapped/normalized shape used by the frontend
export interface PendingSubmission {
  _id: string;
  annotatorId?: string | null;
  status: 'submitted' | 'in_review' | 'reviewed' | 'approved' | 'rejected' | string;
  attemptNumber: number;
  avgScore: number | null;
  completionTime: number | null; // milliseconds
  waitingTime: number | null; // milliseconds
  userName: string | null;
  userEmail: string | null;
  assessmentTitle: string | null;
  submittedAt: string | null; // ISO date string
  tasksCompleted: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface GetPendingResult {
  success: boolean;
  data?: {
    submissions: PendingSubmission[];
    pagination: Pagination;
  };
  error?: string;
}

export const useGetPendingSubmissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const getPendingSubmissions = async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    filterBy?: string;
    search?: string;
    status?: string;
  }): Promise<GetPendingResult> => {
    setLoading(true);
    setError(null);

    try {
      // Determine which API method to call based on status
      const status = params?.status || 'pending';
      let response;
      
      // Create params without status since it's used for endpoint selection
      const { status: _, ...apiParams } = params || {};
      
      switch (status) {
        case 'approved':
          response = await multimediaAssessmentApi.getApprovedSubmissions(apiParams);
          break;
        case 'rejected':
          response = await multimediaAssessmentApi.getRejectedSubmissions(apiParams);
          break;
        case 'pending':
        default:
          response = await multimediaAssessmentApi.getPendingSubmissions(apiParams);
          break;
      }
      
      console.log('API Response:', response);
      console.log('Success:', response.success);
      console.log('Response data:', response.data);
      
      if (response.success && response.data) {
        const { submissions: submissionsData, pagination: paginationData } = response?.data;

        // Map raw submissions to the normalized PendingSubmission shape
        const mapped: PendingSubmission[] = (submissionsData as PendingSubmissionRaw[]).map((s) => ({
          _id: s._id,
          annotatorId: s.annotatorId ?? null,
          status: s.status ?? 'submitted',
          attemptNumber: typeof s.attemptNumber === 'number' ? s.attemptNumber : (s.attemptNumber ? Number(s.attemptNumber) : 1),
          avgScore: s.avgScore ?? null,
          completionTime: s.completionTime ?? null,
          waitingTime: s.waitingTime ?? null,
          userName: s.userName ?? s.userId?.name ?? null,
          userEmail: s.userEmail ?? s.userId?.email ?? null,
          assessmentTitle: s.assessmentTitle ?? s.assessmentId?.title ?? null,
          submittedAt: s.submittedAt ?? null,
          tasksCompleted: typeof s.tasksCompleted === 'number' ? s.tasksCompleted : (s.tasksCompleted ? Number(s.tasksCompleted) : 0),
        }));

        setSubmissions(mapped);
        setPagination(paginationData as Pagination);
        return { success: true, data: { submissions: mapped, pagination: paginationData } };
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