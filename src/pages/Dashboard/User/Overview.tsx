import React, { useEffect } from 'react';
import { Row, Col, Spin, Alert, Button } from 'antd';
import { ReloadOutlined, UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import Header from './Header';
import { useDTUserDashboard } from '../../../hooks/User/useDTUserDashboard';
import ProfileCompletionCard from '../../../components/Dashboard/User/ProfileCompletionCard';
import FinancialSummaryCards from '../../../components/Dashboard/User/FinancialSummaryCards';
import ApplicationStatisticsCharts from '../../../components/Dashboard/User/ApplicationStatisticsCharts';
import AvailableOpportunitiesComponent from '../../../components/Dashboard/User/AvailableOpportunitiesComponent';
import RecentActivityTimeline from '../../../components/Dashboard/User/RecentActivityTimeline';

const Overview = () => {
  const { data, loading, error, getDashboardData, refreshDashboard } = useDTUserDashboard();

  // Fetch dashboard data on component mount
  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

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

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
        <Header title="DTUser Dashboard" />
        <hr />
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
          <span className="ml-3">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
        <Header title="DTUser Dashboard" />
        <hr />
        <div className="flex justify-center items-center h-64">
          <Alert
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
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
        <Header title="Your Dashboard" />
        <hr />
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
      className="h-full flex flex-col gap-4 font-[gilroy-regular]"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Header */}
      <motion.div variants={sectionVariants}>
        <Header title={`Welcome back, ${data?.userProfile?.fullName}`} />
      </motion.div>

      <hr />

      {/* Content */}
      <div className="h-full flex flex-col gap-6 overflow-auto px-2">
        {/* Profile Completion & Welcome Section */}
        {/* <motion.div variants={sectionVariants}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <ProfileCompletionCard 
                profileCompletion={data.profileCompletion}
                recommendations={data.recommendations}
              />
            </Col>
            <Col xs={24} lg={16}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserOutlined className="text-2xl" />
                  <div>
                    <h2 className="text-xl font-bold">Account Overview</h2>
                    <p className="text-blue-100">Your platform status and recent activity</p>
                  </div>
                </div>
                
                <Row gutter={[16, 16]} className="mt-4">
                  <Col xs={12}>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-blue-100">Annotator Status</div>
                      <div className="font-medium capitalize">{data.userProfile.annotatorStatus}</div>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-blue-100">Member Since</div>
                      <div className="font-medium">
                        {new Date(data.userProfile.joinedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-blue-100">Email Status</div>
                      <div className="font-medium">
                        {data.userProfile.isEmailVerified ? 'Verified' : 'Unverified'}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-sm text-blue-100">MicroTasker Status</div>
                      <div className="font-medium capitalize">{data.userProfile.microTaskerStatus}</div>
                    </div>
                  </Col>
                </Row>
              </motion.div>
            </Col>
          </Row>
        </motion.div> */}

        {/* Financial Summary */}
        <motion.div variants={sectionVariants}>
          <FinancialSummaryCards 
            financialSummary={data?.financialSummary}
            performanceMetrics={data?.performanceMetrics}
          />
        </motion.div>

        {/* Statistics and Analytics */}
        <motion.div variants={sectionVariants}>
          <ApplicationStatisticsCharts 
            applicationStatistics={data?.applicationStatistics}
            resultSubmissions={data?.resultSubmissions}
          />
        </motion.div>

        {/* Available Opportunities */}
        <motion.div variants={sectionVariants}>
          <AvailableOpportunitiesComponent 
            opportunities={data?.availableOpportunities}
          />
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div variants={sectionVariants}>
          <RecentActivityTimeline 
            recentActivity={data?.recentActivity}
          />
        </motion.div>

        {/* Dashboard Info Footer */}
        <motion.div 
          variants={sectionVariants}
          className="text-center text-sm text-gray-500 py-4 border-t"
        >
          <p>
            Dashboard generated on {new Date(data?.generatedAt).toLocaleString()} • 
            Activity timeframe: {data?.timeframe?.recentActivity} • 
            <Button type="link" size="small" onClick={refreshDashboard} className="p-0 ml-1">
              <ReloadOutlined /> Refresh
            </Button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;
