import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { DtUserDashboardResponseSchema } from "../../validators/dashboard/user-dashboard-schema";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";


const useDashboardQuery = () => {
   const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.userDashboardData],
        queryFn: async () => {
            const response = await axiosInstance.get<DtUserDashboardResponseSchema>(endpoints.userDashboard.getDashboard);
            const result = DtUserDashboardResponseSchema.safeParse(response.data);
            if(!result.success) {
                const errorDetails = result.error.issues[0].message;
                console.error("Zod Validation Error:", errorDetails);
                throw new Error(errorDetails);
            }
            return result.data;
        }
   });

   return {
        data: query,
        dashboardQuery: query,
        isDashboardLoading: query.isLoading,
        isDashboardError: query.isError,
        dashboardError: query.error,
        dashboardData: query.data?.data,
        refreshDashboard: () => query.refetch(),
   };
}

const dashboardQueryService = {
    useDashboardQuery,
}

export default dashboardQueryService;