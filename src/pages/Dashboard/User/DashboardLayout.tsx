import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import AppLoadingFallback from "../../../components/AppLoadingFallback";
import PageTransition from "../../../components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "../../../components";
import { useGetUserInfo } from "../../../store/useAuthStore";
import { notification } from "antd";


const DashboardLayout = () => {

    const userInfo = useGetUserInfo("user");
    const location = useLocation();

  // If user hasn't submitted assessment, only allow access to overview and assessment pages
  //  🔒 Uncomment the below code to enforce assessment submission after it has been reviewed by the team and we are ready to enforce it for all users.
  if (!userInfo?.isAssessmentSubmitted &&
    location.pathname !== '/dashboard/overview' &&
    location.pathname !== '/dashboard/assessment' &&
    !location.pathname.startsWith('/dashboard/ai-interview')) {
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
      <section className="flex h-screen w-full">
        <Sidebar />
        <div className="grid grid-rows-[auto_1fr] grid-cols-1 w-full">
          <UserHeader />
          {/* Main Content */}
          <main className="bg-gray-100 p-6 overflow-y-auto w-full flex flex-col flex-1">
          <ErrorBoundary>
            <Suspense fallback={<AppLoadingFallback message="Loading data..." />}>
              <AnimatePresence mode="wait">
                <PageTransition nodeKey={location.pathname}>
                    <Outlet />
                </PageTransition>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
          </main>
        </div>
      </section>
    </>
  );
};

export default DashboardLayout;
