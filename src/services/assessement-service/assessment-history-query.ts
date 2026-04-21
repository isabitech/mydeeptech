import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { 
  AssessmentHistoryResponseSchema, 
  RetakeEligibilitySchema 
} from "../../validators/assessment/assessment-history-schema";
import { 
  AssessmentHistoryResponse, 
  RetakeEligibility 
} from "../../types/assessment.types";

const useAssessmentHistoryQuery = (page = 1, limit = 10) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.assessmentHistory, page, limit],
    queryFn: async (): Promise<AssessmentHistoryResponse> => {
      const response = await axiosInstance.get(endpoints.assessments.history, {
        params: { page, limit }
      });

      const result = AssessmentHistoryResponseSchema.safeParse(response.data);
      if (!result.success) {
        console.error("Assessment history validation error details:", JSON.stringify(result.error.format(), null, 2));
        console.warn("Raw API Response:", response.data);
        
        // Fallback: Return raw data so the UI can attempt to render it instead of showing "No data"
        // This helps us debug without fully blocking the UI
        return response.data as any;
      }

      return result.data;
    }
  });

  return {
    ...query,
    assessments: query.data?.data.assessments ?? [],
    statistics: query.data?.data.statistics ?? [],
    pagination: query.data?.data.pagination,
    isLoadingHistory: query.isLoading,
    isHistoryError: query.isError,
    historyError: query.error,
    refreshHistory: () => query.refetch()
  };
};

const useRetakeEligibilityQuery = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.retakeEligibility],
    queryFn: async (): Promise<RetakeEligibility> => {
      const response = await axiosInstance.get(endpoints.assessments.retakeEligibility);

      // Extract data from standard wrapper if it exists (success, message, data)
      const axiosData = response.data.data || response.data;

      const result = RetakeEligibilitySchema.safeParse(axiosData);
      if (!result.success) {
        console.error("Retake eligibility validation error:", result.error);
        throw new Error("Failed to validate retake eligibility data");
      }

      return result.data;
    }
  });

  return {
    ...query,
    eligibility: query.data,
    isLoadingEligibility: query.isLoading,
    isEligibilityError: query.isError,
    eligibilityError: query.error,
    refreshEligibility: () => query.refetch()
  };
};

const assessmentHistoryService = {
  useAssessmentHistoryQuery,
  useRetakeEligibilityQuery
};

export default assessmentHistoryService;
export { useAssessmentHistoryQuery, useRetakeEligibilityQuery };
