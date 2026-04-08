import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAdminSession } from "../queries/auth.query";
import { usePermission } from "../hooks/usePermission";
import { ACTIONS } from "../utils/permissions";
import PageTransition from "./PageTransition";

interface PageGuardProps {
  resource: string;
  children: ReactNode;
}

/**
 * Page-level guard for React Router.
 */
const PageGuard: React.FC<PageGuardProps> = ({ resource, children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading: isSessionLoading } = useAdminSession();
  const { can, isLoading: isPermissionLoading } = usePermission(resource);

  const isLoading = isSessionLoading || isPermissionLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-3 text-gray-600">Accessing {resource}...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/admin-login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  const hasAccess = can(ACTIONS.MANAGE) || can(ACTIONS.VIEW) || can(ACTIONS.VIEW_OWN);

  if (!hasAccess) {
    // Wrap navigation in startTransition to avoid synchronous suspension issues
    return <Navigate to="/admin/overview" replace />;
  }

  const isViewOwnOnly = can(ACTIONS.VIEW_OWN) && !can(ACTIONS.VIEW) && !can(ACTIONS.MANAGE);

  return (
    <PageTransition nodeKey={location.pathname}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ viewOwn?: boolean }>,
            { viewOwn: isViewOwnOnly }
          );
        }
        return child;
      })}
    </PageTransition>
  );
};

export default PageGuard;