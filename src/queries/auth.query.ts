import { useQuery } from "@tanstack/react-query";
import { parseAdmin, Admin, Permission } from "../schemas/permission.schema";
import { useUserInfoStates } from "../store/useAuthStore";

export interface AdminSession {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  roleName: string | null;
  permissions: Permission[];
  token: string | null;
}

/**
 * High-performance hook to fetch the current admin session from Zustand store.
 * Uses TanStack Query for optimal caching and reactive updates.
 */
export const useAdminSession = (): AdminSession => {
  const { userInfo } = useUserInfoStates();
  
  const query = useQuery({
    queryKey: ["adminSession", userInfo?.id],
    queryFn: () => {
      try {
        if (!userInfo) return null;
        
        // Parse the admin data using the same schema
        const { data } = parseAdmin(userInfo);
        
        return data;
      } catch (err) {
        console.warn("RBAC: Session parsing error", err);
        return null;
      }
    },
    staleTime: Infinity,
  });

  const admin = query.data || null;
  const isAuthenticated = !!admin && !!userInfo;
  const token = null; // Token is now handled separately in encrypted storage
  const role = admin?.role || null;
  const roleName = admin?.role_permission?.name || null;
  
  const permissions = (admin?.role_permission?.isActive !== false)
    ? (admin?.role_permission?.permissions || [])
    : [];

  return {
    admin,
    isLoading: query.isLoading,
    isAuthenticated,
    role,
    roleName,
    permissions,
    token,
  };
};
