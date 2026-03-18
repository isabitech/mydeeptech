import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { 
  resourceModuleSchema, 
  paginatedResponseSchema 
} from "./rbacSchema";
import { z } from "zod";

/**
 * Const query keys for Resource entities.
 */
export const resourceQueryKey = {
  all: ["rbac", "resources"] as const,
  detail: (id: string | null) => ["rbac", "resources", "detail", id] as const,
};

/**
 * Fetches the list of all resource modules.
 * @param params - Pagination and filter parameters.
 * @returns Validated list of resources.
 */
export const fetchResourceList = async (params: { q?: string; isPublished?: boolean } = {}) => {
  const rawResponse = await axiosInstance.get(endpoints.rbac.adminResources.all, { params });
  const validatedResponse = paginatedResponseSchema.parse(rawResponse.data);
  
  let rawItems: unknown[] = [];
  if (Array.isArray(validatedResponse.data)) {
    rawItems = validatedResponse.data;
  } else {
    rawItems = validatedResponse.data.resources || validatedResponse.data.data || [];
  }

  return {
    ...validatedResponse,
    data: rawItems.map((item) => resourceModuleSchema.parse(item)),
  };
};

/**
 * Query options for fetching the resource list.
 */
export const resourceListQueryOptions = (params: { q?: string; isPublished?: boolean } = {}) => 
  queryOptions({
    queryKey: [...resourceQueryKey.all, params],
    queryFn: () => fetchResourceList(params),
  });

/**
 * Fetches a single resource by ID.
 * @param id - The ID of the resource to fetch.
 */
export const fetchResourceById = async (id: string) => {
  const rawResponse = await axiosInstance.get(`${endpoints.rbac.adminResources.byId}/${id}`);
  const validatedResponse = z.object({
    success: z.boolean(),
    data: resourceModuleSchema,
  }).parse(rawResponse.data);
  return validatedResponse.data;
};

/**
 * Query options for fetching a single resource.
 */
export const resourceByIdQueryOptions = (id: string | null) => 
  queryOptions({
    queryKey: resourceQueryKey.detail(id),
    queryFn: () => fetchResourceById(id!),
    enabled: !!id,
  });
