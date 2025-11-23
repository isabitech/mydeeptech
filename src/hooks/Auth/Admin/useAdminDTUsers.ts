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
      console.log('🔗 Calling DTUsers API:', endpoints.adminActions.getAllDTUsers);
      const data: any = await apiGet(endpoints.adminActions.getAllDTUsers);
      
      console.log('📦 DTUsers API Raw Response:', data);

      if (data.success) {
        // Handle different possible response structures
        let usersData: DTUser[] = [];
        
        if (data.data) {
          // If data.data exists, check if it's an array or has users property
          if (Array.isArray(data.data)) {
            usersData = data.data;
          } else if (data.data.users && Array.isArray(data.data.users)) {
            usersData = data.data.users;
          } else {
            console.warn('⚠️ Unexpected DTUsers response structure:', data.data);
          }
        }
        
        console.log('✅ Setting DTUsers:', usersData);
        setDtUsers(usersData);
        return { success: true, data: { users: usersData } };
      } else {
        const errorMessage = data.message || "Failed to fetch DTUsers";
        console.error('❌ DTUsers API Error:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      console.error('❌ DTUsers API Exception:', err);
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