import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

interface MicroTask {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  payRate: number;
  payRateCurrency: string;
  required_count: number;
  instructions: string;
  quality_guidelines: string;
  estimated_time: string;
  deadline: string | null;
  createdAt: string;
}

interface QASubmission {
  _id: string;
  userId: string;
  taskId: string;
  status: string;
  submittedAt: string;
  images: Array<{
    _id: string;
    url: string;
    reviewed: boolean;
    approved: boolean;
    feedback?: string;
  }>;
}

// Admin-specific queries that require ADMIN role
const useGetAllMicroTasksAdmin = (page?: number, limit?: number, filters?: Record<string, any>) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAllMicroTasks, page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString ? `${endpoints.microTasks.getAllTasks}?${queryString}` : endpoints.microTasks.getAllTasks;
      
      const response = await axiosInstance.get<{
        success: boolean;
        data: MicroTask[];
        total?: number;
        message?: string;
      }>(url);
      return response.data;
    },
    staleTime: 60000, // 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (access denied) errors
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    tasksQuery: query,
    tasks: query.data?.data || [],
    total: query.data?.total || 0,
    isTasksLoading: query.isLoading,
    isTasksError: query.isError,
    tasksError: query.error,
    tasksRefetch: () => query.refetch(),
    isTasksFetching: query.isFetching,
    isAccessDenied: query.error?.response?.status === 403,
  };
};

const useGetMicroTaskStatisticsAdmin = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskStatistics],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: {
          totalTasks: number;
          activeTasks: number;
          completedTasks: number;
          totalSubmissions: number;
          pendingReviews: number;
          approvedSubmissions: number;
          rejectedSubmissions: number;
          totalPayout: number;
        };
        message?: string;
      }>(endpoints.microTasks.getStatistics);
      return response.data;
    },
    staleTime: 300000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (access denied) errors
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    statisticsQuery: query,
    statistics: query.data?.data || null,
    isStatisticsLoading: query.isLoading,
    isStatisticsError: query.isError,
    statisticsError: query.error,
    statisticsRefetch: () => query.refetch(),
    isAccessDenied: query.error?.response?.status === 403,
  };
};

// QA-specific queries that require QA_REVIEWER or ADMIN role
const useGetPendingMicroTaskReviews = (page?: number, limit?: number, filters?: Record<string, any>) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getPendingMicroTaskReviews, page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString ? `${endpoints.microTaskQA.getPendingReviews}?${queryString}` : endpoints.microTaskQA.getPendingReviews;
      
      const response = await axiosInstance.get<{
        success: boolean;
        data: QASubmission[];
        total?: number;
        message?: string;
      }>(url);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    reviewsQuery: query,
    pendingReviews: query.data?.data || [],
    total: query.data?.total || 0,
    isReviewsLoading: query.isLoading,
    isReviewsError: query.isError,
    reviewsError: query.error,
    reviewsRefetch: () => query.refetch(),
    isAccessDenied: query.error?.response?.status === 403,
  };
};

const useGetMicroTaskReviewStatistics = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskReviewStatistics],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: {
          totalSubmissions: number;
          pendingReviews: number;
          approvedSubmissions: number;
          rejectedSubmissions: number;
          averageReviewTime: number;
        };
        message?: string;
      }>(endpoints.microTaskQA.getReviewStatistics);
      return response.data;
    },
    staleTime: 300000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    reviewStatsQuery: query,
    reviewStatistics: query.data?.data || null,
    isReviewStatsLoading: query.isLoading,
    isReviewStatsError: query.isError,
    reviewStatsError: query.error,
    reviewStatsRefetch: () => query.refetch(),
    isAccessDenied: query.error?.response?.status === 403,
  };
};

const microTaskAdminQueryService = {
  useGetAllMicroTasksAdmin,
  useGetMicroTaskStatisticsAdmin,
  useGetPendingMicroTaskReviews,
  useGetMicroTaskReviewStatistics,
};

export default microTaskAdminQueryService;