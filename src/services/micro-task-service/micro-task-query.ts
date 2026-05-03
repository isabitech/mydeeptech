import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { GetSingleTaskResponseSchema } from "../../validators/task/single-task-schema";
import { GetSubmissionStatisticsResponseSchema } from "../../validators/task/task-submission-schema";
import { MicroTasksResponseSchema } from "../../validators/task/all-task-schema";
import { GetTasksFilterResponseSchema } from "../../validators/task/task-filters";

interface MicroTaskSubmission {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    description: string;
    category: "mask_collection" | "age_progression";
    required_count: number;
    payRate: number;
    payRateCurrency: string;
    instructions: string;
    quality_guidelines: string;
    estimated_time: string;
    deadline: string | null;
  };
  status: "in_progress" | "completed" | "under_review" | "approved" | "rejected" | "partially_rejected";
  progress_percentage: number;
  completed_slots: number;
  total_slots: number;
  slots: Array<{
    _id: string;
    angle: string;
    time_period?: string;
    description: string;
    sort_order: number;
    uploaded: boolean;
    image_url?: string;
    image_id?: string;
    metadata: Record<string, unknown>;
  }>;
  createdAt: string;
  submission_date: string | null;
}

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

interface TaskAssignment {
  assignmentId: string;
  task: {
    _id: string;
    taskName: string;
    taskLink: string;
    taskGuidelineLink: string;
    createdBy: {
      _id: string;
      fullName: string;
      email: string;
    };
    dateCreated: string;
    dueDate: string;
  };
  assignedDate: string;
  status: "pending" | "in-progress" | "completed";
}

const useGetMicroTaskSubmissionDetails = (submissionId: string) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskSubmissionDetails, submissionId],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: MicroTaskSubmission;
        message?: string;
      }>(`${endpoints.microTaskSubmissions.getSubmissionDetails}/${submissionId}`);
      return response.data;
    },
    enabled: !!submissionId,
    staleTime: 30000, // 30 seconds
  });

  return {
    submissionQuery: query,
    submission: query.data?.data || null,
    isSubmissionLoading: query.isLoading,
    isSubmissionError: query.isError,
    submissionError: query.error,
    submissionRefetch: () => query.refetch(),
    isSubmissionFetching: query.isFetching,
  };
};

const useGetUserMicroTaskSubmissions = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskSubmissions],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: { submissions: MicroTaskSubmission[] };
        message?: string;
      }>(endpoints.microTaskSubmissions.getUserSubmissions);
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });

  return {
    userSubmissionsQuery: query,
    userSubmissions: query.data?.data?.submissions || [],
    isUserSubmissionsLoading: query.isLoading,
    isUserSubmissionsError: query.isError,
    userSubmissionsError: query.error,
    userSubmissionsRefetch: () => query.refetch(),
    isUserSubmissionsFetching: query.isFetching,
  };
};

const useGetAssignedTasks = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAssignedTasks],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: TaskAssignment[];
        message?: string;
      }>(endpoints.tasks.getAssignedTasks);
      console.log("Assigned Tasks API Response:", response.data);
      return response.data;
    },
  });

  return {
    assignedTasksQuery: query,
    assignedTasks: query.data?.data || [],
    isAssignedTasksLoading: query.isLoading,
    isAssignedTasksError: query.isError,
    assignedTasksError: query.error,
    assignedTasksRefetch: () => query.refetch(),
    isAssignedTasksFetching: query.isFetching,
  };
};

const useGetAvailableMicroTasks = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: {
          tasks: MicroTask[];
          total: number;
        };
        message?: string;
      }>(endpoints.microTasks.getAvailableTasks);
      console.log("Available Tasks API Response:", response.data);
      return response.data;
    },
    staleTime: 120000, // 2 minutes
  });

  return {
    availableTasksQuery: query,
    availableTasks: query.data?.data?.tasks || [],
    isAvailableTasksLoading: query.isLoading,
    isAvailableTasksError: query.isError,
    availableTasksError: query.error,
    availableTasksRefetch: () => query.refetch(),
    isAvailableTasksFetching: query.isFetching,
  };
};

const useGetAllTasks = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks],
    queryFn: async () => {
      const response = await axiosInstance.get<MicroTasksResponseSchema>(endpoints.microTasks.allTasks);
      return response.data;
    },
  });
  return {
    allTasksQuery: query,
    allTasks: query.data?.data?.tasks || [],
    allTaskPagination: query.data?.data?.pagination || null,
    isAllTasksLoading: query.isLoading,
    isAllTasksError: query.isError,
    allTasksError: query.error,
    allTasksRefetch: () => query.refetch(),
    isAllTasksFetching: query.isFetching,
  };
};
export type TaskStatus =
  | "all"
  | "pending"
  | "ongoing"
  | "approved"
  | "processing"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

  export interface TaskFilters {
  search?: string;
  category?: string;
  status?: TaskStatus;
  page?: number;
  limit?: number;
  enabled?: boolean; // Optional flag to enable/disable the query
}

