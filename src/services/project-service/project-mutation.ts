import { useMutation } from "@tanstack/react-query";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import axiosInstance from "../../service/axiosApi";

export const useApprovedProject = () => {
    return useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.approveRejectedProjectApplicant],
        mutationFn: async (payload: { projectId: string, applicantId: string }) => {
            const response = await axiosInstance.post(endpoints.adminProject.approveRejectedProjectApplicant, payload);
            return response.data;
        }
    });
};

const projectService = {
    useApprovedProject
};

export default projectService;