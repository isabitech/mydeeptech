import { useUserInfoStates } from "../store/useAuthStore";

/**
 * RBAC Utilities for frontend permission gating.
 */

export const useRBAC = () => {
    const { userInfo } = useUserInfoStates();

    const rolePermission = userInfo?.role_permission;
    const permissions = rolePermission?.permissions || [];
    const roleName = rolePermission?.name || userInfo?.role || "";
    const isActive = rolePermission?.isActive ?? true;

    /**
     * Check if user has a specific permission.
     * Treat 'manage' as satisfying all actions for a resource.
     * super_admin always has permission.
     */
    const hasPermission = (resource: string, action: string = "view"): boolean => {
        if (!isActive) return false;
        if (roleName === "super_admin" || userInfo?.role === "admin") return true;

        return permissions.some(p =>
            p.resource === resource && (p.action === action || p.action === "manage")
        );
    };

    /**
     * Check if user has any of the provided permissions.
     */
    const hasAnyPermission = (checks: { resource: string; action?: string }[]): boolean => {
        if (!isActive) return false;
        if (roleName === "super_admin" || userInfo?.role === "admin") return true;

        return checks.some(check => hasPermission(check.resource, check.action || "view"));
    };

    /**
     * Check if user has a specific role name.
     */
    const hasRole = (name: string): boolean => {
        return roleName === name;
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasRole,
        roleName,
        isActive,
        permissions
    };
};

/**
 * Helper to check route access before rendering.
 */
export const canAccessRoute = (userInfo: any, resource: string, action: string = "view"): boolean => {
    const rolePermission = userInfo?.role_permission;
    if (rolePermission && !rolePermission.isActive) return false;

    const roleName = rolePermission?.name || userInfo?.role || "";
    if (roleName === "super_admin" || userInfo?.role === "admin") return true;

    const permissions = rolePermission?.permissions || [];
    return permissions.some((p: any) =>
        p.resource === resource && (p.action === action || p.action === "manage")
    );
};
