import Sidebar from "./Sidebar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { retrieveTokenFromStorage, retrieveUserInfoFromStorage } from "../../../helpers";
import { useState, useEffect } from "react";
import UserHeader from "./UserHeader";
import { useLogin } from "../../../hooks/Auth/useLogin";
import { notification } from "antd";
import { useUserInfoActions, useUserInfoStates } from "../../../store/useAuthStore";


const DashboardLayout = () => {
  const [token, setToken] = useState<string>('');
    const { loading } = useLogin();
    const { setUserInfo,  } = useUserInfoActions();
    const { userInfo,  } = useUserInfoStates();
    const location = useLocation();
  
  useEffect(() => {
    const getToken = async () => {
      try {
        const retrievedToken = await retrieveTokenFromStorage();
        const result = await retrieveUserInfoFromStorage();
        setUserInfo(result);
        setToken(retrievedToken || '');
      } catch (error) {
        console.error('Failed to retrieve token:', error);
        setToken('');
      }
    };

    getToken();
  }, []);

  if(loading) {
    return <div className="h-screen w-screen bg-gradient-to-br from-primary via-primary to-background-accent flex items-center justify-center p-4">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading Dashboard...</p>
      </div>
    </div>
  }

    // If user hasn't submitted assessment, only allow access to overview and assessment pages
    if (!userInfo?.isAssessmentSubmitted && 
        location.pathname !== '/dashboard/overview' && 
        location.pathname !== '/dashboard/assessment') {
      notification.warning({
        key: 'assessment-required',
        message: "Assessment Required",
        description: "Please complete the assessment to access all dashboard features.",
        placement: "top",
      });
       return <Navigate to="/dashboard/overview" />;
    }
  

  return (
      <>
      <div className="flex h-screen w-full">
         <Sidebar />
        <div className="grid grid-rows-[auto_1fr] grid-cols-1 w-full">
         <UserHeader />
          {/* Main Content */}
          <div className="bg-gray-100 p-6 overflow-y-auto w-full flex flex-col flex-1">
            <Outlet />
          </div>
        </div>
      </div>
      </>
  );
};

export default DashboardLayout;
