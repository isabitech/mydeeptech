import React, { useState } from 'react';
import { Card, Tabs, Row, Col, Button, Space, Divider } from 'antd';
import { 
  DashboardOutlined, 
  DesktopOutlined, 
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import AdminActiveSessionsGrid from '../../../../components/Admin/HVNC/AdminActiveSessionsGrid';
import DeviceUtilizationView from '../../../../components/Admin/HVNC/DeviceUtilizationView';
import MonthlyTrackingView from '../../../../components/Admin/HVNC/MonthlyTrackingView';
import { HubstaffActiveSession } from '../../../../hooks/HVNC/Admin/useAdminHubstaff';

const { TabPane } = Tabs;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminHubstaffDashboardProps {
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminHubstaffDashboard: React.FC<AdminHubstaffDashboardProps> = ({
  className = '',
}) => {
  const [selectedSession, setSelectedSession] = useState<HubstaffActiveSession | null>(null);
  const [utilizationDeviceId, setUtilizationDeviceId] = useState<string>('');

  const handleSessionClick = (session: HubstaffActiveSession) => {
    setSelectedSession(session);
    setUtilizationDeviceId(session.deviceId);
  };

  const handleClearSelection = () => {
    setSelectedSession(null);
    setUtilizationDeviceId('');
  };

  return (
    <div className={`admin-hubstaff-dashboard ${className} p-6 min-h-screen bg-slate-50`}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <ClockCircleOutlined className="text-blue-500" />
              Hubstaff Time Tracking Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Monitor real-time activity and device utilization across all HVNC devices
            </p>
          </div>
          
          {selectedSession && (
            <Card size="small" className="bg-blue-50 border-blue-200">
              <div className="text-sm">
                <div className="font-semibold text-blue-700">Selected Device</div>
                <div className="text-blue-600">{selectedSession.deviceName}</div>
                <div className="text-blue-500 text-xs">
                  {selectedSession.currentUser.firstName} {selectedSession.currentUser.lastName}
                </div>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={handleClearSelection}
                  className="p-0 h-auto text-blue-500"
                >
                  Clear Selection
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Tabs defaultActiveKey="overview" size="large" className="hubstaff-dashboard-tabs">
        {/* Overview Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <DashboardOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          <div className="space-y-6">
            {/* Quick Stats Row */}
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <AdminActiveSessionsGrid 
                  onSessionClick={handleSessionClick}
                  className="active-sessions-section"
                />
              </Col>
            </Row>

            {selectedSession && (
              <>
                <Divider orientation="left">
                  <span className="text-lg font-semibold text-slate-700">
                    Device Detail: {selectedSession.deviceName}
                  </span>
                </Divider>
                
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <DeviceUtilizationView 
                      deviceId={utilizationDeviceId}
                      showDeviceSelector={false}
                      className="device-detail-section"
                    />
                  </Col>
                </Row>
              </>
            )}
          </div>
        </TabPane>

        {/* Active Sessions Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <UserOutlined />
              Active Sessions
            </span>
          }
          key="sessions"
        >
          <AdminActiveSessionsGrid 
            onSessionClick={handleSessionClick}
            autoRefresh={true}
          />
        </TabPane>

        {/* Device Analytics Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <BarChartOutlined />
              Device Analytics
            </span>
          }
          key="analytics"
        >
          <DeviceUtilizationView 
            deviceId={utilizationDeviceId}
            showDeviceSelector={true}
            showWeekSelector={true}
          />
        </TabPane>

        {/* All Devices Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <DesktopOutlined />
              All Devices
            </span>
          }
          key="devices"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Could add multiple DeviceUtilizationView components for different devices */}
              <DeviceUtilizationView 
                showDeviceSelector={true}
                showWeekSelector={false}
              />
              <DeviceUtilizationView 
                showDeviceSelector={true}
                showWeekSelector={false}
              />
            </div>
          </div>
        </TabPane>

        {/* Monthly Tracking Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <TrophyOutlined />
              Monthly Reports
            </span>
          }
          key="monthly"
        >
          <MonthlyTrackingView />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminHubstaffDashboard;