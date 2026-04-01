import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../service/apiUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrentSession {
  _id: string;
  deviceId: string;
  sessionStartTime: string;
  currentDuration: string;
  hubstaffTimer: string;
  isActive: boolean;
}

export interface DailySummary {
  date: string;
  totalWorkedHours: number;
  sessionsCount: number;
  devices: string[];
}

export interface WeekSummary {
  totalHours: number;
  dailyBreakdown: Array<{
    date: string;
    hours: number;
  }>;
}

export interface UserHubstaffData {
  currentSession: CurrentSession | null;
  todayTotal: DailySummary;
  weekSummary: WeekSummary;
}

// ─── Hook Implementation ──────────────────────────────────────────────────────

export const useUserHubstaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<UserHubstaffData | null>(null);

  // ─── Fetch User Sessions ─────────────────────────────────────────────────────
  const fetchMySessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet('/hvnc/user/hubstaff/my-sessions');
      
      if (response.success) {
        setSessionData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch user sessions');
      }
    } catch (err: any) {
      setError('Unable to load your session data. Please try again.');
      console.error('Error fetching user sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Auto-refresh for current session ────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startAutoRefresh = () => {
      // Initial fetch
      fetchMySessions();
      
      // Set up 60-second interval for user sessions (less frequent than admin)
      interval = setInterval(fetchMySessions, 60000);
    };

    startAutoRefresh();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchMySessions]);

  // ─── Helper methods ───────────────────────────────────────────────────────────
  const isWorking = sessionData?.currentSession?.isActive || false;
  
  const getCurrentDeviceId = () => sessionData?.currentSession?.deviceId || null;
  
  const getTodayHours = () => sessionData?.todayTotal?.totalWorkedHours || 0;
  
  const getWeekHours = () => sessionData?.weekSummary?.totalHours || 0;

  const getFormattedDuration = (duration?: string) => {
    if (!duration) return '00:00:00';
    // Ensure format is HH:MM:SS
    const parts = duration.split(':');
    if (parts.length === 2) {
      return `00:${duration}`;
    }
    return duration;
  };

  return {
    // State
    loading,
    error,
    sessionData,
    
    // Main data fetch
    fetchMySessions,
    
    // Helper methods
    isWorking,
    getCurrentDeviceId,
    getTodayHours,
    getWeekHours,
    getFormattedDuration,
    
    // Current session helpers
    currentSession: sessionData?.currentSession,
    dailySummary: sessionData?.todayTotal,
    weekSummary: sessionData?.weekSummary,
    
    // Utils
    clearError: () => setError(null),
    
    // Manual refresh
    refresh: fetchMySessions,
  };
};

export default useUserHubstaff;