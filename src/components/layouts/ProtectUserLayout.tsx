import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation,  } from 'react-router-dom';
import { useGetUserInfo, useUserInfoActions } from '../../store/useAuthStore';
import { retrieveUserInfoFromStorage } from '../../helpers';
import { Spin } from 'antd';

const ProtectDashboardLayout: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const userInfo = useGetUserInfo("user");
    const location = useLocation();
    const { setUserInfo } = useUserInfoActions();

    // Load user info from encrypted storage if not in Zustand store
    useEffect(() => {
      const loadUserInfo = async () => {
        try {
          if (!userInfo) {
            const storedUserInfo = await retrieveUserInfoFromStorage('user');
            if (storedUserInfo) {
              setUserInfo(storedUserInfo);
            }
          }
        } catch (error) {
          console.error('❌ ProtectUserLayout: Error loading user info:', error);
        } finally {
          setLoading(false);
        }
      };
      loadUserInfo();
    }, [userInfo, setUserInfo]);

    // Show loading spinner while checking storage
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      );
    }

    if (!userInfo) {
      return <Navigate to="/login"  state={{ from: location }} replace />;
    }

    return <Outlet />
}

export default ProtectDashboardLayout;