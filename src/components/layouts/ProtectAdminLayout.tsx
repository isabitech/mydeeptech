import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetUserInfo } from '../../store/useAuthStore';

const ProtectAdminLayout: React.FC = () => {

  const location = useLocation();
  const adminInfo = useGetUserInfo("admin");

  // Redirect to login if no user info found
  if (!adminInfo) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  // Check if user role is active (RBAC)
  if (!adminInfo?.role_permission?.isActive) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  return <Outlet />
}

export default ProtectAdminLayout