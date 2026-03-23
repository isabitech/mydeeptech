/**
 * Single Source of Truth for RBAC Actions.
 * These must be used across the codebase to ensure consistency.
 */
export const ACTIONS = {
  VIEW: "view",
  VIEW_OWN: "view_own",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  APPROVE: "approve",
  MANAGE: "manage",
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

export interface Permission {
  name: string;
  resource: string;
  action: Action | string;
}

/**
 * Check if a user has a specific permission on a resource.
 *
 * Rules:
 * 1. 'manage' action supersedes everything (except 'view_own').
 * 2. 'view_own' is always checked explicitly.
 */
export const hasPermission = (
  permissions: Permission[] = [],
  resource: string,
  action: Action | string
): boolean => {
  if (!permissions || !Array.isArray(permissions)) return false;

  const resourcePermissions = permissions.filter((p) => p.resource === resource);
  const actions = resourcePermissions.map((p) => p.action);

  // 'manage' bypass
  if (actions.includes(ACTIONS.MANAGE) && action !== ACTIONS.VIEW_OWN) {
    return true;
  }

  return actions.includes(action);
};

/**
 * Return all actions a user can perform on a specific resource.
 */
export const getResourcePermissions = (
  permissions: Permission[] = [],
  resource: string
): (Action | string)[] => {
  if (!permissions) return [];
  return permissions
    .filter((p) => p.resource === resource)
    .map((p) => p.action);
};

/**
 * Super Admin bypass utility.
 */
export const isSuperAdmin = (roleName: string | null | undefined): boolean =>
  roleName === "super_admin";

/**
 * Check if user has ANY of the specified actions on a resource.
 */
export const hasAnyPermission = (
  permissions: Permission[] = [],
  resource: string,
  actions: (Action | string)[] = []
): boolean => {
  return actions.some((action) => hasPermission(permissions, resource, action));
};

/**
 * Check if user has ALL of the specified actions on a resource.
 */
export const hasAllPermissions = (
  permissions: Permission[] = [],
  resource: string,
  actions: (Action | string)[] = []
): boolean => {
  return actions.every((action) => hasPermission(permissions, resource, action));
};


export const getDefaultRedirectPath = (permissions: Permission[] = [], roleName: string | null | undefined): string => {
  if (isSuperAdmin(roleName)) return "/admin/overview";

  const priorities = [
    { resource: "overview", path: "/admin/overview" },
    { resource: "projects", path: "/admin/projects" },
    { resource: "applications", path: "/admin/applications" },
    { resource: "invoice", path: "/admin/invoices" },
    { resource: "users", path: "/admin/users" },
    { resource: "annotators", path: "/admin/annotators" },
    { resource: "notifications", path: "/admin/notifications" },
    { resource: "settings", path: "/admin/settings" },
  ];

  for (const item of priorities) {
    const hasAccess =
      hasPermission(permissions, item.resource, ACTIONS.VIEW) ||
      hasPermission(permissions, item.resource, ACTIONS.MANAGE) ||
      hasPermission(permissions, item.resource, ACTIONS.VIEW_OWN);

    if (hasAccess) return item.path;
  }

  return "/admin/overview"; // Default fallback
};
