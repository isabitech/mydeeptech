import React, { useEffect, useState } from 'react';
import { Card, Statistic, Badge, Spin, Alert, Button, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  CalendarOutlined,
  DesktopOutlined,
  ReloadOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { useUserHubstaff } from '../../../hooks/HVNC/useUserHubstaff';
import { createHubstaffRealtimeService } from '../../../services/HubstaffRealtimeService';
import { retrieveTokenFromStorage } from '../../../helpers';
import CountUp from 'react-countup';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HubstaffTimerWidgetProps {
  className?: string;
  showWeeklySummary?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActiveTimerDisplay: React.FC<{
  session: any;
  onRefresh: () => void;
  isConnected: boolean;
}> = ({ session, onRefresh, isConnected }) => (
  <div className="text-center space-y-4">
    <div className="flex items-center justify-center gap-3 mb-4">
      <Badge status="processing" color="green" />
      <h3 className="text-lg font-semibold text-slate-700 m-0">
        Working on Device {session.deviceId}
      </h3>
      <Tooltip title={isConnected ? 'Real-time connected' : 'Disconnected'}>
        <WifiOutlined className={`text-lg ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
      </Tooltip>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ClockCircleOutlined className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Your Session</span>
        </div>
        <div className="text-3xl font-bold text-blue-700">
          {session.currentDuration}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DesktopOutlined className="text-orange-600" />
          <span className="text-sm font-medium text-orange-700">Hubstaff Timer</span>
        </div>
        <div className="text-3xl font-bold text-orange-700">
          {session.hubstaffTimer}
        </div>
      </div>
    </div>
    
    <div className="bg-slate-50 p-4 rounded-lg">
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>Started: {new Date(session.sessionStartTime).toLocaleTimeString()}</span>
        <Button 
          type="link" 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          className="text-slate-600"
        >
          Refresh
        </Button>
      </div>
    </div>
  </div>
);

const InactiveTimerDisplay: React.FC<{
  onRefresh: () => void;
  isConnected: boolean;
}> = ({ onRefresh, isConnected }) => (
  <div className="text-center space-y-4">
    <div className="flex items-center justify-center gap-3 mb-4">
      <Badge status="default" />
      <h3 className="text-lg font-semibold text-slate-500 m-0">No Active Session</h3>
      <Tooltip title={isConnected ? 'Real-time connected' : 'Disconnected'}>
        <WifiOutlined className={`text-lg ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
      </Tooltip>
    </div>
    
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl border border-slate-200">
      <PauseCircleOutlined className="text-4xl text-slate-400 mb-4" />
      <p className="text-slate-600 mb-4">You're not currently working on any HVNC device</p>
      <p className="text-xs text-slate-500">Start a session to begin time tracking</p>
      <Button 
        type="link" 
        icon={<ReloadOutlined />} 
        onClick={onRefresh}
        className="mt-4"
      >
        Check Again
      </Button>
    </div>
  </div>
);

const DailySummary: React.FC<{ 
  summary: any;
  weekSummary: any;
  showWeeklySummary?: boolean;
}> = ({ summary, weekSummary, showWeeklySummary }) => (
  <div className="space-y-4">
    <h4 className="text-md font-semibold text-slate-700 flex items-center gap-2">
      <CalendarOutlined />
      Time Summary
    </h4>
    
    <div className={`grid gap-4 ${showWeeklySummary ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
      <Card size="small" className="text-center">
        <Statistic
          title="Today's Hours"
          value={summary?.totalWorkedHours || 0}
          precision={1}
          valueStyle={{ color: '#3f8600' }}
          suffix="hrs"
        />
      </Card>
      
      <Card size="small" className="text-center">
        <Statistic
          title="Sessions Today"
          value={summary?.sessionsCount || 0}
          valueStyle={{ color: '#1890ff' }}
          suffix="sessions"
        />
      </Card>
      
      {showWeeklySummary && (
        <Card size="small" className="text-center">
          <Statistic
            title="This Week"
            value={weekSummary?.totalHours || 0}
            precision={1}
            valueStyle={{ color: '#722ed1' }}
            suffix="hrs"
          />
        </Card>
      )}
    </div>
    
    {showWeeklySummary && weekSummary?.dailyBreakdown && (
      <div className="bg-slate-50 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-slate-700 mb-3">Weekly Breakdown</h5>
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekSummary.dailyBreakdown.map((day: any, index: number) => (
            <div key={index} className="text-xs">
              <div className="font-medium text-slate-600">{day.date}</div>
              <div className="text-slate-500">{day.hours.toFixed(1)}h</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HubstaffTimerWidget: React.FC<HubstaffTimerWidgetProps> = ({
  className = '',
  showWeeklySummary = true,
}) => {
  const {
    loading,
    error,
    sessionData,
    currentSession,
    dailySummary,
    weekSummary,
    isWorking,
    refresh,
    clearError,
  } = useUserHubstaff();

  const [realtimeService, setRealtimeService] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // ─── Real-time Setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        const token = await retrieveTokenFromStorage();
        if (token) {
          const service = createHubstaffRealtimeService(token, false);
          setRealtimeService(service);
          
          service.on('connection-status', (data: any) => {
            setIsConnected(data.connected);
          });
          
          service.on('timer-update', () => {
            // Refresh data when timer updates
            refresh();
          });
          
          service.on('session-start', () => {
            refresh();
          });
          
          service.on('session-end', () => {
            refresh();
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
  }, [refresh]);

  if (loading && !sessionData) {
    return (
      <Card className={`${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-500">Loading Hubstaff data...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-lg" />
            <span>Hubstaff Time Tracker</span>
          </div>
          {isConnected && (
            <Badge status="processing" text="Live" className="text-xs" />
          )}
        </div>
      }
      className={`hubstaff-timer-widget ${className}`}
      styles={{
        body: { padding: '24px' }
      }}
    >
      <div className="space-y-6">
        {error && (
          <Alert
            message="Unable to load Hubstaff data"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            action={
              <Button size="small" onClick={refresh}>
                Retry
              </Button>
            }
          />
        )}
        
        {currentSession && isWorking ? (
          <ActiveTimerDisplay 
            session={currentSession} 
            onRefresh={refresh}
            isConnected={isConnected}
          />
        ) : (
          <InactiveTimerDisplay 
            onRefresh={refresh}
            isConnected={isConnected}
          />
        )}
        
        {(dailySummary || weekSummary) && (
          <DailySummary 
            summary={dailySummary} 
            weekSummary={weekSummary}
            showWeeklySummary={showWeeklySummary}
          />
        )}
      </div>
    </Card>
  );
};

export default HubstaffTimerWidget;