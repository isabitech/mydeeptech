import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, apiPut, apiDelete, getErrorMessage } from "../../../service/apiUtils";
import {
  HVNCDevice,
  HVNCDeviceListResponse,
  HVNCAccessCodeResponse,
  HVNCHubstaffStartResponse,
  HVNCHubstaffPauseResponse,
  HVNCOperationResult,
} from "../hvnc.types";

export const useAdminHVNCDevices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<HVNCDevice[]>([]);
  const [totalCount, setTotalCount] = useState({ total: 0, activeCount: 0, inactiveCount: 0 });
  const [selectedDevice, setSelectedDevice] = useState<HVNCDevice | null>(null);

  const getAllDevices = useCallback(
    async (status?: "Active" | "Offline"): Promise<HVNCOperationResult<HVNCDevice[]>> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (status) params.status = status;

        const data = await apiGet<HVNCDeviceListResponse>(
          endpoints.adminHVNC.getAllDevices,
          { params }
        );
        const list = data.devices ?? [];
        setDevices(list);
        setTotalCount({
          total: data.total ?? list.length,
          activeCount: data.activeCount ?? 0,
          inactiveCount: data.inactiveCount ?? 0,
        });
        return { success: true, data: list };
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

  const getDeviceById = useCallback(
    async (deviceId: number | string): Promise<HVNCOperationResult<HVNCDevice>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.getDeviceById}/${deviceId}`;
        const data = await apiGet<{ success?: boolean; data?: HVNCDevice } & HVNCDevice>(url);
        const device: HVNCDevice = (data as any).data ?? data;
        setSelectedDevice(device);
        return { success: true, data: device };
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

  const registerDevice = useCallback(
    async (pcName: string, assignedUserId?: string): Promise<HVNCOperationResult<HVNCDevice>> => {
      setLoading(true);
      setError(null);
      try {
        const payload: Record<string, any> = { pcName };
        if (assignedUserId) payload.assignedUserId = assignedUserId;

        const data = await apiPost<{ success?: boolean; data?: HVNCDevice } & HVNCDevice>(
          endpoints.adminHVNC.createDevice,
          payload
        );
        const device: HVNCDevice = (data as any).data ?? data;
        setDevices((prev) => [...prev, device]);
        return { success: true, data: device };
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

  const updateDevice = useCallback(
    async (
      deviceId: number | string,
      payload: Partial<Pick<HVNCDevice, "pcName" | "assignedUserId">>
    ): Promise<HVNCOperationResult<HVNCDevice>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.updateDevice}/${deviceId}`;
        const data = await apiPut<{ success?: boolean; data?: HVNCDevice } & HVNCDevice>(url, payload);
        const device: HVNCDevice = (data as any).data ?? data;
        setDevices((prev) => prev.map((d) => (d.id === device.id ? device : d)));
        if (selectedDevice?.id === device.id) setSelectedDevice(device);
        return { success: true, data: device };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedDevice]
  );

  const deleteDevice = useCallback(
    async (deviceId: number | string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.deleteDevice}/${deviceId}`;
        await apiDelete(url);
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        if (selectedDevice?.id === deviceId) setSelectedDevice(null);
        return { success: true };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedDevice]
  );

  const generateAccessCode = useCallback(
    async (deviceId: number | string): Promise<HVNCOperationResult<HVNCAccessCodeResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.generateAccessCode}/${deviceId}/access-code/generate`;
        const data = await apiPost<{ success?: boolean; data?: HVNCAccessCodeResponse } & HVNCAccessCodeResponse>(url, {});
        const result: HVNCAccessCodeResponse = (data as any).data ?? data;
        // Update selected device access code in local state
        if (selectedDevice?.id === deviceId) {
          setSelectedDevice((prev) => prev ? { ...prev, accessCode: result.accessCode } : prev);
        }
        return { success: true, data: result };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedDevice]
  );

  const startHubstaff = useCallback(
    async (deviceId: number | string): Promise<HVNCOperationResult<HVNCHubstaffStartResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.hubstaffStart}/${deviceId}/hubstaff/start`;
        const data = await apiPost<{ success?: boolean; data?: HVNCHubstaffStartResponse } & HVNCHubstaffStartResponse>(url, {});
        const result: HVNCHubstaffStartResponse = (data as any).data ?? data;
        return { success: true, data: result };
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

  const pauseHubstaff = useCallback(
    async (deviceId: number | string): Promise<HVNCOperationResult<HVNCHubstaffPauseResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.hubstaffPause}/${deviceId}/hubstaff/pause`;
        const data = await apiPost<{ success?: boolean; data?: HVNCHubstaffPauseResponse } & HVNCHubstaffPauseResponse>(url, {});
        const result: HVNCHubstaffPauseResponse = (data as any).data ?? data;
        return { success: true, data: result };
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

  const refreshDevices = useCallback(
    async (status?: "Active" | "Offline") => getAllDevices(status),
    [getAllDevices]
  );

  return {
    // State
    loading,
    error,
    devices,
    totalCount,
    selectedDevice,
    // Actions
    getAllDevices,
    getDeviceById,
    registerDevice,
    updateDevice,
    deleteDevice,
    generateAccessCode,
    startHubstaff,
    pauseHubstaff,
    refreshDevices,
    // State setters
    setSelectedDevice,
    setDevices,
    setError,
  };
};
