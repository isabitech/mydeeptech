import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { GetSubmissionsResponseSchema } from "../../validators/assessment-reviews/assessment-reviews-schema";

const useAssessmentReviews = (search?: string) => {
    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.assessmentReviews, search],
        queryFn: async () => {
            const params = search ? { search } : {};
            const response = await axiosInstance.get<GetSubmissionsResponseSchema>(endpoints.assessments.assessmentReviews, { params });
            console.log(response.data);
            const result = GetSubmissionsResponseSchema.safeParse(response.data);
            if (!result.success) {
                const errorMessage = result.error.issues[0]?.message || "Failed to parse assessment reviews response";
                console.error("Assessment reviews parsing error:", result.error);
                throw new Error(errorMessage);
            }
            return result.data;
        },
    });

    return {
        ...query,
        assessmentReviews: query.data?.data.assessmentReviews ?? [],
        isAssessmentReviewsLoading: query.isLoading,
        isAssessmentReviewsError: query.isError,
        assessmentReviewsError: query.error,
        refreshAssessmentReviews: () => query.refetch(),
        pagination: {
            limit: query.data?.data.limit ?? 0,
            page: query.data?.data.page ?? 0,
            total: query.data?.data.total ?? 0,
            totalPages: query.data?.data.totalPages ?? 0,
        },
    }
}

const assessmentQueryService = {
    useAssessmentReviews,
}

export default assessmentQueryService;