const useGetTasksByFilter = (filters: TaskFilters) => {
  const params = new URLSearchParams();
  if(filters.search) params.append("search", filters.search);
  if(filters.category) params.append("category", filters.category);
  if(filters.status) params.append("status", filters.status);
  if(filters.page) params.append("page", String(filters.page));
  if(filters.limit) params.append("limit", String(filters.limit));

  const queryParams = params.toString();
  const url = `${endpoints.microTasks.filters}?${queryParams}`;

  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getTasksByFilter, queryParams],
    queryFn: async () => {
      const response = await axiosInstance.get<GetTasksFilterResponseSchema>(url);
      return response.data;
    },
    enabled: !!queryParams,
  });
  return {
    allFilterQuery: query,
    allFilters: query.data?.data?.tasks || [],
    allFilterPagination: query.data?.data?.pagination || null,
    isAllFiltersLoading: query.isLoading,
    isAllFiltersError: query.isError,
    allFiltersError: query.error,
    allFiltersRefetch: () => query.refetch(),
    isAllFiltersFetching: query.isFetching,
  };
};

const useCheckMicroTaskEligibility = (taskId: string) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.checkMicroTaskEligibility, taskId],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: {
          eligible: boolean;
          reason?: string;
          existingSubmission?: string;
        };
        message?: string;
      }>(`${endpoints.microTaskSubmissions.checkEligibility}/${taskId}/eligibility`);
      return response.data;
    },
    enabled: !!taskId,
    staleTime: 30000, // 30 seconds
  });

  return {
    eligibilityQuery: query,
    eligibilityData: query.data?.data || null,
    isEligibilityLoading: query.isLoading,
    isEligibilityError: query.isError,
    eligibilityError: query.error,
    eligibilityRefetch: () => query.refetch(),
  };
};


const useGetSingleTask = (taskId: string) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getSingleTask, taskId],
    queryFn: async () => {
      const url = `${endpoints.tasks.getSingleTask}/${taskId}`;
      const response = await axiosInstance.get<GetSingleTaskResponseSchema>(url);
      return response.data;
    },
    enabled: !!taskId,
  });
  return {
    singleTaskQuery: query,
    singleTask: query.data?.data || null,
    isTaskLoading: query.isLoading,
    isTaskError: query.isError,
    taskError: query.error,
    taskRefetch: () => query.refetch(),
  };
};

const useGetSubmissionDetails = (assignmentId: string) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskSubmissionDetails, assignmentId],
    queryFn: async () => {
      const response = await axiosInstance.get<GetSubmissionStatisticsResponseSchema>(`${endpoints.microTaskSubmissions.getSubmissionDetails}/${assignmentId}`);
      return response.data;
    },
    enabled: !!assignmentId,
  });

  return {
    submissionDetailsQuery: query,
    submissionDetails: query.data?.data || null,
    isSubmissionDetailsLoading: query.isLoading,
    isSubmissionDetailsError: query.isError,    
    submissionDetailsError: query.error,
    submissionDetailsRefetch: () => query.refetch(),
    isSubmissionDetailsFetching: query.isFetching,
  };
}

const useGetUserEarningStatistics = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskEarningStatistics],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        success: boolean;
        data: {
          summary: {
            totalTasksAvailable: number;
            totalTasksSubmitted: number;
            totalTasksCompleted: number;
            myEarnings: number;
            pendingEarnings: number;
            approvalRate: number;
          };
          recentActivity: Array<{
            _id: string;
            taskTitle: string;
            category: string;
            payRate: number;
            currency: string;
            status: string;
            paymentStatus: string;
            submittedAt: string;
            createdAt: string;
          }>;
          monthlyBreakdown: Array<{
            year: number;
            month: number;
            earnings: number;
            taskCount: number;
          }>;
          categoryBreakdown: Array<{
            category: string;
            totalTasks: number;
            totalEarnings: number;
            approvedTasks: number;
            paidTasks: number;
            averageEarnings: number;
          }>;
        };
        message?: string;
      }>(endpoints.microTaskSubmissions.getEarningStatistics);
      return response.data;
    },
    staleTime: 300000, // 5 minutes
  });

  return {
    earningStatsQuery: query,
    earningStats: query.data?.data || null,
    isEarningStatsLoading: query.isLoading,
    isEarningStatsError: query.isError,
    earningStatsError: query.error,
    earningStatsRefetch: () => query.refetch(),
    isEarningStatsFetching: query.isFetching,
  };
};

const microTaskQueryService = {
  useGetMicroTaskSubmissionDetails,
  useGetUserMicroTaskSubmissions,
  useGetAvailableMicroTasks,
  useGetAssignedTasks,
  useCheckMicroTaskEligibility,
  useGetSingleTask,
  useGetSubmissionDetails,
  useGetAllTasks,
  useGetTasksByFilter,
  useGetUserEarningStatistics,
};

export default microTaskQueryService;