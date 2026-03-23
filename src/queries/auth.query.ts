import { useQuery } from "@tanstack/react-query";
import { parseAdmin, Admin, Permission } from "../schemas/permission.schema";

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
 * High-performance hook to fetch the current admin session from local storage.
 * Uses TanStack Query for optimal caching and reactive updates.
 */
export const useAdminSession = (): AdminSession => {
  const query = useQuery({
    queryKey: ["adminSession"],
    queryFn: () => {
      try {
        const rawJson = localStorage.getItem("adminInfo");
        if (!rawJson) return null;
        
        const rawData = JSON.parse(rawJson);
        const { data } = parseAdmin(rawData);
        
        return data;
      } catch (err) {
        console.warn("RBAC: FATAL session read error", err);
        return null;
      }
    },
    staleTime: Infinity,
  });

  const admin = query.data || null;
  const isAuthenticated = !!admin;
  const token = localStorage.getItem("adminToken");
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
