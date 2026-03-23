import React, { ReactNode } from "react";
import { usePermission } from "../hooks/usePermission";
import { Action } from "../utils/permissions";

interface PermissionGateProps {
  resource: string;
  action?: Action | string;
  actions?: (Action | string)[];
  require?: "any" | "all";
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Higher-order component to conditionally render UI sections based on permission.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  resource, 
  action, 
  actions = [], 
  require = "any", 
  fallback = null, 
  children 
}) => {
  const { can, canAny, canAll, isLoading } = usePermission(resource);

  // Development warnings
  if (process.env.NODE_ENV === "development" && action && actions.length > 0) {
    console.warn(`PermissionGate: Both 'action' and 'actions' passed for ${resource}. Preferring 'action'.`);
  }

  // Loading state: Minimal inline skeleton
  if (isLoading) {
    return <div className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded-full opacity-50" />;
  }

  let isAuthorized = false;

  if (action) {
    isAuthorized = can(action);
  } else if (actions.length > 0) {
    isAuthorized = require === "all" ? canAll(actions) : canAny(actions);
  } else {
     // If no action specified, assume view permission is enough
     isAuthorized = can("view");
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;
