import { useMutation } from "@tanstack/react-query";
import { SubmitAssessmentReviewPayload } from "../../hooks/Auth/User/useSubmitAssessment";
import { endpoints } from "../../store/api/endpoints";
import { apiPost } from "../../service/apiUtils";


  const submitReviewMutation = () => {
    const submitReviewMutation = useMutation({
    mutationKey: ["submitAssessmentReview"],
    mutationFn: async (payload: SubmitAssessmentReviewPayload): Promise<any> => {
      const data: any = await apiPost(endpoints.assessments.assessmentReview, payload);
      return data.data;
    }
  });

    return {
        isSubmitReviewMutationLoading: submitReviewMutation.isPending,
        isSubmitReviewError: submitReviewMutation.error,
        ...submitReviewMutation
    }
  }


const assessmentMutationService = {
    submitReviewMutation,
}

export default assessmentMutationService;