import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { notification } from "antd";

// Permissions Mutations
export const useCreatePermission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await axiosInstance.post(endpoints.rbac.permissions.create, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                notification.success({ message: "Permission created successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] });
            } else {
                notification.error({ message: data.message || "Failed to create permission" });
            }
        },
    });
};

export const useUpdatePermission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            const response = await axiosInstance.put(`${endpoints.rbac.permissions.update}/${id}`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                notification.success({ message: "Permission updated successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] });
            } else {
                notification.error({ message: data.message || "Failed to update permission" });
            }
        },
    });
};

export const useDeletePermission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`${endpoints.rbac.permissions.delete}/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                notification.success({ message: "Permission deleted successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] });
            } else {
                notification.error({ message: data.message || "Failed to delete permission" });
            }
        },
    });
};

// Roles Mutations
export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await axiosInstance.post(endpoints.rbac.roles.create, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                notification.success({ message: "Role created successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
            } else {
                notification.error({ message: data.message || "Failed to create role" });
            }
        },
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            const response = await axiosInstance.put(`${endpoints.rbac.roles.update}/${id}`, payload);
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (data.success) {
                notification.success({ message: "Role updated successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
                queryClient.invalidateQueries({ queryKey: ["rbac-role", variables.id] });
            } else {
                notification.error({ message: data.message || "Failed to update role" });
            }
        },
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`${endpoints.rbac.roles.delete}/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                notification.success({ message: "Role deleted successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
            } else {
                notification.error({ message: data.message || "Failed to delete role" });
            }
        },
    });
};

// User-Role Assignment Mutations
export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const url = endpoints.rbac.users.updateRole.replace(":userId", userId);
            const response = await axiosInstance.put(url, { role });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                notification.success({ message: "User role updated successfully" });
                queryClient.invalidateQueries({ queryKey: ["rbac-users"] });
            } else {
                notification.error({ message: data.message || "Failed to update user role" });
            }
        },
    });
};

// Integration point for future Role-Permission assignment
export const useAssignUserRolePermission = () => {
    // This is marked as a backend gap in the prompt
    return useMutation({
        mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
            notification.info({ 
                message: "Feature Note", 
                description: "User to Role-Permission assignment endpoint not yet verified on backend. Surface adapter point hit." 
            });
            // Return fake success for UI flow testing if needed, or error
            throw new Error("Backend integration point for role_permission assignment is pending.");
        }
    });
};

const rbacMutationService = {
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
    useCreateRole,
    useUpdateRole,
    useDeleteRole,
    useUpdateUserRole,
    useAssignUserRolePermission,
};

export default rbacMutationService;
