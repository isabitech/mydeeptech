import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { message } from "antd";
import { apiResponseSchema } from "./rbacSchema";
import { resourceQueryKey } from "./resourceQueries";

/**
 * Hook for creating a new resource module.
 */
export const useResourceCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rawPayload: unknown) => {
      const rawResponse = await axiosInstance.post(endpoints.rbac.resources.base, rawPayload);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Resource created successfully");
        queryClient.invalidateQueries({ queryKey: resourceQueryKey.all });
      } else {
        message.error(validatedResponse.message || "Failed to create resource");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for updating an existing resource module.
 */
export const useResourceUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rawPayload }: { id: string; rawPayload: unknown }) => {
      const url = endpoints.rbac.resources.byId.replace(":id", id);
      const rawResponse = await axiosInstance.put(url, rawPayload);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse, variables) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Resource updated successfully");
        queryClient.invalidateQueries({ queryKey: resourceQueryKey.all });
        queryClient.invalidateQueries({ queryKey: resourceQueryKey.detail(variables.id) });
      } else {
        message.error(validatedResponse.message || "Failed to update resource");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for deleting a resource module.
 */
export const useResourceDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = endpoints.rbac.resources.byId.replace(":id", id);
      const rawResponse = await axiosInstance.delete(url);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Resource deleted successfully");
        queryClient.invalidateQueries({ queryKey: resourceQueryKey.all });
      } else {
        message.error(validatedResponse.message || "Failed to delete resource");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

/**
 * Hook for toggling the published status of a resource module.
 */
export const useResourceTogglePublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = endpoints.rbac.resources.togglePublish.replace(":id", id);
      const rawResponse = await axiosInstance.patch(url);
      return apiResponseSchema.parse(rawResponse.data);
    },
    onSuccess: (validatedResponse, id) => {
      if (validatedResponse.success) {
        message.success(validatedResponse.message || "Status toggled successfully");
        queryClient.invalidateQueries({ queryKey: resourceQueryKey.all });
        queryClient.invalidateQueries({ queryKey: resourceQueryKey.detail(id) });
      } else {
        message.error(validatedResponse.message || "Failed to toggle status");
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : "An unexpected error occurred");
    },
  });
};

