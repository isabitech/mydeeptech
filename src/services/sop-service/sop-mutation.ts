import { useMutation } from "@tanstack/react-query";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import defaultAxiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { sopAcceptanceResponseSchema } from "../../validators/sop/sop-schema";

const useSOPAcceptance = () => {
    return useMutation({
        mutationKey: [REACT_QUERY_KEYS.QUERY.sopAcceptanceStatus],
        mutationFn: async () => {
            const response = await defaultAxiosInstance.post<sopAcceptanceResponseSchema>(endpoints.sop.recordSopAcceptance);
            return response.data;
        },
    });
};

const sopMutationService = {
    useSOPAcceptance,
};

export default sopMutationService;
