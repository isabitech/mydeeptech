import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, getErrorMessage } from "../../../service/apiUtils";
import { DTUser, HookOperationResult } from "../../../types/project.types";

interface DTUsersResponse {
  success: boolean;
  message: string;
  data: DTUser[];
}

export const useAdminDTUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dtUsers, setDtUsers] = useState<DTUser[]>([]);

  const getAllDTUsers = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: DTUsersResponse = await apiGet(endpoints.adminActions.getAllDTUsers);

      if (data.success) {
        setDtUsers(data.data);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch DTUsers";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setDtUsers([]);
  }, []);

  return {
    getAllDTUsers,
    loading,
    error,
    dtUsers,
    resetState,
  };
};