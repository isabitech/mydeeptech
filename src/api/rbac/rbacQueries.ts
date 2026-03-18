import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { 
  permissionSchema, 
  roleSchema, 
  rbacUserSchema, 
  paginatedResponseSchema 
} from "./rbacSchema";
import { z } from "zod";

/**
 * Const query keys for RBAC entities.
 */
export const rbacQueryKey = {
  permissions: ["rbac", "permissions"] as const,
  roles: ["rbac", "roles"] as const,
  users: ["rbac", "users"] as const,
};

/**
 * Fetches the list of all permissions.
 * @param params - Pagination and filter parameters.
 * @returns Validated list of permissions.
 */
export const fetchPermissionList = async (params: { page?: number; limit?: number } = {}) => {
  const rawResponse = await axiosInstance.get(endpoints.rbac.permissions.all, { params });
  const validatedResponse = paginatedResponseSchema.parse(rawResponse.data);
  
  let rawItems: unknown[] = [];
  if (Array.isArray(validatedResponse.data)) {
    rawItems = validatedResponse.data;
  } else {
    rawItems = validatedResponse.data.permissions || validatedResponse.data.data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => permissionSchema.parse(item)),
  };
};

/**
 * Query options for fetching the permission list.
 */
export const permissionListQueryOptions = (params: { page?: number; limit?: number } = {}) => 
  queryOptions({
    queryKey: [...rbacQueryKey.permissions, params],
    queryFn: () => fetchPermissionList(params),
  });

/**
 * Searches for permissions by name.
 * @param name - Search query name.
 * @param params - Pagination parameters.
 * @returns Validated search results.
 */
export const fetchPermissionSearch = async (name: string, params: { page?: number; limit?: number } = {}) => {
  const rawResponse = await axiosInstance.get(endpoints.rbac.permissions.search, { 
    params: { ...params, name } 
  });
  const validatedResponse = paginatedResponseSchema.parse(rawResponse.data);

  let rawItems: unknown[] = [];
  if (Array.isArray(validatedResponse.data)) {
    rawItems = validatedResponse.data;
  } else {
    rawItems = validatedResponse.data.permissions || validatedResponse.data.data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => permissionSchema.parse(item)),
  };
};

/**
 * Query options for searching permissions.
 */
export const permissionSearchQueryOptions = (name: string, params: { page?: number; limit?: number } = {}) => 
  queryOptions({
    queryKey: [...rbacQueryKey.permissions, "search", name, params],
    queryFn: () => fetchPermissionSearch(name, params),
    enabled: name.length > 0,
  });

/**
 * Fetches the list of all roles.
 * @param params - Pagination parameters.
 * @returns Validated list of roles.
 */
export const fetchRoleList = async (params: { page?: number; limit?: number } = {}) => {
  const rawResponse = await axiosInstance.get(endpoints.rbac.roles.all, { params });
  const validatedResponse = paginatedResponseSchema.parse(rawResponse.data);

  let rawItems: unknown[] = [];
  if (Array.isArray(validatedResponse.data)) {
    rawItems = validatedResponse.data;
  } else {
    rawItems = validatedResponse.data.roles || validatedResponse.data.data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => roleSchema.parse(item)),
  };
};

/**
 * Query options for fetching the role list.
 */
export const roleListQueryOptions = (params: { page?: number; limit?: number } = {}) => 
  queryOptions({
    queryKey: [...rbacQueryKey.roles, params],
    queryFn: () => fetchRoleList(params),
  });

/**
 * Fetches a single role by ID.
 * @param roleId - The ID of the role to fetch.
 * @returns Validated role object.
 */
export const fetchRoleById = async (roleId: string) => {
  const rawResponse = await axiosInstance.get(`${endpoints.rbac.roles.byId}/${roleId}`);
  // Assuming single item responses might be wrapped in a success/data shape
  const validatedResponse = z.object({
    success: z.boolean(),
    data: roleSchema,
  }).parse(rawResponse.data);
  return validatedResponse.data;
};

/**
 * Query options for fetching a single role.
 */
export const roleByIdQueryOptions = (roleId: string | null) => 
  queryOptions({
    queryKey: [...rbacQueryKey.roles, "detail", roleId],
    queryFn: () => fetchRoleById(roleId!),
    enabled: !!roleId,
  });

/**
 * Fetches the list of users with their RBAC information.
 * @param params - Pagination and search parameters.
 * @returns Validated list of users.
 */
export const fetchUserList = async (params: { page?: number; limit?: number; search?: string } = {}) => {
  const rawResponse = await axiosInstance.get(endpoints.rbac.users.all, { params });
  const validatedResponse = paginatedResponseSchema.parse(rawResponse.data);

  let rawItems: unknown[] = [];
  if (Array.isArray(validatedResponse.data)) {
    rawItems = validatedResponse.data;
  } else {
    rawItems = validatedResponse.data.users || validatedResponse.data.data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => rbacUserSchema.parse(item)),
  };
};

/**
 * Query options for fetching the user list for RBAC.
 */
export const userListQueryOptions = (params: { page?: number; limit?: number; search?: string } = {}) => 
  queryOptions({
    queryKey: [...rbacQueryKey.users, params],
    queryFn: () => fetchUserList(params),
  });
