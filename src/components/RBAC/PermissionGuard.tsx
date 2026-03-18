import React from "react";
import { useRBAC } from "../../utils/rbac-utils";

interface PermissionGuardProps {
    resource: string;
    action?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component-level guard to hide/show UI elements based on permissions.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
    resource, 
    action = "view", 
    children, 
    fallback = null 
}) => {
    const { hasPermission } = useRBAC();

    if (hasPermission(resource, action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default PermissionGuard;
