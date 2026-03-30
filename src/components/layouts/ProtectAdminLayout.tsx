import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { retrieveUserInfoFromStorage } from '../../helpers';
import { useUserInfoActions, useUserInfoStates, useUserInfoStore } from '../../store/useAuthStore';
import LoadingIndicator from '../LoadingIndicator';

const ProtectAdminLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { setUserInfo } = useUserInfoActions();
  const { userInfo } = useUserInfoStates();

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // If user info already exists in store, use it
        if (userInfo?.id) {
          setLoading(false);
          return;
        }

        // Allow time for Zustand store to hydrate from sessionStorage
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if UserInfo is now available after hydration
        const currentUserInfo = useUserInfoStore.getState().userInfo;
        if (currentUserInfo?.id) {
          setLoading(false);
          return;
        }

        // Try to load from encrypted sessionStorage
        const encryptedUserInfo = await retrieveUserInfoFromStorage();
        if (encryptedUserInfo) {
          setUserInfo(encryptedUserInfo);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error loading user information:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [setUserInfo, userInfo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingIndicator />
  }

  // Redirect to login if no user info found
  if (!userInfo) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  // Check if user role is active (RBAC)
  if (userInfo.role_permission?.isActive === false) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  return <Outlet />
}

export default ProtectAdminLayout