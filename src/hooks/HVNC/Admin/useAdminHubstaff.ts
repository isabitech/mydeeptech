import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../service/apiUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HubstaffActiveSession {
  deviceId: string;
  deviceName: string;
  currentUser: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  session: {
    sessionId: string;
    startTime: string;
    currentDuration: string;
    isActive: boolean;
  };
  hubstaffTimer: {
    totalElapsed: string;
    isActive: boolean;
  };
}

export interface DeviceUtilization {
  deviceId: string;
  deviceName: string;
  today: {
    totalHubstaffHours: number;
    activeUsers: number;
    sessions: Array<{
      userName: string;
      workedHours: number;
      startTime: string;
      endTime: string;
    }>;
  };
  weekSummary: {
    totalHours: number;
    utilizationRate: number;
  };
}

export interface UserSession {
  userId: string;
  sessions: Array<{
    sessionId: string;
    deviceId: string;
    startTime: string;
    endTime?: string;
    duration: string;
    hubstaffHours: number;
    status: 'active' | 'completed';
  }>;
  totalHours: number;
  weekSummary: {
    totalHours: number;
    sessionsCount: number;
  };
}

export interface DeviceUsers {
  device: {
    deviceId: string;
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    lastSeen: string;
  };
  assignedUsers: Array<{
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    shiftDetails: {
      shiftId: string;
      startTime: string;
      endTime: string;
      assignedDays: number[];
      startDate: string;
      endDate: string;
      isActive: boolean;
      status: 'active' | 'inactive' | 'pending';
    };
  }>;
  totalAssignments: number;
}

export interface MonthlyTrackingData {
  year: number;
  month: number;
  users: Array<{
    userId: string;
    userName: string;
    email: string;
    totalHours: number;
    workingDays: number;
    averageDailyHours: number;
    devices: Array<{
      deviceId: string;
      deviceName: string;
      hoursWorked: number;
    }>;
    dailyBreakdown: Array<{
      date: string;
      hours: number;
      sessionsCount: number;
    }>;
  }>;
  summary: {
    totalUsers: number;
    totalHours: number;
    averageHoursPerUser: number;
    mostActiveDevice: string;
    utilizationRate: number;
  };
}

// ─── Hook Implementation ──────────────────────────────────────────────────────

