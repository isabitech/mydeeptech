import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, apiPut, getErrorMessage } from "../../../service/apiUtils";
import { HVNCOperationResult } from "../hvnc.types";

// ─── User Portal Types ───────────────────────────────────────────────────

interface UserHVNCDashboard {
  user: {
    name: string;
    email: string;
  };
  stats: {
    assignedDevices: number;
    activeSessions: number;
    todayTime: string;
    totalDevices: number;
  };
  assignedDevices: UserHVNCDevice[];
  sessionHistory: UserHVNCSessionHistory[];
}

interface UserHVNCDevice {
  id: string;
  name: string;
  deviceId: string;
  status: "Online" | "Offline";
  lastSeen: string;
  hasActiveSession: boolean;
  sessionId?: string;
  shiftTime?: string;
  shiftDays?: number[];
  isRecurring?: boolean;
}

interface UserHVNCSessionHistory {
  id: string;
  deviceName: string;
  deviceId: string;
  startTime: string;
  endTime?: string;
  duration: string;
  status: "Completed" | "Active" | "Terminated";
  terminationReason?: string;
}

interface UserHVNCProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  profile: {
    timezone: string;
    country: string;
    joinedDate: string;
    lastLogin: string;
  };
  statistics: {
    totalSessions: number;
    activeSessions: number;
    assignedDevices: number;
    totalTimeThisMonth: string;
  };
}

interface UserHVNCShift {
  id: string;
  deviceName: string;
  deviceId: string;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
  isRecurring: boolean;
  daysOfWeek: number[];
}

interface AccessCodeRequest {
  email: string;
}

interface StartSessionRequest {
  deviceId: string;
}

// ─── Hook Implementation ─────────────────────────────────────────────────

export const useUserHVNCPortal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<UserHVNCDashboard | null>(null);
  const [profile, setProfile] = useState<UserHVNCProfile | null>(null);
  const [devices, setDevices] = useState<UserHVNCDevice[]>([]);
  const [sessionHistory, setSessionHistory] = useState<UserHVNCSessionHistory[]>([]);
  const [shifts, setShifts] = useState<UserHVNCShift[]>([]);

  /**
   * Get user dashboard with stats, assigned devices, and session history
   */
  const getDashboard = useCallback(
    async (): Promise<HVNCOperationResult<UserHVNCDashboard>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<UserHVNCDashboard>(endpoints.userHVNC.getDashboard);
        setDashboard(data);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get user profile information
   */
  const getProfile = useCallback(
    async (): Promise<HVNCOperationResult<UserHVNCProfile>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<UserHVNCProfile>(endpoints.userHVNC.getProfile);
        setProfile(data);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (profileData: Partial<UserHVNCProfile>): Promise<HVNCOperationResult<UserHVNCProfile>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiPut<UserHVNCProfile>(endpoints.userHVNC.updateProfile, profileData);
        setProfile(data);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get user's assigned devices
   */
  const getDevices = useCallback(
    async (): Promise<HVNCOperationResult<UserHVNCDevice[]>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet<{ devices: UserHVNCDevice[] }>(endpoints.userHVNC.getDevices);
        const deviceList = response.devices || [];
        setDevices(deviceList);
        return { success: true, data: deviceList };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get user's session history
   */
  const getSessions = useCallback(
    async (filters?: { status?: string; device_id?: string; limit?: number }): Promise<HVNCOperationResult<UserHVNCSessionHistory[]>> => {
      setLoading(true);
      setError(null);
      try {
        const params = filters ? { params: filters } : undefined;
        const response = await apiGet<{ sessions: UserHVNCSessionHistory[] }>(
          endpoints.userHVNC.getSessions,
          params
        );
        const sessions = response.sessions || [];
        setSessionHistory(sessions);
        return { success: true, data: sessions };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Start a new session for a device
   */
  const startSession = useCallback(
    async (deviceId: string): Promise<HVNCOperationResult<any>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiPost(endpoints.userHVNC.startSession, { deviceId });
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * End an active session
   */
  const endSession = useCallback(
    async (sessionId: string): Promise<HVNCOperationResult<any>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.userHVNC.endSession}/${sessionId}/end`;
        const data = await apiPost(url, { sessionId });
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Request access code via email
   */
  const requestAccessCode = useCallback(
    async (email: string, deviceId: string): Promise<HVNCOperationResult<any>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiPost(endpoints.userHVNC.requestCode, { 
          email, 
          device_id: deviceId 
        });
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get user's assigned shifts
   */
  const getShifts = useCallback(
    async (): Promise<HVNCOperationResult<UserHVNCShift[]>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet<{ shifts: UserHVNCShift[] }>(endpoints.userHVNC.getShifts);
        const shiftList = response.shifts || [];
        setShifts(shiftList);
        return { success: true, data: shiftList };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get current active shift
   */
  const getCurrentShift = useCallback(
    async (): Promise<HVNCOperationResult<UserHVNCShift>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<UserHVNCShift>(endpoints.userHVNC.getCurrentShift);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    // State
    loading,
    error,
    dashboard,
    profile,
    devices,
    sessionHistory,
    shifts,

    // Actions
    getDashboard,
    getProfile,
    updateProfile,
    getDevices,
    getSessions,
    startSession,
    endSession,
    requestAccessCode,
    getShifts,
    getCurrentShift,

    // State setters
    setError,
    setDashboard,
    setProfile,
    setDevices,
    setSessionHistory,
    setShifts,
  };
};

export type {
  UserHVNCDashboard,
  UserHVNCDevice,
  UserHVNCSessionHistory,
  UserHVNCProfile,
  UserHVNCShift,
  AccessCodeRequest,
  StartSessionRequest,
};