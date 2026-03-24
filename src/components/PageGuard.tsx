import React, { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
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
    return (
      <Navigate
        to="/auth/admin-login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  const hasAccess =
    can(ACTIONS.MANAGE) || can(ACTIONS.VIEW) || can(ACTIONS.VIEW_OWN);

  if (!hasAccess) {
    navigate(-1);
    return null;
  }

  const isViewOwnOnly =
    can(ACTIONS.VIEW_OWN) && !can(ACTIONS.VIEW) && !can(ACTIONS.MANAGE);

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ viewOwn?: boolean }>,
            { viewOwn: isViewOwnOnly },
          );
        }
        return child;
      })}
    </>
  );
};

export default PageGuard;
