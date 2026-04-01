import React, { useEffect, useState } from 'react';
import {
  DashboardOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  WifiOutlined,
  DisconnectOutlined,
  CalendarOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Card, Row, Col, Statistic, Table, Tag, Button, Avatar, Spin, Alert } from 'antd';
import { useUserHVNCPortal } from '../../../../hooks/HVNC/User/useUserHVNCPortal';
import styles from './UserHVNCDashboard.module.css';

// Define interfaces locally to avoid import issues
interface UserHVNCDevice {
  id: string;
  name: string;
  deviceId: string;
  status: 'Online' | 'Offline';
  hasActiveSession: boolean;
  shiftTime?: string;
  lastSeen: string;
}

interface UserHVNCSessionHistory {
  id: string;
  deviceName: string;
  startTime: string;
  duration: string;
  status: 'Completed' | 'Active' | 'Disconnected';
}

interface Props {
  onJoinSession: (deviceId: string) => void;
}

const UserHVNCDashboard: React.FC<Props> = ({ onJoinSession }) => {
  const {
    loading,
    error,
    dashboard,
    devices,
    sessionHistory,
    getDashboard,
    getDevices,
    getSessions,
    startSession,
  } = useUserHVNCPortal();

  const [deviceLoading, setDeviceLoading] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      await Promise.all([
        getDashboard(),
        getDevices(),
        getSessions({ limit: 10 }),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const handleRefreshDevices = async () => {
    setRefreshing(true);
    try {
      await getDevices();
    } catch (error) {
      console.error('Failed to refresh devices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeviceStart = async (device: UserHVNCDevice) => {
    // Start session with the selected device
    onJoinSession(device.deviceId);
  };

  const deviceColumns = [
    {
      title: 'Device',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, device: UserHVNCDevice) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<DesktopOutlined />}
            className="bg-[#F6921E] text-[#333333]"
          />
          <div>
            <div className="font-bold text-white">{text}</div>
            <div className="text-xs text-slate-400">{device.deviceId}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, device: UserHVNCDevice) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <Tag color={status === 'Online' ? 'green' : 'default'}>
            {status}
          </Tag>
          {device.hasActiveSession && (
            <Tag color="orange">Session Active</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Shift Time',
      dataIndex: 'shiftTime',
      key: 'shiftTime',
      render: (time: string) => (
        <div className="text-slate-300">
          <ClockCircleOutlined className="mr-1" />
          {time || 'Not scheduled'}
        </div>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (time: string) => (
        <div className="text-slate-400 text-sm">{time}</div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, device: UserHVNCDevice) => (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={deviceLoading === device.id}
        //   disabled={device.status === 'Offline'}
          onClick={() => handleDeviceStart(device)}
          className="bg-[#F6921E] hover:bg-[#D47C16] border-[#F6921E]"
        >
          {device.hasActiveSession ? 'Resume Session' : 'Start Session'}
        </Button>
      ),
    },
  ];

  const sessionColumns = [
    {
      title: 'Device',
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (name: string) => (
        <div className="font-medium text-white">{name}</div>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => (
        <div className="text-slate-300">
          {new Date(time).toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: string) => (
        <div className="text-slate-300">{duration}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Active' ? 'blue' : 'orange'}>
          {status}
        </Tag>
      ),
    },
  ];

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={initializeDashboard}>
            Retry
          </Button>
        }
        className="m-4"
      />
    );
  }

  return (
    <div className="p-6 bg-[#1a1a1a] min-h-screen font-[gilroy-regular]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">HVNC Dashboard</h1>
          <p className="text-slate-400">Welcome back, {dashboard?.user?.name || 'User'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            className="bg-[#F6921E] hover:bg-[#D47C16] border-[#F6921E]"
            disabled={!devices || devices.length === 0 || devices.filter(d => d.status === 'Online').length === 0}
            onClick={() => {
              const availableDevice = devices?.find(d => d.status === 'Online');
              if (availableDevice) {
                onJoinSession(availableDevice.id);
              }
            }}
          >
            Join Session
          </Button>
          <Button icon={<SettingOutlined />} className="bg-[#333333] text-white border-slate-700">
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card className="bg-[#2a2a2a] border-slate-700">
            <Statistic
              title={<span className="text-slate-400">Assigned Devices</span>}
              value={dashboard?.stats?.assignedDevices || 0}
              prefix={<DesktopOutlined className="text-[#F6921E]" />}
              valueStyle={{ color: '#F6921E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="bg-[#2a2a2a] border-slate-700">
            <Statistic
              title={<span className="text-slate-400">Active Sessions</span>}
              value={dashboard?.stats?.activeSessions || 0}
              prefix={<WifiOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="bg-[#2a2a2a] border-slate-700">
            <Statistic
              title={<span className="text-slate-400">Today's Time</span>}
              value={dashboard?.stats?.todayTime || '0h 0m'}
              prefix={<ClockCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="bg-[#2a2a2a] border-slate-700">
            <Statistic
              title={<span className="text-slate-400">Total Devices</span>}
              value={dashboard?.stats?.totalDevices || 0}
              prefix={<DashboardOutlined className="text-purple-500" />}
              valueStyle={{ color: '#a855f7' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Devices Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <DesktopOutlined className="text-[#F6921E]" />
              <span>Assigned Devices</span>
            </div>
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              loading={refreshing}
              onClick={handleRefreshDevices}
              size="small"
              className="bg-[#333333] text-white border-slate-600 hover:bg-slate-700"
            >
              Refresh
            </Button>
          </div>
        }
        className="bg-[#2a2a2a] border-slate-700 mb-8"
      >
        <Table
          dataSource={devices}
          columns={deviceColumns}
          rowKey="id"
          pagination={false}
          className={styles.hvncTable}
        />
      </Card>

      {/* Session History */}
      <Card
        title={
          <div className="flex items-center gap-2 text-white">
            <HistoryOutlined className="text-[#F6921E]" />
            <span>Recent Sessions</span>
          </div>
        }
        className="bg-[#2a2a2a] border-slate-700"
      >
        <Table
          dataSource={sessionHistory}
          columns={sessionColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className={styles.hvncTable}
        />
      </Card>


    </div>
  );
};

export default UserHVNCDashboard;