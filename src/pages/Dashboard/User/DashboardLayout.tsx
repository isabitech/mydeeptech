import { notification } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";
import { useUserInfoStates } from "../../../store/useAuthStore";
import AppLoadingFallback from "../../../components/AppLoadingFallback";
import PageTransition from "../../../components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "../../../components";


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
