import { useQuery } from "@tanstack/react-query";
import { resourceService } from "../api/rbac/resourceService";
import { ResourceModule, ResourceNode } from "../api/rbac/rbacSchema";

/**
 * Utility to transform a flat list of resources into a hierarchical tree.
 */
export const transformToTree = (resources: ResourceModule[]): ResourceNode[] => {
  const nodeMap = new Map<string, ResourceNode>();
  const roots: ResourceNode[] = [];

  // Create nodes and map them by ID
  resources.forEach(res => {
    nodeMap.set(res._id, { ...res, children: [] });
  });

  // Build tree
  resources.forEach(res => {
    const node = nodeMap.get(res._id)!;
    
    // Check if parent is a string (ID) or an object with _id
    const parentId = typeof res.parent === 'string' 
      ? res.parent 
      : (res.parent && typeof res.parent === 'object' ? res.parent._id : null);

    if (parentId && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort each level by sortOrder
  const sortNodes = (nodes: ResourceNode[]) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(roots);
  return roots;
};

/**
 * Hook to manage sidebar resources state, fetching, and transformation using TanStack Query.
 */
export const useSidebarResources = () => {
  const { 
    data: resources = [], 
    isLoading: loading, 
    error: queryError, 
    refetch 
  } = useQuery({
    queryKey: ["rbac", "sidebar_resources"],
    queryFn: async () => {
      const data = await resourceService.getMyAllowedResources();
      return transformToTree(data);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid aggressive polling on 401/403
  });

  // Format error string for the UI consistently with the previous implementation
  const error = queryError ? "No modules available. Please check your permissions." : null;

  return {
    resources,
    loading,
    error,
    refetch
  };
};
