import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitAssessmentReviewPayload } from "../../hooks/Auth/User/useSubmitAssessment";
import { endpoints } from "../../store/api/endpoints";
import { apiPost } from "../../service/apiUtils";
import { SubmitReviewSchema } from "../../validators/assessment-reviews/assessment-reviews-schema";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import axiosInstance from "../../service/axiosApi";


  const useSubmitReviewMutation = () => {
    const mutation = useMutation({
    mutationKey: ["submitAssessmentReview"],
    mutationFn: async (payload: SubmitAssessmentReviewPayload): Promise<any> => {
      const data: any = await apiPost(endpoints.assessments.assessmentReview, payload);
      return data.data;
    }
  });

    return {
        submitReviewMutation: mutation,
        isSubmitReviewLoading: mutation.isPending,
        isSubmitReviewError: mutation.isError,
        submitReviewError: mutation.error,
    }
  }

  const useUpdateReview = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.QUERY.updateAssessmentReview],
    mutationFn: async ({ assessmentId, ...payload }: SubmitReviewSchema): Promise<SubmitAssessmentReviewPayload> => {
      const response = await axiosInstance.patch(`${endpoints.assessments.updateReviewAssessment}/${assessmentId}`, payload);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [REACT_QUERY_KEYS.QUERY.assessmentReviews]});
    }
  });

    return {
        updateReviewMutation: mutation,
        isUpdateReviewLoading: mutation.isPending,
        isUpdateReviewError: mutation.isError,
        updateReviewError: mutation.error,
    }
  }


const assessmentMutationService = {
    useSubmitReviewMutation,
    useUpdateReview,
}

export default assessmentMutationService;