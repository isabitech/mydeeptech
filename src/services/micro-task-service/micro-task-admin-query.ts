import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { GetTasksResponseSchema } from "../../validators/task/task-schema";
import { GetUsersResponseSchemaWithPagination } from "../../validators/users/users-schema";
import { GetTaskAssignmentsResponseSchema } from "../../validators/task/assigned-task-schema";
import { GetMyAssignedTasksResponseSchema } from "../../validators/task/my-tasks-schema";
import { TaskFilters } from "./micro-task-query";


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

const useGetAssignedTaskToUsers = (taskId: string, page: number = 1, limit: number = 10) => {

    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (taskId) params.append('taskId', taskId.toString());
    const queryString = params.toString();

  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.usersAssignToTask, page, limit, taskId],
    queryFn: async () => {
      const url = queryString ? `${endpoints.tasks.usersAssignToTask}?${queryString}` : endpoints.tasks.usersAssignToTask;
      const response = await axiosInstance.get<GetTaskAssignmentsResponseSchema>(url);
      return response.data;
      },
      enabled: !!taskId, // Only run this query if taskId is provided
  });

  return {
    assignedTasksQuery: query,
    assignedTasks: query.data?.data || [],
    pagination: query.data?.pagination || null,
    total: query.data?.pagination?.total || 0,
    isAssignedTasksLoading: query.isLoading,
    isAssignedTasksError: query.isError,
    assignedTasksError: query.error,
    assignedTasksRefetch: () => query.refetch(),
    isAssignedTasksFetching: query.isFetching,
  }

}

const useGetPaginatedUsers = (page: number = 1, limit: number = 10, searchQuery?: string) => {

    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (searchQuery) params.append('searchQuery', searchQuery.toString());
    const queryString = params.toString();

  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getPaginatedUsers, page, limit, searchQuery],
    queryFn: async () => {
      const url = queryString ? `${endpoints.tasks.getPaginatedUsers}?${queryString}` : endpoints.tasks.getPaginatedUsers;
      const response = await axiosInstance.get<GetUsersResponseSchemaWithPagination>(url);
      return response.data;
      },
      enabled: !!page && !!limit, // Only run this query if page and limit are provided
  });

  return {
    paginatedUsersQuery: query,
    paginatedUsers: query.data?.data || [],
    pagination: query.data?.pagination || null,
    total: query.data?.pagination?.total || 0,
    isPaginatedUsersLoading: query.isLoading,
    isPaginatedUsersError: query.isError,
    paginatedUsersError: query.error,
    paginatedUsersRefetch: () => query.refetch(),
    isPaginatedUsersFetching: query.isFetching,
  }

}


// Admin-specific queries that require ADMIN role
const useGetAllMicroTasksAdmin = (filters: TaskFilters) => {

   const params = new URLSearchParams();
   if(filters.search) params.append("search", filters.search.trim());
   if(filters.category) params.append("category", filters.category.trim());
   if(filters.status) params.append("status", filters.status.trim());
   if(filters.page) params.append("page", String(filters.page));
   if(filters.limit) params.append("limit", String(filters.limit));
   const queryParams = params.toString();
   const url = queryParams ? `${endpoints.tasks.getAllTasks}?${queryParams}` : endpoints.tasks.getAllTasks;

  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks, filters],
    queryFn: async () => {
      const response = await axiosInstance.get<GetTasksResponseSchema>(url);
      return response.data;
    },
    enabled: !!queryParams,
  });

  return {
    tasksQuery: query,
    tasks: query.data?.data || [],
    total: query.data?.pagination?.total || 0,
    isTasksLoading: query.isLoading,
    isTasksError: query.isError,
    tasksError: query.error,
    tasksRefetch: () => query.refetch(),
    isTasksFetching: query.isFetching,
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
  });

  return {
    statisticsQuery: query,
    statistics: query.data?.data || null,
    isStatisticsLoading: query.isLoading,
    isStatisticsError: query.isError,
    statisticsError: query.error,
    statisticsRefetch: () => query.refetch(),
  };
};

// QA-specific queries that require QA_REVIEWER or ADMIN role
const useGetPendingMicroTaskReviews = (page?: number, limit?: number, filters?: Record<string, unknown>) => {
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
  });

  return {
    reviewsQuery: query,
    pendingReviews: query.data?.data || [],
    total: query.data?.total || 0,
    isReviewsLoading: query.isLoading,
    isReviewsError: query.isError,
    reviewsError: query.error,
    reviewsRefetch: () => query.refetch(),
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
  });

  return {
    reviewStatsQuery: query,
    reviewStatistics: query.data?.data || null,
    isReviewStatsLoading: query.isLoading,
    isReviewStatsError: query.isError,
    reviewStatsError: query.error,
    reviewStatsRefetch: () => query.refetch(),
  };
};


const useGetMyTasks = (page: number = 1, limit: number = 10, filters?: Record<string, unknown>) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getMyTasks, page, limit, filters],
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
      const url = params.toString() ? `${endpoints.tasks.getMyTasks}?${params.toString()}` : endpoints.tasks.getMyTasks;
      const response = await axiosInstance.get<GetMyAssignedTasksResponseSchema>(url);
      return response.data;
    },
  });

  return {
    myTasksQuery: query,
    myTasks: query.data?.data || [],
    total: query.data?.pagination?.total || 0,
    isMyTasksLoading: query.isLoading,
    isMyTasksError: query.isError,
    myTasksError: query.error,
    myTasksRefetch: () => query.refetch(),
    isMyTasksFetching: query.isFetching,
  };
};


const microTaskAdminQueryService = {
  useGetAllMicroTasksAdmin,
  useGetMicroTaskStatisticsAdmin,
  useGetPendingMicroTaskReviews,
  useGetMicroTaskReviewStatistics,
  useGetAssignedTaskToUsers,
  useGetPaginatedUsers,
  useGetMyTasks,
};

export default microTaskAdminQueryService;