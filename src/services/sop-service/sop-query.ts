import { useQuery } from "@tanstack/react-query";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import defaultAxiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { sopAcceptanceResponseSchema } from "../../validators/sop/sop-schema";

const useGetSOPAcceptanceStatus = () => {
    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.sopAcceptanceStatus],
        queryFn: async () => {
            const response = await defaultAxiosInstance.get<sopAcceptanceResponseSchema>(endpoints.sop.getSopAcceptanceStatus);
            return response.data;
        },
    });
    return {
        isLoading: query.isLoading,
        hasAcceptedSop: query.data?.data.has_accepted || false,
        acceptedAt: query.data?.data.accepted_at || null,
        user: query.data?.data.user || null,
         refetch: query.refetch,
    };
};

const sopQueryService = {
    useGetSOPAcceptanceStatus,
};

export default sopQueryService;
