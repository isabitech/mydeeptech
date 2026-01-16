import { useEffect } from "react";
import { Button, Spin, Alert } from "antd";
import { PlusSquareOutlined, ReloadOutlined } from "@ant-design/icons";
import { motion } from 'framer-motion';
import Header from "../../User/Header";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "../../../../hooks/Auth/Admin/useAdminDashboard";
import OverviewCards from "./components/OverviewCards";
import UserStatisticsCharts from "./components/UserStatisticsCharts";
import ProjectFinancialCharts from "./components/ProjectFinancialCharts";
import RecentActivitiesComponent from "./components/RecentActivitiesComponent";

const AdminOverview = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    dashboardData,
    getDashboardData,
    refreshDashboard
  } = useAdminDashboard();

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  const handleRefresh = async () => {
    await refreshDashboard();
  };

  if (error) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
        <Header title="Admin Overview" />
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 font-[gilroy-regular] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=""
      >
      </motion.div>
      <div className="flex flex-wrap gap-2">
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
        <Button
          type="primary"
          icon={<PlusSquareOutlined />}
          onClick={() => navigate("/admin/projects")}
        >
          New Project
        </Button>
      </div>

      {/* Content */}
      <Spin spinning={loading} tip="Loading dashboard data...">
        {dashboardData ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <OverviewCards data={dashboardData} />
            </motion.div>

            {/* User Statistics Charts */}
            {dashboardData.dtUserStatistics && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <UserStatisticsCharts data={dashboardData.dtUserStatistics} />
              </motion.div>
            )}

            {/* Project and Financial Charts */}
            {dashboardData.projectStatistics && dashboardData.invoiceStatistics && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <ProjectFinancialCharts
                  projectData={dashboardData.projectStatistics}
                  invoiceData={dashboardData.invoiceStatistics}
                  trendsData={dashboardData.trends}
                />
              </motion.div>
            )}

            {/* Recent Activities */}
            {dashboardData.recentActivities && dashboardData.topPerformers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <RecentActivitiesComponent
                  recentData={dashboardData.recentActivities}
                  topPerformers={dashboardData.topPerformers}
                />
              </motion.div>
            )}

            {/* Insights Section */}
            {dashboardData.insights && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Conversion Rates</h3>
                  <div className="space-y-2 text-sm">
                    <div>Email Verification: {dashboardData.insights.conversionRates.emailVerificationRate}%</div>
                    <div>Password Setup: {dashboardData.insights.conversionRates.passwordSetupRate}%</div>
                    <div>Result Submission: {dashboardData.insights.conversionRates.resultSubmissionRate}%</div>
                    <div>Approval Rate: {dashboardData.insights.conversionRates.approvalRate}%</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Financial Health</h3>
                  <div className="space-y-2 text-sm">
                    <div>Payment Rate: {dashboardData.insights.financialHealth.paymentRate}%</div>
                    <div>Avg Invoice: ${dashboardData.insights.financialHealth.averageInvoiceAmount}</div>
                    <div>Outstanding: ${dashboardData.insights.financialHealth.outstandingBalance.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Top Domains</h3>
                  <div className="space-y-2 text-sm">
                    {dashboardData.insights.domainDistribution.slice(0, 4).map((domain, index) => (
                      <div key={index}>{domain._id}: {domain.count}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-center text-gray-500 text-sm"
            >
              Last updated: {dashboardData.generatedAt ? new Date(dashboardData.generatedAt).toLocaleString() : 'N/A'}
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No dashboard data available</div>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default AdminOverview;
