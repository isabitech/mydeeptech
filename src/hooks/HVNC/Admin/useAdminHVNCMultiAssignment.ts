import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, getErrorMessage } from "../../../service/apiUtils";
import {
  HVNCDeviceUsersResponse,
  HVNCDeviceUserEntry,
  HVNCUserAssignmentInput,
  HVNCBulkAssignmentResult,
  HVNCDeviceScheduleResponse,
  HVNCOperationResult,
} from "../hvnc.types";

export const useAdminHVNCMultiAssignment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceUsers, setDeviceUsers] = useState<HVNCDeviceUserEntry[]>([]);
  const [deviceSchedule, setDeviceSchedule] = useState<HVNCDeviceScheduleResponse | null>(null);
  const [bulkResult, setBulkResult] = useState<HVNCBulkAssignmentResult | null>(null);

  // ── GET /devices/:deviceId/users ────────────────────────────────────────────
  const getDeviceUsers = useCallback(
    async (deviceId: string): Promise<HVNCOperationResult<HVNCDeviceUsersResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.getDeviceUsers}/${deviceId}/users`;
        const data = await apiGet<{ success?: boolean; data?: HVNCDeviceUsersResponse } & HVNCDeviceUsersResponse>(url);
        const result: HVNCDeviceUsersResponse = (data as any).data ?? data;
        setDeviceUsers(result.assignedUsers ?? []);
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

  // ── POST /devices/:deviceId/assign-multiple-users ───────────────────────────
  const assignMultipleUsers = useCallback(
    async (
      deviceId: string,
      userAssignments: HVNCUserAssignmentInput[]
    ): Promise<HVNCOperationResult<HVNCBulkAssignmentResult>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.assignMultipleUsers}/${deviceId}/assign-multiple-users`;
        const data = await apiPost<{ success?: boolean; data?: HVNCBulkAssignmentResult } & HVNCBulkAssignmentResult>(
          url,
          { userAssignments }
        );
        const result: HVNCBulkAssignmentResult = (data as any).data ?? data;
        setBulkResult(result);
        // Refresh device users after a bulk assignment
        if (result.totalSuccessful > 0) {
          await getDeviceUsers(deviceId);
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
    [getDeviceUsers]
  );

  // ── GET /devices/:deviceId/schedule ─────────────────────────────────────────
  const getDeviceSchedule = useCallback(
    async (
      deviceId: string,
      week?: number,
      detailed?: boolean
    ): Promise<HVNCOperationResult<HVNCDeviceScheduleResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {};
        if (week !== undefined) params.week = week;
        if (detailed !== undefined) params.detailed = detailed;

        const url = `${endpoints.adminHVNC.getDeviceSchedule}/${deviceId}/schedule`;
        const data = await apiGet<{ success?: boolean; data?: HVNCDeviceScheduleResponse } & HVNCDeviceScheduleResponse>(
          url,
          { params }
        );
        const result: HVNCDeviceScheduleResponse = (data as any).data ?? data;
        setDeviceSchedule(result);
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

  const clearBulkResult = useCallback(() => setBulkResult(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    loading,
    error,
    deviceUsers,
    deviceSchedule,
    bulkResult,
    // Actions
    getDeviceUsers,
    assignMultipleUsers,
    getDeviceSchedule,
    // Helpers
    clearBulkResult,
    clearError,
    // State setters
    setDeviceUsers,
    setDeviceSchedule,
    setError,
  };
};
