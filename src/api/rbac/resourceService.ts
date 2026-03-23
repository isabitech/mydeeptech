import { endpoints } from "../../store/api/endpoints";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../../service/apiUtils";
import { ResourceModule, apiResponseSchema, paginatedResponseSchema } from "./rbacSchema";

/**
 * Service for Resource Management and Sidebar integration.
 */
export const resourceService = {
  /**
   * Fetches resources allowed for the current user (for the sidebar).
   */
  async getMyAllowedResources(): Promise<ResourceModule[]> {
    const response = await apiGet(endpoints.rbac.resources.meAllowed);
    const parsed = apiResponseSchema.parse(response);
    return parsed.data as ResourceModule[];
  },

  /**
   * Admin: Fetches all resources.
   * @param includeUnpublished Whether to include unpublished resources (all=true).
   */
  async getAllResources(includeUnpublished = false): Promise<ResourceModule[]> {
    const url = `${endpoints.rbac.resources.base}${includeUnpublished ? '?all=true' : ''}`;
    const response = await apiGet(url);
    const parsed = paginatedResponseSchema.parse(response);
    
    // Handle list if it's nested in data.resources or just data
    if (Array.isArray(parsed.data)) {
      return parsed.data as ResourceModule[];
    }
    return (parsed.data as any).resources || (parsed.data as any).data || [];
  },

  /**
   * Admin: Creates a new resource.
   */
  async createResource(resource: Omit<ResourceModule, '_id' | 'createdAt' | 'updatedAt'>): Promise<ResourceModule> {
    const response = await apiPost(endpoints.rbac.resources.base, resource);
    const parsed = apiResponseSchema.parse(response);
    return parsed.data as ResourceModule;
  },

  /**
   * Fetches a single resource by ID.
   */
  async getResourceById(id: string): Promise<ResourceModule> {
    const url = endpoints.rbac.resources.byId.replace(':id', id);
    const response = await apiGet(url);
    const parsed = apiResponseSchema.parse(response);
    return parsed.data as ResourceModule;
  },

  /**
   * Admin: Updates an existing resource.
   */
  async updateResource(id: string, resource: Partial<ResourceModule>): Promise<ResourceModule> {
    const url = endpoints.rbac.resources.byId.replace(':id', id);
    const response = await apiPut(url, resource);
    const parsed = apiResponseSchema.parse(response);
    return parsed.data as ResourceModule;
  },

  /**
   * Admin: Toggles the publish status of a resource.
   */
  async togglePublish(id: string): Promise<ResourceModule> {
    const url = endpoints.rbac.resources.togglePublish.replace(':id', id);
    const response = await apiPatch(url, {});
    const parsed = apiResponseSchema.parse(response);
    return parsed.data as ResourceModule;
  },

  /**
   * Admin: Deletes a resource.
   */
  async deleteResource(id: string): Promise<void> {
    const url = endpoints.rbac.resources.byId.replace(':id', id);
    await apiDelete(url);
  },

  /**
   * Searches published resources.
   */
  async searchResources(query: string): Promise<ResourceModule[]> {
    const url = `${endpoints.rbac.resources.search}?q=${encodeURIComponent(query)}`;
    const response = await apiGet(url);
    const parsed = apiResponseSchema.parse(response);
    return parsed.data as ResourceModule[];
  }
};
