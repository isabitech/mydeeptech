import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation,  } from 'react-router-dom';
import { retrieveUserInfoFromStorage } from '../../helpers';
import { Loader } from 'lucide-react';

const ProtectDashboardLayout: React.FC = () => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Load user info on component mount
    useEffect(() => {
      const loadUserInfo = async () => {
        try {
          const result = await retrieveUserInfoFromStorage();
          setUserInfo(result);
        } catch (error) {
          console.error("Failed to load user info:", error);
        } finally {
          setLoading(false);
        }
      };
  
      loadUserInfo();
    }, []);


  if(loading) {
    return <div className="absolute top-0 left-0 z-[200] h-screen w-screen bg-gradient-to-br from-primary via-primary to-background-accent flex items-center justify-center p-4">
        <Loader className='text-white animate-spin'  />
    </div>
  }

  if (!loading && !userInfo) {
     return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />
}

export default ProtectDashboardLayout