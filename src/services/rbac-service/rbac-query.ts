import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";

export const useFetchPermissions = (params: { page?: number; limit?: number } = {}) => {
    return useQuery({
        queryKey: ["rbac-permissions", params],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.rbac.permissions.all, { params });
            return response.data;
        },
    });
};

export const useSearchPermissions = (name: string, params: { page?: number; limit?: number } = {}) => {
    return useQuery({
        queryKey: ["rbac-permissions-search", name, params],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.rbac.permissions.search, { 
                params: { ...params, name } 
            });
            return response.data;
        },
        enabled: name.length > 0,
    });
};

export const useFetchRoles = (params: { page?: number; limit?: number } = {}) => {
    return useQuery({
        queryKey: ["rbac-roles", params],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.rbac.roles.all, { params });
            return response.data;
        },
    });
};

export const useFetchRoleById = (id: string | null) => {
    return useQuery({
        queryKey: ["rbac-role", id],
        queryFn: async () => {
            const response = await axiosInstance.get(`${endpoints.rbac.roles.byId}/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useFetchUsersForRBAC = (params: { page?: number; limit?: number; search?: string } = {}) => {
    return useQuery({
        queryKey: ["rbac-users", params],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.rbac.users.all, { params });
            return response.data;
        },
    });
};

const rbacQueryService = {
    useFetchPermissions,
    useSearchPermissions,
    useFetchRoles,
    useFetchRoleById,
    useFetchUsersForRBAC,
};

export default rbacQueryService;
