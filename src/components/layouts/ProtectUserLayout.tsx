import React from 'react'
import { Navigate, Outlet, useLocation,  } from 'react-router-dom';
import { useGetUserInfo } from '../../store/useAuthStore';

const ProtectDashboardLayout: React.FC = () => {

    const userInfo = useGetUserInfo("user");
    const location = useLocation();

    if (!userInfo) {
      return <Navigate to="/login"  state={{ from: location }} replace />;
    }

    return <Outlet />
}

export default ProtectDashboardLayout