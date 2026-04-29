import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

// Types for AI Recommendation Service
export interface AnnotatorRecommendation {
  annotator: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    country?: string;
    domains: string[];
    languages?: {
      native_languages?: string[];
      other_languages?: string[];
    };
    hasResume: boolean;
  };
  score: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  matches: {
    domain: number;
    language: number;
    experience: number;
  };
}

export interface RecommendationResponse {
  project: {
    id: string;
    name: string;
    category: string;
    description: string;
    requiredSkills?: string[];
    difficultyLevel?: string;
    minimumExperience?: string;
    languageRequirements?: string[];
  };
  recommendations: AnnotatorRecommendation[];
  summary: string;
}

export interface ServiceStatus {
  aiConfigured: boolean;
  promptVersion: string;
  service: string;
  version: string;
  capabilities: string[];
}

interface RecommendationParams {
  projectId: string;
  maxRecommendations?: number;
}

// Hook for getting AI recommendations for a project
export const useGetAiRecommendations = (params: RecommendationParams) => {
  const { projectId, maxRecommendations = 10 } = params;

  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAiRecommendations, projectId, maxRecommendations],
    queryFn: async (): Promise<RecommendationResponse> => {
      const queryParams = new URLSearchParams();
      if (maxRecommendations) queryParams.append('maxRecommendations', maxRecommendations.toString());
      
      const url = `${endpoints.aiRecommendations.getRecommendations}/${projectId}/annotators${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axiosInstance.get<{ data: RecommendationResponse }>(url);
      return response.data.data;
    },
    enabled: !!projectId,
  });

  return {
    data: query.data,
    recommendations: query.data?.recommendations || [],
    project: query.data?.project || null,
    summary: query.data?.summary || '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

// Hook for getting AI recommendation service status
export const useGetAiRecommendationStatus = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAiRecommendationStatus],
    queryFn: async (): Promise<ServiceStatus> => {
      const response = await axiosInstance.get<{ data: ServiceStatus }>(endpoints.aiRecommendations.getStatus);
      return response.data.data;
    },
  });

  return {
    data: query.data,
    aiConfigured: query.data?.aiConfigured || false,
    service: query.data?.service || '',
    capabilities: query.data?.capabilities || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

const aiRecommendationQuery = {
  useGetAiRecommendations,
  useGetAiRecommendationStatus,
};

export default aiRecommendationQuery;