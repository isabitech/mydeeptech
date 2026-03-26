import { notification } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import {  useUserInfoStates } from "../../../store/useAuthStore";


const DashboardLayout = () => {

    const { userInfo } = useUserInfoStates();
    const location = useLocation();
  
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
