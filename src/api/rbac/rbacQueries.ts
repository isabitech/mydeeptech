import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import {
  permissionSchema,
  roleSchema,
  rbacUserSchema,
  paginatedResponseSchema,
  apiResponseSchema,
  Role,
  RbacUser,
  Permission
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

  const parseResult = paginatedResponseSchema.safeParse(rawResponse.data);
  if (!parseResult.success) {
    console.error("RBAC: Permission list root parsing failed", parseResult.error, rawResponse.data);
    return { success: false, data: [] };
  }

  const validatedResponse = parseResult.data;
  let rawItems: unknown[] = [];
  const dataRef = validatedResponse.data;

  if (Array.isArray(dataRef)) {
    rawItems = dataRef;
  } else if (dataRef && typeof dataRef === 'object') {
    rawItems = (dataRef as any).permissions || (dataRef as any).data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => {
      const parsed = permissionSchema.safeParse(item);
      if (!parsed.success) {
        console.error("RBAC: Failed to parse permission item:", item, parsed.error);
        return null;
      }
      return parsed.data;
    }).filter((item): item is Permission => item !== null),
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
    params: { q: name, ...params }
  });

  const parseResult = paginatedResponseSchema.safeParse(rawResponse.data);
  if (!parseResult.success) {
    console.error("RBAC: Permission search root parsing failed", parseResult.error, rawResponse.data);
    return { success: false, data: [] };
  }

  const validatedResponse = parseResult.data;
  let rawItems: unknown[] = [];
  const dataRef = validatedResponse.data;

  if (Array.isArray(dataRef)) {
    rawItems = dataRef;
  } else if (dataRef && typeof dataRef === 'object') {
    rawItems = (dataRef as any).permissions || (dataRef as any).data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => {
      const parsed = permissionSchema.safeParse(item);
      if (!parsed.success) {
        console.error("RBAC: Failed to parse permission item during search:", item, parsed.error);
        return null;
      }
      return parsed.data;
    }).filter((item): item is Permission => item !== null),
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

  const parseResult = paginatedResponseSchema.safeParse(rawResponse.data);
  if (!parseResult.success) {
    console.error("RBAC: Role list root parsing failed", parseResult.error, rawResponse.data);
    return { success: false, data: [] };
  }

  const validatedResponse = parseResult.data;
  let rawItems: unknown[] = [];
  const dataRef = validatedResponse.data;

  if (Array.isArray(dataRef)) {
    rawItems = dataRef;
  } else if (dataRef && typeof dataRef === 'object') {
    rawItems = (dataRef as any).roles || (dataRef as any).data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => {
      const parsed = roleSchema.safeParse(item);
      if (!parsed.success) {
        console.error("RBAC: Failed to parse role item:", item, parsed.error);
        return null;
      }
      return parsed.data;
    }).filter((item): item is Role => item !== null),
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


export const fetchRoleById = async (roleId: string) => {
  const rawResponse = await axiosInstance.get(`${endpoints.rbac.roles.byId}/${roleId}`);

  const apiParseResult = apiResponseSchema.safeParse(rawResponse.data);
  if (!apiParseResult.success) {
    console.error("RBAC: Role by ID API parsing failed", apiParseResult.error, rawResponse.data);
    throw new Error("Failed to parse API response");
  }

  const validatedResponse = apiParseResult.data;
  const roleParseResult = roleSchema.safeParse(validatedResponse.data);

  if (!roleParseResult.success) {
    console.error("RBAC: Role by ID role object parsing failed", roleParseResult.error, validatedResponse.data);
    throw new Error("Failed to parse role object");
  }

  return roleParseResult.data;
};


export const roleByIdQueryOptions = (roleId: string | null) =>
  queryOptions({
    queryKey: [...rbacQueryKey.roles, "detail", roleId],
    queryFn: () => fetchRoleById(roleId!),
    enabled: !!roleId,
  });


export const fetchUserList = async (params: { page?: number; limit?: number; search?: string } = {}) => {
  const rawResponse = await axiosInstance.get(endpoints.rbac.users.all, { params });

  const parseResult = paginatedResponseSchema.safeParse(rawResponse.data);
  if (!parseResult.success) {
    console.error("RBAC: User list root parsing failed", parseResult.error, rawResponse.data);
    return { success: false, data: [] };
  }

  const validatedResponse = parseResult.data;
  let rawItems: unknown[] = [];
  const dataRef = validatedResponse.data;

  if (Array.isArray(dataRef)) {
    rawItems = dataRef;
  } else if (dataRef && typeof dataRef === 'object') {
    rawItems = (dataRef as any).adminUsers || (dataRef as any).users || (dataRef as any).data || (dataRef as any).admins || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => {
      const parsed = rbacUserSchema.safeParse(item);
      if (!parsed.success) {
        console.error("RBAC: Failed to parse user item:", item, parsed.error);
        return null;
      }
      return parsed.data;
    }).filter((item): item is RbacUser => item !== null),
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
