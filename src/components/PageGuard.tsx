import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAdminSession } from "../queries/auth.query";
import { usePermission } from "../hooks/usePermission";
import { ACTIONS } from "../utils/permissions";

interface PageGuardProps {
  resource: string;
  children: ReactNode;
}

/**
 * Page-level guard for React Router.
 */
export const PageGuard: React.FC<PageGuardProps> = ({ resource, children }) => {
  const { isAuthenticated, isLoading: isSessionLoading } = useAdminSession();
  const { can, isLoading: isPermissionLoading } = usePermission(resource);

  const isLoading = isSessionLoading || isPermissionLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Spin size="large" tip={`Accessing ${resource}...`} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin-login" replace />;
  }

  // Permission check: Need either MANAGE, VIEW, or VIEW_OWN
  const hasAccess = can(ACTIONS.MANAGE) || can(ACTIONS.VIEW) || can(ACTIONS.VIEW_OWN);

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Detect if user ONLY has 'view_own'
  const isViewOwnOnly = can(ACTIONS.VIEW_OWN) && !can(ACTIONS.VIEW) && !can(ACTIONS.MANAGE);

  // Inject viewOwn context to children
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Type safe injection of viewOwn prop
          return React.cloneElement(child as React.ReactElement<any>, { viewOwn: isViewOwnOnly });
        }
        return child;
      })}
    </>
  );
};

export default PageGuard;
