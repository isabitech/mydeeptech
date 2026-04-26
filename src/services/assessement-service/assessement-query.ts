import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { GetSubmissionsResponseSchema } from "../../validators/assessment-reviews/assessment-reviews-schema";

interface AssessmentFilters {
    search?: string;
    scoreRange?: string;
}

const useAssessmentReviews = (search?: string, scoreRange?: string) => {
    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.assessmentReviews, search, scoreRange],
        queryFn: async () => {
            const params: AssessmentFilters = {};
            if (search) params.search = search;
            if (scoreRange && scoreRange !== "all") params.scoreRange = scoreRange;
            
            const response = await axiosInstance.get<GetSubmissionsResponseSchema>(endpoints.assessments.assessmentReviews, { params });
            return response.data;
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