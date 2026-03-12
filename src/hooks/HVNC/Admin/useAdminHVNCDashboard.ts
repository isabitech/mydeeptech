import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, getErrorMessage } from "../../../service/apiUtils";
import {
  HVNCStats,
  HVNCLiveDevice,
  HVNCActivityItem,
  HVNCOperationResult,
} from "../hvnc.types";

export const useAdminHVNCDashboard = () => {
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<HVNCStats | null>(null);
  const [liveDevices, setLiveDevices] = useState<HVNCLiveDevice[]>([]);
  const [activity, setActivity] = useState<HVNCActivityItem[]>([]);

  const getStats = useCallback(async (): Promise<HVNCOperationResult<HVNCStats>> => {
    setLoadingStats(true);
    setError(null);
    try {
      const data = await apiGet<{ success: boolean; data?: HVNCStats } & HVNCStats>(
        endpoints.adminHVNC.getStats
      );
      // Handle both wrapped { success, data } and flat response shapes
      const result: HVNCStats = (data as any).data ?? data;
      setStats(result);
      return { success: true, data: result };
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const getLiveDevices = useCallback(async (): Promise<HVNCOperationResult<HVNCLiveDevice[]>> => {
    setLoadingDevices(true);
    setError(null);
    try {
      const data = await apiGet<{ success: boolean; devices?: HVNCLiveDevice[]; data?: { devices: HVNCLiveDevice[] } }>(
        endpoints.adminHVNC.getLiveDevices
      );
      const devices = data.devices ?? data.data?.devices ?? [];
      setLiveDevices(devices);
      return { success: true, data: devices };
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  const getActivity = useCallback(async (limit = 10): Promise<HVNCOperationResult<HVNCActivityItem[]>> => {
    setLoadingActivity(true);
    setError(null);
    try {
      const data = await apiGet<{ success: boolean; items?: HVNCActivityItem[]; data?: { items: HVNCActivityItem[] } }>(
        endpoints.adminHVNC.getActivity,
        { params: { limit } }
      );
      const items = data.items ?? data.data?.items ?? [];
      setActivity(items);
      return { success: true, data: items };
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    await Promise.all([getStats(), getLiveDevices(), getActivity()]);
  }, [getStats, getLiveDevices, getActivity]);

  return {
    // State
    loadingStats,
    loadingDevices,
    loadingActivity,
    error,
    stats,
    liveDevices,
    activity,
    // Actions
    getStats,
    getLiveDevices,
    getActivity,
    loadDashboard,
    setError,
  };
};
