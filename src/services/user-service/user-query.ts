import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import { GetUsersResponseSchema } from "../../validators/users/users-schema";


const useGetAllUsers = (searchQuery: string) => {
    const query = useQuery({
        queryKey: ['getAllUsers', searchQuery],
        queryFn: async () => {
            const queryUrl = searchQuery.trim() ? `${endpoints.users.getAllUsers}?search=${encodeURIComponent(searchQuery)}` : endpoints.users.getAllUsers;
            const response = await axiosInstance.get<GetUsersResponseSchema>(queryUrl);
            return response.data;
        },
    });
    return {
        userQuery: query,
        allUsers: query.data?.data ?? [],
        isUsersLoading: query.isLoading,
        isUsersError: query.isError,
        usersError: query.error,
        usersRefetch: () => query.refetch(),
        isUsersFetching: query.isFetching,
    }
};

const useSearchUsers = (searchTerm: string) => {
    const query = useQuery({
        queryKey: ['searchUsers', searchTerm],
        queryFn: async () => {
            const response = await axiosInstance.get<GetUsersResponseSchema>(
                `${endpoints.users.getUsers}?search=${encodeURIComponent(searchTerm)}`
            );
            return response.data;
        },
        enabled: !!searchTerm.trim(),
    });
    return {
        searchQuery: query,
        searchResults: query.data?.data || [],
        isSearchLoading: query.isLoading,
        isSearchError: query.isError,
        searchError: query.error,
        searchRefetch: () => query.refetch(),
    }
};

const userQueryService = {
    useGetAllUsers,
    useSearchUsers,
};

export default userQueryService;