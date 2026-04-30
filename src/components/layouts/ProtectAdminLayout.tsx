import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetUserInfo, useUserInfoActions } from '../../store/useAuthStore';
import { retrieveUserInfoFromStorage } from '../../helpers';
import { Spin } from 'antd';

const ProtectAdminLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const adminInfo = useGetUserInfo("admin");
  const { setUserInfo } = useUserInfoActions();

  // Load admin info from encrypted storage if not in Zustand store
  useEffect(() => {
    const loadAdminInfo = async () => {
      try {
        if (!adminInfo) {
          const storedAdminInfo = await retrieveUserInfoFromStorage('admin');
          if (storedAdminInfo) {
            setUserInfo(storedAdminInfo);
          }
        }
      } catch (error) {
        console.error('❌ ProtectAdminLayout: Error loading admin info:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAdminInfo();
  }, [adminInfo, setUserInfo]);

  // Show loading spinner while checking storage
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

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