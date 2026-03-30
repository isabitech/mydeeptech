import React from 'react'
import { Navigate, Outlet, useLocation,  } from 'react-router-dom';
import { useUserInfoStates } from '../../store/useAuthStore';

const ProtectDashboardLayout: React.FC = () => {

    const { userInfo } = useUserInfoStates();
    const location = useLocation();

    if (!userInfo) {
      return <Navigate to="/login"  state={{ from: location }} replace />;
    }

    return <Outlet />
}

export default ProtectDashboardLayout