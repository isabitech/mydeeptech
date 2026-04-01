import React, { useEffect, useState } from 'react';
import { Card, Table, Select, DatePicker, Row, Col, Statistic, Progress, Alert, Button, Tag, Avatar } from 'antd';
import { 
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  BarChartOutlined,
  ReloadOutlined,
  TrophyOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAdminHubstaff, MonthlyTrackingData } from '../../../hooks/HVNC/Admin/useAdminHubstaff';
import dayjs from 'dayjs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyTrackingViewProps {
  className?: string;
  initialYear?: number;
  initialMonth?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MonthlyStatsCards: React.FC<{ summary: MonthlyTrackingData['summary'] }> = ({ summary }) => (
  <Row gutter={[16, 16]} className="mb-6">
    <Col xs={12} sm={6}>
      <Card size="small">
        <Statistic
          title="Total Users"
          value={summary.totalUsers}
          prefix={<TeamOutlined className="text-blue-500" />}
          valueStyle={{ color: '#1890ff' }}
        />
      </Card>
    </Col>
    <Col xs={12} sm={6}>
      <Card size="small">
        <Statistic
          title="Total Hours"
          value={summary.totalHours.toFixed(1)}
          suffix="hrs"
          prefix={<ClockCircleOutlined className="text-green-500" />}
          valueStyle={{ color: '#52c41a' }}
        />
      </Card>
    </Col>
    <Col xs={12} sm={6}>
      <Card size="small">
        <Statistic
          title="Avg Hours/User"
          value={summary.averageHoursPerUser.toFixed(1)}
          suffix="hrs"
          prefix={<UserOutlined className="text-orange-500" />}
          valueStyle={{ color: '#fa8c16' }}
        />
      </Card>
    </Col>
    <Col xs={12} sm={6}>
      <Card size="small">
        <Statistic
          title="Utilization Rate"
          value={`${summary.utilizationRate.toFixed(1)}%`}
          prefix={<BarChartOutlined className="text-purple-500" />}
          valueStyle={{ color: '#722ed1' }}
        />
      </Card>
    </Col>
  </Row>
);

const UserTable: React.FC<{ users: MonthlyTrackingData['users']; loading: boolean }> = ({ users, loading }) => {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, record: any) => (
        <div className="flex items-center gap-2">
          <Avatar size={32} style={{ backgroundColor: '#1890ff' }}>
            {name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Avatar>
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{hours.toFixed(1)}h</div>
        </div>
      ),
      sorter: (a: any, b: any) => a.totalHours - b.totalHours,
    },
    {
      title: 'Working Days',
      dataIndex: 'workingDays',
      key: 'workingDays',
      render: (days: number) => (
        <div className="text-center">
          <Tag color="green">{days} days</Tag>
        </div>
      ),
    },
    {
      title: 'Avg Daily Hours',
      dataIndex: 'averageDailyHours',
      key: 'averageDailyHours',
      render: (avgHours: number) => (
        <div className="text-center">
          <div className="text-sm font-medium">{avgHours.toFixed(1)}h/day</div>
        </div>
      ),
    },
    {
      title: 'Primary Device',
      dataIndex: 'devices',
      key: 'devices',
      render: (devices: any[]) => {
        const primaryDevice = devices.reduce((prev, current) => 
          prev.hoursWorked > current.hoursWorked ? prev : current, devices[0]
        );
        return (
          <div className="text-center">
            <div className="text-sm font-medium">{primaryDevice?.deviceName}</div>
            <div className="text-xs text-gray-500">{primaryDevice?.hoursWorked.toFixed(1)}h</div>
          </div>
        );
      },
    },
    {
      title: 'Performance',
      dataIndex: 'totalHours',
      key: 'performance',
      render: (hours: number) => {
        const targetHours = 160; // 8 hours × 20 working days
        const percentage = Math.min((hours / targetHours) * 100, 100);
        const color = percentage >= 90 ? '#52c41a' : percentage >= 70 ? '#faad14' : '#ff4d4f';
        
        return (
          <div className="w-24">
            <Progress 
              percent={percentage} 
              size="small" 
              strokeColor={color}
              format={(percent) => `${percent?.toFixed(0)}%`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="userId"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
      }}
      scroll={{ x: 800 }}
    />
  );
};

const MonthSelector: React.FC<{
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}> = ({ year, month, onYearChange, onMonthChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="flex items-center gap-3">
      <Select
        value={year}
        onChange={onYearChange}
        className="w-24"
        options={years.map(y => ({ value: y, label: y }))}
      />
      <Select
        value={month}
        onChange={onMonthChange}
        className="w-32"
        options={months}
      />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MonthlyTrackingView: React.FC<MonthlyTrackingViewProps> = ({
  className = '',
  initialYear,
  initialMonth,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(initialYear || currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || currentDate.getMonth() + 1);

  const {
    monthlyTracking,
    monthlyTrackingLoading,
    fetchMonthlyTracking,
    error,
    clearError,
  } = useAdminHubstaff();

  // ─── Load data when year/month changes ────────────────────────────────────────
  useEffect(() => {
    fetchMonthlyTracking(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, fetchMonthlyTracking]);

  const handleRefresh = () => {
    fetchMonthlyTracking(selectedYear, selectedMonth);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className={`monthly-tracking-view ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold mb-0 flex items-center gap-2">
            <TrophyOutlined className="text-gold-500" />
            Monthly Tracking Report
          </h2>
          <div className="text-lg text-gray-600">
            {getMonthName(selectedMonth)} {selectedYear}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <MonthSelector
            year={selectedYear}
            month={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
          
          <Button
            onClick={handleRefresh}
            loading={monthlyTrackingLoading}
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
          message="Failed to load monthly tracking data"
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

      {monthlyTrackingLoading && !monthlyTracking ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-500 mb-4">Loading monthly tracking data...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : monthlyTracking ? (
        <div className="space-y-6">
          {/* Monthly Statistics */}
          <MonthlyStatsCards summary={monthlyTracking.summary} />

          {/* Most Active Device Info */}
          {monthlyTracking.summary.mostActiveDevice && (
            <Card size="small" className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <DesktopOutlined className="text-blue-500" />
                <span className="text-sm">
                  <strong>Most Active Device:</strong> {monthlyTracking.summary.mostActiveDevice}
                </span>
              </div>
            </Card>
          )}

          {/* User Performance Table */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <TeamOutlined />
                User Performance Report
              </div>
            }
          >
            <UserTable 
              users={monthlyTracking.users} 
              loading={monthlyTrackingLoading}
            />
          </Card>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <CalendarOutlined className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-600">No tracking data available for the selected month</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MonthlyTrackingView;