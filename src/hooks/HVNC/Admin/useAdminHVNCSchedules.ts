import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, apiPut, apiDelete, getErrorMessage } from "../../../service/apiUtils";
import {
  HVNCShift,
  HVNCCalendarResponse,
  HVNCShiftFormData,
  HVNCShiftUser,
  HVNCShiftDevice,
  HVNCOperationResult,
} from "../hvnc.types";

export const useAdminHVNCSchedules = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<HVNCShift[]>([]);
  const [calendar, setCalendar] = useState<HVNCCalendarResponse | null>(null);
  const [shiftUsers, setShiftUsers] = useState<HVNCShiftUser[]>([]);
  const [shiftDevices, setShiftDevices] = useState<HVNCShiftDevice[]>([]);

  const getAllShifts = useCallback(
    async (filters?: {
      status?: string;
      userId?: string;
      deviceId?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<HVNCOperationResult<HVNCShift[]>> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.userId) params.user_id = filters.userId;
        if (filters?.deviceId) params.device_id = filters.deviceId;
        if (filters?.startDate) params.start_date = filters.startDate;
        if (filters?.endDate) params.end_date = filters.endDate;

        const data = await apiGet<{ success?: boolean; shifts?: HVNCShift[]; data?: { shifts: HVNCShift[] } }>(
          endpoints.adminHVNC.getAllShifts,
          { params }
        );
        const list = data.shifts ?? data.data?.shifts ?? [];
        setShifts(list);
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

  const createShift = useCallback(
    async (formData: HVNCShiftFormData): Promise<HVNCOperationResult<HVNCShift>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiPost<{ success?: boolean; data?: HVNCShift } & HVNCShift>(
          endpoints.adminHVNC.createShift,
          formData
        );
        const shift: HVNCShift = (data as any).data ?? data;
        setShifts((prev) => [...prev, shift]);
        return { success: true, data: shift };
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

  const updateShift = useCallback(
    async (shiftId: string, formData: Partial<HVNCShiftFormData>): Promise<HVNCOperationResult<HVNCShift>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.updateShift}/${shiftId}`;
        const data = await apiPut<{ success?: boolean; data?: HVNCShift } & HVNCShift>(url, formData);
        const shift: HVNCShift = (data as any).data ?? data;
        setShifts((prev) => prev.map((s) => (s.id === shiftId ? shift : s)));
        return { success: true, data: shift };
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

  const deleteShift = useCallback(
    async (shiftId: string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.deleteShift}/${shiftId}`;
        await apiDelete(url);
        setShifts((prev) => prev.filter((s) => s.id !== shiftId));
        return { success: true };
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

  const getCalendar = useCallback(
    async (month: number, year: number): Promise<HVNCOperationResult<HVNCCalendarResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<{ success?: boolean; data?: HVNCCalendarResponse } & HVNCCalendarResponse>(
          endpoints.adminHVNC.getCalendar,
          { params: { month, year } }
        );
        const result: HVNCCalendarResponse = (data as any).data ?? data;
        setCalendar(result);
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

  const getShiftUsers = useCallback(async (): Promise<HVNCOperationResult<HVNCShiftUser[]>> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ success?: boolean; users?: HVNCShiftUser[]; data?: { users: HVNCShiftUser[] } }>(
        endpoints.adminHVNC.getShiftUsers
      );
      const list = data.users ?? data.data?.users ?? [];
      setShiftUsers(list);
      return { success: true, data: list };
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getShiftDevices = useCallback(async (): Promise<HVNCOperationResult<HVNCShiftDevice[]>> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ success?: boolean; devices?: HVNCShiftDevice[]; data?: { devices: HVNCShiftDevice[] } }>(
        endpoints.adminHVNC.getShiftDevices
      );
      const list = data.devices ?? data.data?.devices ?? [];
      setShiftDevices(list);
      return { success: true, data: list };
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFormOptions = useCallback(async () => {
    await Promise.all([getShiftUsers(), getShiftDevices()]);
  }, [getShiftUsers, getShiftDevices]);

  return {
    // State
    loading,
    error,
    shifts,
    calendar,
    shiftUsers,
    shiftDevices,
    // Actions
    getAllShifts,
    createShift,
    updateShift,
    deleteShift,
    getCalendar,
    getShiftUsers,
    getShiftDevices,
    loadFormOptions,
    // State setters
    setShifts,
    setError,
  };
};
