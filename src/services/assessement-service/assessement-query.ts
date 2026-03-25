import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { GetSubmissionsResponseSchema } from "../../validators/assessment-reviews/assessment-reviews-schema";

const useAssessmentReviews = () => {
    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.assessmentReviews],
        queryFn: async () => {
            const response = await axiosInstance.get<GetSubmissionsResponseSchema>(endpoints.assessments.assessmentReviews);
            return GetSubmissionsResponseSchema.parse(response.data);
        },
    });

    return {
        assessmentReviews: query.data?.data.assessmentReviews || [],
        isAssessmentReviewsLoading: query.isLoading,
        isAssessmentReviewsError: query.error,
        pagination: {
            limit: query.data?.data.limit || 0,
            page: query.data?.data.page || 0,
            total: query.data?.data.total || 0,
            totalPages: query.data?.data.totalPages || 0,
        },
        ...query,
    }
}

const assessmentQueryService = {
    useAssessmentReviews,
}

export default assessmentQueryService;