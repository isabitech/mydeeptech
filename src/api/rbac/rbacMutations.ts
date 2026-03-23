import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { message } from "antd";
import { rbacQueryKey } from "./rbacQueries";
import { apiResponseSchema } from "./rbacSchema";

/**
 * Hook for creating a new permission.
 * Validates payload and response, invalidates relevant queries on success.
 */
export const usePermissionCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rawPayload: unknown) => {
      const rawResponse = await axiosInstance.post(endpoints.rbac.permissions.create, rawPayload);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Permission created successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.permissions });
      } else {
        message.error(validatedResponse.message || "Failed to create permission");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for updating an existing permission.
 */
export const usePermissionUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ permissionId, rawPayload }: { permissionId: string; rawPayload: unknown }) => {
      const rawResponse = await axiosInstance.put(`${endpoints.rbac.permissions.update}/${permissionId}`, rawPayload);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Permission updated successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.permissions });
      } else {
        message.error(validatedResponse.message || "Failed to update permission");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for deleting a permission.
 */
export const usePermissionDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const rawResponse = await axiosInstance.delete(`${endpoints.rbac.permissions.delete}/${permissionId}`);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Permission deleted successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.permissions });
      } else {
        message.error(validatedResponse.message || "Failed to delete permission");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for creating a new role.
 */
export const useRoleCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rawPayload: unknown) => {
      const rawResponse = await axiosInstance.post(endpoints.rbac.roles.create, rawPayload);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Role created successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.roles });
      } else {
        message.error(validatedResponse.message || "Failed to create role");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for updating an existing role.
 */
export const useRoleUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, rawPayload }: { roleId: string; rawPayload: unknown }) => {
      const rawResponse = await axiosInstance.put(`${endpoints.rbac.roles.update}/${roleId}`, rawPayload);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse, variables) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Role updated successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.roles });
        queryClient.invalidateQueries({ queryKey: [...rbacQueryKey.roles, "detail", variables.roleId] });
      } else {
        message.error(validatedResponse.message || "Failed to update role");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for deleting a role.
 */
export const useRoleDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleId: string) => {
      const rawResponse = await axiosInstance.delete(`${endpoints.rbac.roles.delete}/${roleId}`);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Role deleted successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.roles });
      } else {
        message.error(validatedResponse.message || "Failed to delete role");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for adding permissions to a role.
 */
export const useRolePermissionAdd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const url = endpoints.rbac.roles.addPermissions.replace(":id", roleId);
      const rawResponse = await axiosInstance.put(url, { permissions });
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse, variables) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Permissions added successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.roles });
        queryClient.invalidateQueries({ queryKey: [...rbacQueryKey.roles, "detail", variables.roleId] });
      } else {
        message.error(validatedResponse.message || "Failed to add permissions");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for removing permissions from a role.
 */
export const useRolePermissionRemove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const url = endpoints.rbac.roles.removePermission.replace(":id", roleId);
      const rawResponse = await axiosInstance.patch(url, { permissions });
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse, variables) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Permissions removed successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.roles });
        queryClient.invalidateQueries({ queryKey: [...rbacQueryKey.roles, "detail", variables.roleId] });
      } else {
        message.error(validatedResponse.message || "Failed to remove permissions");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

export const useUserRoleUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const url = endpoints.rbac.roles.assignUser
        .replace(":roleId", roleId)
        .replace(":userId", userId);
      // Backend expects role assignment via path, payload can be empty or omitted
      const rawResponse = await axiosInstance.post(url, {});
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "User role updated successfully");
        queryClient.invalidateQueries({ queryKey: rbacQueryKey.users });
      } else {
        message.error(validatedResponse.message || "Failed to update user role");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};
