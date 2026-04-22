import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { 
  AvailableAssessmentsResponseSchema, 
  StartAssessmentResponseSchema,
  Assessment,
  StartAssessmentData,
  RetakeEligibilityResponseSchema,
  RetakeEligibility
} from "../../validators/assessment/assessment-schema";

/**
 * Hook to fetch all available assessments for the current user
 */
export const useAvailableAssessmentsQuery = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.availableAssessments],
    queryFn: async (): Promise<Assessment[]> => {
      const response = await axiosInstance.get(endpoints.assessments.available);
      
      const result = AvailableAssessmentsResponseSchema.safeParse(response.data);
      if (!result.success) {
        console.error("Available assessments validation error:", result.error);
        // Fallback to raw data if validation fails but log it
        return response.data?.data || [];
      }
      
      return result.data.data || [];
    },
  });
};

/**
 * Hook to start a specific assessment session
 */
export const useStartAssessmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assessmentId: string): Promise<StartAssessmentData> => {
      const response = await axiosInstance.post(`${endpoints.assessments.start}/${assessmentId}`);
      
      const result = StartAssessmentResponseSchema.safeParse(response.data);
      if (!result.success) {
        console.error("Start assessment validation error:", result.error);
        if (response.data?.success && response.data?.data) {
           return response.data.data;
        }
        throw new Error(response.data?.message || "Failed to start assessment");
      }
      
      if (!result.data.success) {
        throw new Error(result.data.message || "Failed to start assessment");
      }

      if (!result.data.data) {
        throw new Error("No session data returned from server");
      }

      return result.data.data;
    },
    onSuccess: () => {
      // Invalidate available assessments to refresh the status (e.g. from available to in_progress)
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.availableAssessments] });
    }
  });
};

/**
 * Hook to check if the user is eligible for a retake (24-hour cooldown check)
 */
export const useRetakeEligibilityQuery = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.retakeEligibility],
    queryFn: async (): Promise<RetakeEligibility | null> => {
      const response = await axiosInstance.get(endpoints.assessments.retakeEligibility);
      
      const result = RetakeEligibilityResponseSchema.safeParse(response.data);
      if (!result.success) {
        console.error("Retake eligibility validation error:", result.error);
        return response.data?.data || null;
      }
      
      return result.data.data || null;
    },
  });
};

const assessmentDashboardService = {
  useAvailableAssessmentsQuery,
  useStartAssessmentMutation,
  useRetakeEligibilityQuery
};

export default assessmentDashboardService;
