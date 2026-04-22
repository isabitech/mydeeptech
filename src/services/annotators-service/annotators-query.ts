import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { 
  GetAllDTUsersResponseSchema, 
  AnnotatorsQueryParamsSchema,
  SummarySchema,
  GetQAUsersResponseSchema,
} from "../../validators/annotators/annotators-schema";


// Helper function to build query string
const buildQueryParams = (params?: AnnotatorsQueryParamsSchema): string => {
  if (!params) return "";
  
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.country && params.country !== 'all') queryParams.append('country', params.country);
  if (params.qaStatus) queryParams.append('qaStatus', params.qaStatus);
  
  return queryParams.toString();
};

// Main hook for getting all DT users with optional filters
const useGetAllDTUsers = (params?: AnnotatorsQueryParamsSchema) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAllDTUsers, params],
    queryFn: async (): Promise<GetAllDTUsersResponseSchema> => {
      const queryString = buildQueryParams(params);
      const url = queryString ? `${endpoints.adminActions.getAllDTUsers}?${queryString}` : endpoints.adminActions.getAllDTUsers;
      const response = await axiosInstance.get<GetAllDTUsersResponseSchema>(url);
      return response.data
    },
  });

  return {
    data: query.data?.data,
    users: query.data?.data?.users || [],
    pagination: query.data?.data?.pagination || null,
    summary: query.data?.data?.summary || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

// Hook for getting approved annotators
const useGetApprovedAnnotators = (params?: Omit<AnnotatorsQueryParamsSchema, 'status'>) => {
  return useGetAllDTUsers({ ...params, status: 'approved' });
};

// Hook for getting pending annotators  
const useGetPendingAnnotators = (params?: Omit<AnnotatorsQueryParamsSchema, 'status'>) => {
  return useGetAllDTUsers({ ...params, status: 'pending' });
};

// Hook for getting submitted annotators
const useGetSubmittedAnnotators = (params?: Omit<AnnotatorsQueryParamsSchema, 'status'>) => {
  return useGetAllDTUsers({ ...params, status: 'submitted' });
};

// Hook for getting rejected annotators (microtaskers)
const useGetRejectedAnnotators = (params?: Omit<AnnotatorsQueryParamsSchema, 'status'>) => {
  return useGetAllDTUsers({ ...params, status: 'rejected' });
};

// Hook for getting QA annotators - those with qaStatus = 'approved'
const useGetQAAnnotators = (params?: AnnotatorsQueryParamsSchema) => {
  const queryParams = { ...params, qaStatus: 'approved' };

  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getQAAnnotators, JSON.stringify(queryParams)],
    queryFn: async (): Promise<GetQAUsersResponseSchema> => {
      const queryString = buildQueryParams(queryParams);
      
      const url = `/admin/qa-users${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get<GetQAUsersResponseSchema>(url);
     return response.data;
    },
  });


  return {
    data: query,
    users: query.data?.data?.qaUsers ?? [],
    pagination: query.data?.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

// Hook for getting summary data only (minimal API call)
const useGetDTUsersSummary = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAllDTUsers, { page: 1, limit: 1 }],
    queryFn: async (): Promise<SummarySchema> => {
      const response = await axiosInstance.get<GetAllDTUsersResponseSchema>(
        `${endpoints.adminActions.getAllDTUsers}?page=1&limit=1`
      );
      
      const validatedData = GetAllDTUsersResponseSchema.parse(response.data);
      return validatedData.data.summary;
    },
    staleTime: 60 * 1000, // 1 minute for summary data
  });

  return {
    data: query,     
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

const annotatorsQueryService = {
  useGetAllDTUsers,
  useGetApprovedAnnotators,
  useGetPendingAnnotators,
  useGetSubmittedAnnotators,
  useGetRejectedAnnotators,
  useGetQAAnnotators,
  useGetDTUsersSummary,
};

export default annotatorsQueryService;