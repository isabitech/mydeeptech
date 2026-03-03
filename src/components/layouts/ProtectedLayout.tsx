import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useUserInfoStates } from '../../store/useAuthStore';

const ProtectedLayout: React.FC = () => {

    const { userInfo, userRoleType } = useUserInfoStates();
    
    // Redirect to login if no user information
    if (!userInfo) {
      return <Navigate to={userRoleType === 'admin' ? '/auth/admin-login' : '/login'} replace />;
    }

  return  <Outlet />
}

export default ProtectedLayout