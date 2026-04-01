import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, apiPut, apiDelete, getErrorMessage } from "../../../service/apiUtils";
import {
  HVNCUser,
  HVNCAssignedDevice,
  HVNCUserLog,
  HVNCOperationResult,
  HVNCAssignDevicePayload,
  HVNCAssignDeviceResponse,
  HVNCUserSession,
} from "../hvnc.types";

export const useAdminHVNCUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<HVNCUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<HVNCUser | null>(null);
  const [userLogs, setUserLogs] = useState<HVNCUserLog[]>([]);
  const [userSessions, setUserSessions] = useState<HVNCUserSession[]>([]);

  const getAllUsers = useCallback(
    async (filters?: {
      status?: string;
      role?: string;
      search?: string;
    }): Promise<HVNCOperationResult<HVNCUser[]>> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.role) params.role = filters.role;
        if (filters?.search) params.search = filters.search;

        const data = await apiGet<{ success?: boolean; users?: HVNCUser[]; data?: { users: HVNCUser[] } }>(
          endpoints.adminHVNC.getAllUsers,
          { params }
        );
        const list = data.users ?? data.data?.users ?? [];
        // Normalize name field (backend may return userName or name)
        const normalized = list.map((u) => ({ ...u, name: u.name ?? u.userName ?? "" }));
        setUsers(normalized);
        return { success: true, data: normalized };
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

  const getUserById = useCallback(
    async (userId: number | string): Promise<HVNCOperationResult<HVNCUser>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.getUserById}/${userId}`;
        const data = await apiGet<{ success?: boolean; data?: HVNCUser } & HVNCUser>(url);
        const user: HVNCUser = (data as any).data ?? data;
        const normalized = { ...user, name: user.name ?? (user as any).userName ?? "" };
        setSelectedUser(normalized);
        return { success: true, data: normalized };
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

  const createUser = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      password: string;
      role?: string;
      phone?: string;
      timezone?: string;
    }): Promise<HVNCOperationResult<HVNCUser>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiPost<{ success?: boolean; data?: HVNCUser } & HVNCUser>(
          endpoints.adminHVNC.createUser,
          payload
        );
        const user: HVNCUser = (data as any).data ?? data;
        const normalized = { ...user, name: user.name ?? (user as any).userName ?? "" };
        setUsers((prev) => [...prev, normalized]);
        return { success: true, data: normalized };
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

  const updateUser = useCallback(
    async (
      userId: number | string,
      payload: Partial<HVNCUser>
    ): Promise<HVNCOperationResult<HVNCUser>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.updateUser}/${userId}`;
        const data = await apiPut<{ success?: boolean; data?: HVNCUser } & HVNCUser>(url, payload);
        const user: HVNCUser = (data as any).data ?? data;
        const normalized = { ...user, name: user.name ?? (user as any).userName ?? "" };
        setUsers((prev) => prev.map((u) => (u.id === userId ? normalized : u)));
        if (selectedUser?.id === userId) setSelectedUser(normalized);
        return { success: true, data: normalized };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  const deleteUser = useCallback(
    async (userId: number | string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.deleteUser}/${userId}`;
        await apiDelete(url);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUser?.id === userId) setSelectedUser(null);
        return { success: true };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  const resetPassword = useCallback(
    async (
      userId: number | string,
      payload: { newPassword?: string; sendEmail?: boolean }
    ): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.resetUserPassword}/${userId}/reset-password`;
        const data = await apiPost(url, payload);
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

  const unlockUser = useCallback(
    async (userId: number | string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.unlockUser}/${userId}/unlock`;
        const data = await apiPost(url, {});
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

  const assignDevice = useCallback(
    async (
      userId: number | string,
      deviceId: string,
      shift: string
    ): Promise<HVNCOperationResult<HVNCAssignedDevice>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.assignDevice}/${userId}/devices`;
        const data = await apiPost<{ success?: boolean; assignedDevice?: HVNCAssignedDevice; data?: HVNCAssignedDevice }>(
          url,
          { deviceId, shift }
        );
        const device: HVNCAssignedDevice = data.assignedDevice ?? (data as any).data ?? (data as any);
        // Append to selectedUser assigned devices
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) =>
            prev
              ? {
                  ...prev,
                  assignedDevices: [...(prev.assignedDevices ?? []), device],
                  deviceCount: (prev.deviceCount ?? 0) + 1,
                }
              : prev
          );
        }
        return { success: true, data: device };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  const unassignDevice = useCallback(
    async (userId: number | string, deviceId: string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.unassignDevice}/${userId}/devices/${deviceId}`;
        await apiDelete(url);
        // Remove from selectedUser assigned devices
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) =>
            prev
              ? {
                  ...prev,
                  assignedDevices: (prev.assignedDevices ?? []).filter((d) => d.id !== deviceId),
                  deviceCount: Math.max((prev.deviceCount ?? 1) - 1, 0),
                }
              : prev
          );
        }
        return { success: true };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  const getUserLogs = useCallback(
    async (userId: number | string, deviceId?: string): Promise<HVNCOperationResult<HVNCUserLog[]>> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (deviceId) params.deviceId = deviceId;

        const url = `${endpoints.adminHVNC.getUserLogs}/${userId}/logs`;
        const data = await apiGet<{ success?: boolean; logs?: HVNCUserLog[]; data?: { logs: HVNCUserLog[] } }>(
          url,
          { params }
        );
        const logs = data.logs ?? data.data?.logs ?? [];
        setUserLogs(logs);
        return { success: true, data: logs };
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

  // ── POST /users/:userId/assign-device (new schedule format) ─────────────────
  const assignDeviceWithSchedule = useCallback(
    async (
      userId: number | string,
      payload: HVNCAssignDevicePayload
    ): Promise<HVNCOperationResult<HVNCAssignDeviceResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.assignDeviceWithSchedule}/${userId}/assign-device`;
        const data = await apiPost<{ success?: boolean; data?: HVNCAssignDeviceResponse } & HVNCAssignDeviceResponse>(
          url,
          payload
        );
        const result: HVNCAssignDeviceResponse = (data as any).data ?? data;
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

  // ── DELETE /users/:userId/remove-device/:deviceId ────────────────────────────
  const removeDevice = useCallback(
    async (userId: number | string, deviceId: string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.removeDevice}/${userId}/remove-device/${deviceId}`;
        const data = await apiDelete(url);
        // Remove from selectedUser assigned devices
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) =>
            prev
              ? {
                  ...prev,
                  assignedDevices: (prev.assignedDevices ?? []).filter((d) => d.id !== deviceId),
                  deviceCount: Math.max((prev.deviceCount ?? 1) - 1, 0),
                }
              : prev
          );
        }
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  // ── GET /users/:userId/sessions ──────────────────────────────────────────────
  const getUserSessions = useCallback(
    async (userId: number | string): Promise<HVNCOperationResult<HVNCUserSession[]>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.adminHVNC.getUserSessions}/${userId}/sessions`;
        const data = await apiGet<{ success?: boolean; sessions?: HVNCUserSession[]; data?: { sessions: HVNCUserSession[] } }>(url);
        const sessions = data.sessions ?? data.data?.sessions ?? [];
        setUserSessions(sessions);
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

  return {
    // State
    loading,
    error,
    users,
    selectedUser,
    userLogs,
    userSessions,
    // Actions
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    unlockUser,
    assignDevice,
    unassignDevice,
    getUserLogs,
    assignDeviceWithSchedule,
    removeDevice,
    getUserSessions,
    // State setters
    setSelectedUser,
    setUsers,
    setError,
  };
};
