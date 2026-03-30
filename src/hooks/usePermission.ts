import { useAdminSession } from "../queries/auth.query";
import { isSuperAdmin, hasPermission, hasAnyPermission, hasAllPermissions, Action } from "../utils/permissions";

export interface PermissionHook {
  can: (action: Action | string) => boolean;
  canAny: (actions: (Action | string)[]) => boolean;
  canAll: (actions: (Action | string)[]) => boolean;
  isLoading: boolean;
}

/**
 * The standard hook for permission checks within components.
 */
export const usePermission = (resource: string): PermissionHook => {
  const { roleName, permissions, isLoading, admin } = useAdminSession();

  // Enhanced loading check - ensure we have complete auth data
  const isActuallyLoading = isLoading || (!!admin && !admin.role_permission);

  /**
   * Check a single action on the current resource.
   */
  const can = (action: Action | string): boolean => {
    if (isActuallyLoading) return false;
    if (isSuperAdmin(roleName)) return true;
    return hasPermission(permissions, resource, action);
  };

  /**
   * Check if user has ANY of the specified actions.
   */
  const canAny = (actions: (Action | string)[] = []): boolean => {
    if (isActuallyLoading) return false;
    if (isSuperAdmin(roleName)) return true;
    return hasAnyPermission(permissions, resource, actions);
  };

  /**
   * Check if user has ALL of the specified actions.
   */
  const canAll = (actions: (Action | string)[] = []): boolean => {
    if (isActuallyLoading) return false;
    if (isSuperAdmin(roleName)) return true;
    return hasAllPermissions(permissions, resource, actions);
  };

  return {
    can,
    canAny,
    canAll,
    isLoading: isActuallyLoading,
  };
};