export const useAdminHubstaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Active Sessions Management ──────────────────────────────────────────────
  const [activeSessions, setActiveSessions] = useState<HubstaffActiveSession[]>([]);
  const [activeSessionsLoading, setActiveSessionsLoading] = useState(false);

  const fetchActiveSessions = useCallback(async () => {
    try {
      setActiveSessionsLoading(true);
      setError(null);

      const response = await apiGet('/hvnc/admin/hubstaff/active-sessions');
      
      if (response.success) {
        setActiveSessions(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch active sessions');
      }
    } catch (err: any) {
      setError('Unable to load active sessions. Please try again.');
      console.error('Error fetching active sessions:', err);
    } finally {
      setActiveSessionsLoading(false);
    }
  }, []);

  // ─── Device Utilization ──────────────────────────────────────────────────────
  const [deviceUtilization, setDeviceUtilization] = useState<DeviceUtilization | null>(null);
  const [utilizationLoading, setUtilizationLoading] = useState(false);

  const fetchDeviceUtilization = useCallback(async (deviceId: string, week: number = 0) => {
    try {
      setUtilizationLoading(true);
      setError(null);

      const response = await apiGet(`/hvnc/admin/hubstaff/device-utilization/${deviceId}?week=${week}`);
      
      if (response.success) {
        setDeviceUtilization(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch device utilization');
      }
    } catch (err: any) {
      setError('Unable to load device utilization data. Please try again.');
      console.error('Error fetching device utilization:', err);
    } finally {
      setUtilizationLoading(false);
    }
  }, []);

  // ─── User Sessions ───────────────────────────────────────────────────────────
  const [userSessions, setUserSessions] = useState<UserSession | null>(null);
  const [userSessionsLoading, setUserSessionsLoading] = useState(false);

  const fetchUserSessions = useCallback(async (userId: string) => {
    try {
      setUserSessionsLoading(true);
      setError(null);

      const response = await apiGet(`/hvnc/admin/hubstaff/user-sessions/${userId}`);
      
      if (response.success) {
        setUserSessions(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch user sessions');
      }
    } catch (err: any) {
      setError('Unable to load user session data. Please try again.');
      console.error('Error fetching user sessions:', err);
    } finally {
      setUserSessionsLoading(false);
    }
  }, []);

  // ─── All Devices ─────────────────────────────────────────────────────────────
  const [devices, setDevices] = useState<Array<{ deviceId: string; deviceName: string; isActive: boolean }>>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const fetchDevicesStatus = useCallback(async () => {
    try {
      setDevicesLoading(true);
      setError(null);

      const response = await apiGet('/hvnc/admin/hubstaff/devices-status');
      
      if (response.success) {
        setDevices(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch devices status');
      }
    } catch (err: any) {
      setError('Unable to load devices status. Please try again.');
      console.error('Error fetching devices status:', err);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  // ─── Device Users ────────────────────────────────────────────────────────────
  const [deviceUsers, setDeviceUsers] = useState<DeviceUsers | null>(null);
  const [deviceUsersLoading, setDeviceUsersLoading] = useState(false);

  const fetchDeviceUsers = useCallback(async (deviceId: string) => {
    try {
      setDeviceUsersLoading(true);
      setError(null);

      const response = await apiGet(`/hvnc/admin/devices/${deviceId}/users`);
      
      if (response.success) {
        setDeviceUsers(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch device users');
      }
    } catch (err: any) {
      setError('Unable to load device users. Please try again.');
      console.error('Error fetching device users:', err);
    } finally {
      setDeviceUsersLoading(false);
    }
  }, []);

  // ─── Monthly Tracking ────────────────────────────────────────────────────────
  const [monthlyTracking, setMonthlyTracking] = useState<MonthlyTrackingData | null>(null);
  const [monthlyTrackingLoading, setMonthlyTrackingLoading] = useState(false);

  const fetchMonthlyTracking = useCallback(async (year: number, month: number) => {
    try {
      setMonthlyTrackingLoading(true);
      setError(null);

      const response = await apiGet(`/hvnc/admin/hubstaff/monthly-tracking/${year}/${month}`);
      
      if (response.success) {
        setMonthlyTracking(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch monthly tracking data');
      }
    } catch (err: any) {
      setError('Unable to load monthly tracking data. Please try again.');
      console.error('Error fetching monthly tracking:', err);
    } finally {
      setMonthlyTrackingLoading(false);
    }
  }, []);

  // ─── Auto-refresh for Active Sessions ────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startAutoRefresh = () => {
      // Initial fetch
      fetchActiveSessions();
      
      // Set up 30-second interval for active sessions
      interval = setInterval(fetchActiveSessions, 30000);
    };

    startAutoRefresh();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchActiveSessions]);

  return {
    // State
    loading: loading || activeSessionsLoading || utilizationLoading || userSessionsLoading || devicesLoading || monthlyTrackingLoading || deviceUsersLoading,
    error,
    
    // Active Sessions
    activeSessions,
    activeSessionsLoading,
    fetchActiveSessions,
    
    // Device Utilization
    deviceUtilization,
    utilizationLoading,
    fetchDeviceUtilization,
    
    // User Sessions
    userSessions,
    userSessionsLoading,
    fetchUserSessions,
    
    // Devices Status
    devices,
    devicesLoading,
    fetchDevicesStatus,
    
    // Device Users
    deviceUsers,
    deviceUsersLoading,
    fetchDeviceUsers,
    
    // Monthly Tracking
    monthlyTracking,
    monthlyTrackingLoading,
    fetchMonthlyTracking,
    
    // Utils
    clearError: () => setError(null),
  };
};

export default useAdminHubstaff;