import React from 'react';
import { Card, Row, Col, Divider } from 'antd';
import { 
  ClockCircleOutlined, 
  DashboardOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import HubstaffTimerWidget from '../../../components/Admin/HVNC/HubstaffTimerWidget';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserHubstaffDashboardProps {
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const UserHubstaffDashboard: React.FC<UserHubstaffDashboardProps> = ({
  className = '',
}) => {
  return (
    <div className={`user-hubstaff-dashboard ${className} p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <ClockCircleOutlined className="text-blue-500" />
          My Time Tracking
        </h1>
        <p className="text-slate-600 text-lg">
          Monitor your work sessions and track your productivity on HVNC devices
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Timer Widget */}
        <Col xs={24} lg={16}>
          <HubstaffTimerWidget 
            showWeeklySummary={true}
            className="main-timer-widget"
          />
        </Col>

        {/* Side Panel */}
        <Col xs={24} lg={8}>
          <div className="space-y-6">
            {/* Quick Tips Card */}
            <Card 
              title={
                <span className="flex items-center gap-2">
                  <TrophyOutlined className="text-orange-500" />
                  Productivity Tips
                </span>
              }
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">→</span>
                  <span>Keep your Hubstaff timer running while working on HVNC devices</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">→</span>
                  <span>Take regular breaks to maintain productivity</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">→</span>
                  <span>Check your weekly goals in the summary section</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">→</span>
                  <span>Contact support if you notice timing discrepancies</span>
                </div>
              </div>
            </Card>

            {/* Weekly Goals Card */}
            <Card 
              title={
                <span className="flex items-center gap-2">
                  <CalendarOutlined className="text-green-500" />
                  Weekly Target
                </span>
              }
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">40 hours</div>
                <div className="text-sm text-slate-600 mb-4">
                  Standard weekly target
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-700 font-medium">
                    💡 Tip: Aim for 8 hours per day to meet your weekly goal
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Info Card */}
            <Card 
              title={
                <span className="flex items-center gap-2">
                  <DashboardOutlined className="text-blue-500" />
                  Session Info
                </span>
              }
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Timer Status:</span>
                  <span className="font-medium">🔄 Live Sync</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Data Updates:</span>
                  <span className="font-medium">Real-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Timezone:</span>
                  <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
                <Divider className="my-2" />
                <div className="text-xs text-slate-500 text-center">
                  Your time tracking data is automatically synchronized with Hubstaff
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Compact Timer Widget for Mobile/Smaller Screens */}
      <Row className="mt-8">
        <Col span={24}>
          <Card 
            title="Quick Access Timer"
            className="lg:hidden"
          >
            <HubstaffTimerWidget 
              showWeeklySummary={false}
              className="compact-timer"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserHubstaffDashboard;