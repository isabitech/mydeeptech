import React, { useEffect, useState } from 'react';
import { Card, Badge, Spin, Alert, Button, Avatar, Tooltip, Empty, Row, Col, message } from 'antd';
import { 
  UserOutlined, 
  DesktopOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WifiOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { useAdminHubstaff, HubstaffActiveSession } from '../../../hooks/HVNC/Admin/useAdminHubstaff';
import { createHubstaffRealtimeService } from '../../../services/HubstaffRealtimeService';
import { retrieveTokenFromStorage } from '../../../helpers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminActiveSessionsGridProps {
  className?: string;
  onSessionClick?: (session: HubstaffActiveSession) => void;
  showRefreshButton?: boolean;
  autoRefresh?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SessionCard: React.FC<{
  session: HubstaffActiveSession;
  onClick?: () => void;
}> = ({ session, onClick }) => {
  const { currentUser, session: sessionData, hubstaffTimer } = session;
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#52c41a' : '#d9d9d9';
  };

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className="session-card cursor-pointer transition-all duration-200 hover:shadow-lg"
      bodyStyle={{ padding: '20px' }}
    >
      <div className="space-y-4">
        {/* Device Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DesktopOutlined className="text-lg text-blue-600" />
            <h3 className="text-lg font-semibold m-0 text-slate-800">
              {session.deviceName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              color={getStatusColor(sessionData.isActive)}
              text={sessionData.isActive ? 'Active' : 'Inactive'}
              className="text-sm"
            />
            {hubstaffTimer.isActive && (
              <Tooltip title="Hubstaff Timer Running">
                <ClockCircleOutlined className="text-green-500 text-lg" />
              </Tooltip>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
          <Avatar 
            size={40}
            style={{ 
              backgroundColor: '#1890ff',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {getInitials(currentUser.firstName, currentUser.lastName)}
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-slate-800">
              {currentUser.firstName} {currentUser.lastName}
            </div>
            <div className="text-sm text-slate-500">
              {currentUser.email}
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-600 mb-1">Session Duration</div>
              <div className="text-lg font-bold text-blue-700">
                {sessionData.currentDuration}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-xs font-medium text-orange-600 mb-1">Hubstaff Total</div>
              <div className="text-lg font-bold text-orange-700">
                {hubstaffTimer.totalElapsed}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-2 rounded text-center">
            <span className="text-xs text-slate-600">
              Started: {new Date(sessionData.startTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const NoActiveSessions: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <div className="text-center py-12">
    <Empty
      image={<PauseCircleOutlined className="text-6xl text-slate-300" />}
      description={
        <div>
          <p className="text-lg text-slate-600 mb-2">No Active Hubstaff Sessions</p>
          <p className="text-sm text-slate-400">No users are currently working on HVNC devices</p>
        </div>
      }
    >
      <Button type="primary" onClick={onRefresh} icon={<ReloadOutlined />}>
        Check Again
      </Button>
    </Empty>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminActiveSessionsGrid: React.FC<AdminActiveSessionsGridProps> = ({
  className = '',
  onSessionClick,
  showRefreshButton = true,
  autoRefresh = true,
}) => {
  const {
    activeSessions,
    activeSessionsLoading,
    fetchActiveSessions,
    error,
    clearError,
  } = useAdminHubstaff();

  const [realtimeService, setRealtimeService] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ─── Real-time Setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoRefresh) return;

    const setupRealtime = async () => {
      try {
        const token = await retrieveTokenFromStorage();
        if (token) {
          const service = createHubstaffRealtimeService(token, true);
          setRealtimeService(service);
          
          service.on('connection-status', (data: any) => {
            setIsConnected(data.connected);
          });
          
          service.on('timer-update', (update: any) => {
            console.log('📊 Admin received timer update:', update);
            fetchActiveSessions();
            setLastUpdate(new Date());
          });
          
          service.on('session-start', (update: any) => {
            message.info(`${update.userName} started work on ${update.deviceName}`, 3);
            fetchActiveSessions();
            setLastUpdate(new Date());
          });
          
          service.on('session-end', (update: any) => {
            message.info(`${update.userName} ended work session (${update.duration})`, 3);
            fetchActiveSessions();
            setLastUpdate(new Date());
          });
          
          service.connect();
        }
      } catch (error) {
        console.error('Failed to setup Hubstaff real-time service:', error);
      }
    };

    setupRealtime();

    return () => {
      if (realtimeService) {
        realtimeService.disconnect();
      }
    };
  }, [autoRefresh, fetchActiveSessions]);

  const handleSessionClick = (session: HubstaffActiveSession) => {
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  const handleRefresh = () => {
    fetchActiveSessions();
    setLastUpdate(new Date());
  };

  if (activeSessionsLoading && activeSessions.length === 0) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-500">Loading active sessions...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`admin-active-sessions ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold mb-0 flex items-center gap-2">
            <PlayCircleOutlined className="text-green-500" />
            Active Hubstaff Sessions 
            <Badge count={activeSessions.length} showZero color="#52c41a" />
          </h2>
          {isConnected && autoRefresh && (
            <div className="flex items-center gap-2">
              <WifiOutlined className="text-green-500" />
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <Tooltip title={`Last updated: ${lastUpdate.toLocaleString()}`}>
              <span className="text-xs text-slate-500">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            </Tooltip>
          )}
          {showRefreshButton && (
            <Button
              onClick={handleRefresh}
              loading={activeSessionsLoading}
              icon={<ReloadOutlined />}
              type="default"
            >
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          message="Failed to load active sessions"
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

      {/* Sessions Grid */}
      {activeSessions.length === 0 ? (
        <NoActiveSessions onRefresh={handleRefresh} />
      ) : (
        <Row gutter={[16, 16]}>
          {activeSessions.map((session) => (
            <Col 
              key={session.deviceId} 
              xs={24} 
              sm={12} 
              md={12} 
              lg={8} 
              xl={6}
            >
              <SessionCard
                session={session}
                onClick={() => handleSessionClick(session)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Loading Overlay */}
      {activeSessionsLoading && activeSessions.length > 0 && (
        <div className="text-center mt-4">
          <Spin />
          <span className="ml-2 text-slate-500">Refreshing...</span>
        </div>
      )}
    </div>
  );
};

export default AdminActiveSessionsGrid;