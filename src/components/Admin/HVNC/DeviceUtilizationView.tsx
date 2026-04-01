import React, { useEffect, useState } from 'react';
import { Card, Statistic, Select, Spin, Alert, Button, Progress } from 'antd';
import { 
  DesktopOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ReloadOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useAdminHubstaff, DeviceUtilization } from '../../../hooks/HVNC/Admin/useAdminHubstaff';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeviceUtilizationViewProps {
  deviceId?: string;
  className?: string;
  showDeviceSelector?: boolean;
  showWeekSelector?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  title: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
  loading?: boolean;
}> = ({ title, value, color, icon, loading }) => (
  <Card size="small" className="text-center h-full">
    <Statistic
      title={
        <div className="flex items-center justify-center gap-2 text-sm">
          {icon}
          <span>{title}</span>
        </div>
      }
      value={value}
      loading={loading}
      valueStyle={{ color, fontWeight: 'bold' }}
      prefix={icon && <span className="text-slate-400">{icon}</span>}
    />
  </Card>
);

const SessionsTimeline: React.FC<{
  sessions: Array<{
    userName: string;
    workedHours: number;
    startTime: string;
    endTime: string;
  }>;
}> = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <ClockCircleOutlined className="text-2xl mb-2" />
        <p>No sessions recorded for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-blue-500" />
              <span className="font-semibold text-slate-800">{session.userName}</span>
            </div>
            <div className="text-sm font-medium text-slate-600">
              {session.workedHours.toFixed(1)}h
            </div>
          </div>
          <div className="text-sm text-slate-500 flex items-center justify-between">
            <span>{session.startTime} - {session.endTime}</span>
            <Progress 
              percent={Math.min((session.workedHours / 8) * 100, 100)}
              size="small"
              strokeColor="#1890ff"
              className="w-24"
              showInfo={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const WeekSelector: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const getWeekLabel = (weekOffset: number) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() - (weekOffset * 7)));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === 1) return 'Last Week';
    
    return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      className="w-48"
      options={[
        { value: 0, label: getWeekLabel(0) },
        { value: 1, label: getWeekLabel(1) },
        { value: 2, label: getWeekLabel(2) },
        { value: 3, label: getWeekLabel(3) },
      ]}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DeviceUtilizationView: React.FC<DeviceUtilizationViewProps> = ({
  deviceId,
  className = '',
  showDeviceSelector = true,
  showWeekSelector = true,
}) => {
  const {
    deviceUtilization,
    utilizationLoading,
    fetchDeviceUtilization,
    devices,
    devicesLoading,
    fetchDevicesStatus,
    error,
    clearError,
  } = useAdminHubstaff();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(deviceId || '');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  // ─── Load devices on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (showDeviceSelector) {
      fetchDevicesStatus();
    }
  }, [showDeviceSelector, fetchDevicesStatus]);

  // ─── Set initial device when devices load ────────────────────────────────────
  useEffect(() => {
    if (!selectedDeviceId && devices.length > 0 && !deviceId) {
      setSelectedDeviceId(devices[0].deviceId);
    }
  }, [devices, selectedDeviceId, deviceId]);

  // ─── Load utilization data when device or week changes ───────────────────────
  useEffect(() => {
    if (selectedDeviceId) {
      fetchDeviceUtilization(selectedDeviceId, selectedWeek);
    }
  }, [selectedDeviceId, selectedWeek, fetchDeviceUtilization]);

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
  };

  const handleWeekChange = (newWeek: number) => {
    setSelectedWeek(newWeek);
  };

  const handleRefresh = () => {
    if (selectedDeviceId) {
      fetchDeviceUtilization(selectedDeviceId, selectedWeek);
    }
  };

  const currentDevice = devices.find(d => d.deviceId === selectedDeviceId);

  if ((devicesLoading && showDeviceSelector) || (utilizationLoading && !deviceUtilization)) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-500">Loading device utilization...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`device-utilization-view ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold mb-0 flex items-center gap-2">
            <BarChartOutlined className="text-blue-500" />
            {deviceUtilization?.deviceName || currentDevice?.deviceName || 'Device'} Utilization
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {showDeviceSelector && (
            <Select
              placeholder="Select Device"
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="w-48"
              loading={devicesLoading}
              options={devices.map(device => ({
                value: device.deviceId,
                label: device.deviceName,
                disabled: !device.isActive,
              }))}
            />
          )}
          
          {showWeekSelector && (
            <WeekSelector value={selectedWeek} onChange={handleWeekChange} />
          )}
          
          <Button
            onClick={handleRefresh}
            loading={utilizationLoading}
            icon={<ReloadOutlined />}
            type="default"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          message="Failed to load device utilization"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          className="mb-4"
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      )}

      {!deviceUtilization && !utilizationLoading ? (
        <Card>
          <div className="text-center py-12">
            <DesktopOutlined className="text-4xl text-slate-300 mb-4" />
            <p className="text-slate-600">Select a device to view utilization data</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Hours"
              value={`${deviceUtilization?.today.totalHubstaffHours.toFixed(1) || '0'}h`}
              color="#1890ff"
              icon={<ClockCircleOutlined />}
              loading={utilizationLoading}
            />
            <StatCard
              title="Active Users"
              value={deviceUtilization?.today.activeUsers || 0}
              color="#52c41a"
              icon={<UserOutlined />}
              loading={utilizationLoading}
            />
            <StatCard
              title="Week Total"
              value={`${deviceUtilization?.weekSummary.totalHours.toFixed(1) || '0'}h`}
              color="#722ed1"
              icon={<CalendarOutlined />}
              loading={utilizationLoading}
            />
            <StatCard
              title="Utilization Rate"
              value={`${deviceUtilization?.weekSummary.utilizationRate.toFixed(1) || '0'}%`}
              color="#fa8c16"
              icon={<RiseOutlined />}
              loading={utilizationLoading}
            />
          </div>

          {/* Today's Sessions */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <DesktopOutlined />
                Today's Sessions
              </div>
            }
            loading={utilizationLoading}
          >
            <SessionsTimeline sessions={deviceUtilization?.today.sessions || []} />
          </Card>

          {/* Utilization Progress */}
          {deviceUtilization && (
            <Card title="Weekly Utilization Progress">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Usage Rate: {deviceUtilization.weekSummary.utilizationRate.toFixed(1)}%
                  </span>
                  <span className="text-sm text-slate-500">
                    {deviceUtilization.weekSummary.totalHours.toFixed(1)}h / 40h target
                  </span>
                </div>
                <Progress 
                  percent={Math.min(deviceUtilization.weekSummary.utilizationRate, 100)}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  className="mb-2"
                />
                <div className="text-xs text-slate-500 text-center">
                  Target: 40 hours per week (8 hours × 5 days)
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceUtilizationView;