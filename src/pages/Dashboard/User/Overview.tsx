import { Spin, Alert, Button, Card } from "antd";
import { ReloadOutlined, TeamOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

import FinancialSummaryCards from "../../../components/Dashboard/User/FinancialSummaryCards";
import ApplicationStatisticsCharts from "../../../components/Dashboard/User/ApplicationStatisticsCharts";
import AvailableOpportunitiesComponent from "../../../components/Dashboard/User/AvailableOpportunitiesComponent";
import RecentActivityTimeline from "../../../components/Dashboard/User/RecentActivityTimeline";
import NotificationCarousel from "./_components/notification-carousel";
import dashboardQueryService from "../../../services/dashboard-service/dashboard-query";
import ErrorMessage from "../../../lib/error-message";

const Overview = () => {

  const { 
    dashboardData, 
    isDashboardLoading, 
    isDashboardError, 
    dashboardError, 
    refreshDashboard
  } = dashboardQueryService.useDashboardQuery();
  const error = isDashboardError ? ErrorMessage(dashboardError) : "";


  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isDashboardLoading) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular] w-full">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
          <span className="ml-3">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (isDashboardError) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular] w-full">
       <Alert
          className="w-full"
            message="Dashboard Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={refreshDashboard}
                type="primary"
                className="bg-blue-500"
              >
                Retry
              </Button>
            }
          />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular] w-full">
        <div className="flex justify-center items-center h-64">
          <Alert
            message="No Data Available"
            description="Unable to load dashboard data at this time."
            type="info"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={refreshDashboard}
                type="primary"
                className="bg-blue-500"
              >
                Refresh
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full grid gap-5 lg:gap-10 font-[gilroy-regular]"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Notification Carousel Section */}
      <motion.div variants={sectionVariants}>
        <Card className="bg-gradient-to-r from-purple-500 to-blue-600 border-0 rounded-xl overflow-hidden">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 text-white text-6xl">
                <TeamOutlined />
              </div>
            </div>

            <div className="w-full overflow-hidden">
              <NotificationCarousel />
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap items-center gap-6 text-purple-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Active Community</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Real-time Support</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Project Updates</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Content */}
      <div className="flex flex-col gap-3 lg:gap-6 px-2 max-w-full flex-1">
        <motion.div variants={sectionVariants}>
          <FinancialSummaryCards
            financialSummary={dashboardData?.financialSummary}
            performanceMetrics={dashboardData?.performanceMetrics}
          />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <ApplicationStatisticsCharts
            applicationStatistics={dashboardData?.applicationStatistics}
            resultSubmissions={dashboardData?.resultSubmissions}
          />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <AvailableOpportunitiesComponent
            opportunities={dashboardData?.availableOpportunities}
          />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <RecentActivityTimeline
            recentActivity={dashboardData?.recentActivity}
          />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          className="text-center text-sm text-gray-500 py-4 border-t"
        >
          <p>
            Dashboard generated on{" "}
            {new Date(dashboardData?.generatedAt).toLocaleString()} • Activity timeframe:{" "}
            {dashboardData?.timeframe?.recentActivity} •
            <Button
              type="link"
              size="small"
              onClick={refreshDashboard}
              className="p-0 ml-1"
            >
              <ReloadOutlined /> Refresh
            </Button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;