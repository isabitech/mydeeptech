import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { AdminDashboardResponseSchema } from "../../validators/dashboard/admin-dashboard-schema";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

const useAdminDashboardQuery = () => {
   const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.adminDashboardData],
        queryFn: async () => {
            const response = await axiosInstance.get<AdminDashboardResponseSchema>(endpoints.adminDashboard.getDashboard);
            return response.data.data;
        },
   });

   return {
        data: query,
        adminDashboardQuery: query,
        isAdminDashboardLoading: query.isLoading,
        isAdminDashboardError: query.isError,
        adminDashboardError: query.error,
        adminDashboardData: query.data,
        refreshAdminDashboard: () => query.refetch(),
        refetch: () => query.refetch(),
        isRefetching: query.isRefetching,
   };
};

export default useAdminDashboardQuery;