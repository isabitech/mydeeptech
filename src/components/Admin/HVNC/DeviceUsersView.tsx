import React, { useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Avatar, 
  Spin, 
  Alert, 
  Empty,
  Button,
  Space,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  EditOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAdminHubstaff, DeviceUsers } from '../../../hooks/HVNC/Admin/useAdminHubstaff';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeviceUsersViewProps {
  deviceId: string;
  className?: string;
}

const { Title, Text } = Typography;

// ─── Main Component ───────────────────────────────────────────────────────────

const DeviceUsersView: React.FC<DeviceUsersViewProps> = ({
  deviceId,
  className = ''
}) => {
  const { 
    deviceUsers, 
    deviceUsersLoading, 
    error, 
    fetchDeviceUsers,
    clearError
  } = useAdminHubstaff();

  // ─── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (deviceId) {
      fetchDeviceUsers(deviceId);
    }
  }, [deviceId, fetchDeviceUsers]);

  // ─── Table Columns ────────────────────────────────────────────────────────────

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Avatar 
            size="large" 
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: record.shiftDetails?.isActive ? '#52c41a' : '#d9d9d9',
              color: 'white'
            }}
          />
          <div>
            <div className="font-semibold text-slate-800">
              {record.fullName}
            </div>
            <Text type="secondary" className="text-sm">
              {record.email}
            </Text>
            <div className="text-xs text-slate-500 mt-1">
              {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Shift Status',
      dataIndex: 'shiftDetails',
      key: 'shiftStatus',
      render: (shiftDetails: any) => (
        <Tag 
          icon={shiftDetails?.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
          color={shiftDetails?.status === 'active' ? 'success' : shiftDetails?.status === 'pending' ? 'warning' : 'default'}
        >
          {shiftDetails?.status?.toUpperCase() || 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Shift Schedule',
      dataIndex: 'shiftDetails',
      key: 'schedule',
      render: (shiftDetails: any) => {
        if (!shiftDetails) {
          return <Text type="secondary">No shift assigned</Text>;
        }
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const assignedDayNames = shiftDetails.assignedDays?.map((day: number) => days[day]).join(', ') || 'N/A';
        
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-700">
              {shiftDetails.startTime} - {shiftDetails.endTime}
            </div>
            <div className="text-xs text-slate-500">
              {assignedDayNames}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Period',
      dataIndex: 'shiftDetails',
      key: 'period',
      render: (shiftDetails: any) => {
        if (!shiftDetails) {
          return <Text type="secondary">-</Text>;
        }
        
        const startDate = new Date(shiftDetails.startDate).toLocaleDateString();
        const endDate = new Date(shiftDetails.endDate).toLocaleDateString();
        
        return (
          <div className="text-sm">
            <div className="text-slate-700">{startDate}</div>
            <div className="text-xs text-slate-500">to {endDate}</div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Edit User">
            <Button size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="View Details">
            <Button size="small" icon={<InfoCircleOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Render Loading State ─────────────────────────────────────────────────────

  if (deviceUsersLoading) {
    return (
      <div className={`device-users-view ${className}`}>
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4 text-slate-600">
            Loading assigned users for device...
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Error State ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div className={`device-users-view ${className}`}>
        <Alert
          message="Error Loading Device Users"
          description={error}
          type="error"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={clearError}>
                Dismiss
              </Button>
              <Button 
                size="small" 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={() => fetchDeviceUsers(deviceId)}
              >
                Retry
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // ─── Render Empty State ───────────────────────────────────────────────────────

  if (!deviceUsers || deviceUsers.assignedUsers.length === 0) {
    return (
      <div className={`device-users-view ${className}`}>
        <div className="text-center py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{
              height: 60,
            }}
            description={
              <span className="text-slate-500">
                No users are currently assigned to this device
              </span>
            }
          >
            <Button 
              type="primary" 
              icon={<TeamOutlined />}
              onClick={() => {/* Could open assign users modal */}}
            >
              Assign Users
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  // ─── Render Main Content ──────────────────────────────────────────────────────

  return (
    <div className={`device-users-view ${className} space-y-6`}>
      {/* Device Info Header */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-blue-500 text-xl" />
              <Title level={4} className="mb-0">
                Assigned Users
              </Title>
            </div>
            <div className="text-slate-600">
              {deviceUsers.device.name} ({deviceUsers.device.deviceId})
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Last seen: {new Date(deviceUsers.device.lastSeen).toLocaleString()}
            </div>
          </div>
          
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => fetchDeviceUsers(deviceId)}
              loading={deviceUsersLoading}
            >
              Refresh
            </Button>
          </Space>
        </div>
        
        {/* Summary Statistics */}
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Assigned Users"
              value={deviceUsers.totalAssignments}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Active Shifts"
              value={deviceUsers.assignedUsers.filter(user => user.shiftDetails?.isActive).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Device Status"
              value={deviceUsers.device.status.toUpperCase()}
              valueStyle={{ 
                color: deviceUsers.device.status === 'online' ? '#52c41a' : 
                       deviceUsers.device.status === 'offline' ? '#ff4d4f' : '#faad14'
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={deviceUsers.assignedUsers}
          rowKey="userId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          className="users-table"
        />
      </Card>
    </div>
  );
};

export default DeviceUsersView;