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
 * Fetches the list of all resource modules or searches for them.
 * @param params - Pagination and filter parameters.
 * @returns Validated list of resources.
 */
export const fetchResourceList = async (params: { q?: string; isPublished?: boolean; all?: boolean } = {}) => {
  let url = endpoints.rbac.resources.base;
  const requestParams: Record<string, any> = {};

  if (params.q) {
    url = endpoints.rbac.resources.search;
    requestParams.q = params.q; // The backend Joi schema specifically requires 'q', not 'query'
  } else {
    // Determine whether to use 'all=true' flag based on filters
    if (params.isPublished === undefined || params.all) {
       requestParams.all = true;
    } else if (params.isPublished === false) {
       // if we only want drafts, we still need all=true to see them
       requestParams.all = true;
    }
  }

  const rawResponse = await axiosInstance.get(url, { params: requestParams });
  
  // The search endpoint might not return pagination directly
  const responseData = rawResponse.data;
  let rawItems: unknown[] = [];
  
  if (Array.isArray(responseData)) {
    rawItems = responseData;
  } else if (responseData?.data && Array.isArray(responseData.data)) {
    rawItems = responseData.data;
  } else if (responseData?.resources && Array.isArray(responseData.resources)) {
    rawItems = responseData.resources;
  } else if (responseData?.data?.resources && Array.isArray(responseData.data.resources)) {
    rawItems = responseData.data.resources;
  }

  return {
    success: responseData?.success ?? true,
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
  const url = endpoints.rbac.resources.byId.replace(":id", id);
  const rawResponse = await axiosInstance.get(url);
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

