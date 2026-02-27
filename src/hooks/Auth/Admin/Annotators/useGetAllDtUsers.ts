import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { retrieveTokenFromStorage } from "../../../../helpers";
import { GetAllDTUsersResult, User } from "./all-user-type";

// Use the User type from the API response
export type DTUser = User;

// Custom result type for hook operations
interface HookOperationResult {
  success: boolean;
  data?: GetAllDTUsersResult;
  error?: string;
}



export const useGetAllDtUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<DTUser[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  const getAllDTUsers = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "Authentication token not found. Please log in again.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${import.meta.env.VITE_API_URL}${endpoints.adminActions.getAllDTUsers}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: GetAllDTUsersResult = await response.json();

      if (data.success && data.data) {
        // Extract users array from the new API structure
        const usersArray = data.data.users || [];

        setUsers(usersArray);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to fetch DT users";
        setError(errorMessage);
        setUsers([]); // Set empty array on error
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching DT users. Please try again.";
      setError(errorMessage);
      setUsers([]); // Set empty array on error
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = useCallback(() => {
    return getAllDTUsers();
  }, []);

  const filterUsers = useCallback((status: string) => {
    return users.filter(user => 
      user.annotatorStatus === status || user.microTaskerStatus === status
    );
  }, [users]);

  const getApprovedAnnotators = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "Authentication token not found. Please log in again.";
        setError(errorMessage);
        return [];
      }

      const url = `${import.meta.env.VITE_API_URL}${endpoints.adminActions.getAllDTUsers}?status=approved`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: GetAllDTUsersResult = await response.json();

      if (data.success && data.data) {
        const approvedUsers = data.data.users || [];
        return approvedUsers;
      } else {
        setError(data.message || "Failed to fetch approved annotators");
        return [];
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching approved annotators";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPendingAnnotators = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "Authentication token not found. Please log in again.";
        setError(errorMessage);
        return [];
      }

      const url = `${import.meta.env.VITE_API_URL}${endpoints.adminActions.getAllDTUsers}?status=pending`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: GetAllDTUsersResult = await response.json();

      if (data.success && data.data) {
        const pendingUsers = data.data.users || [];
        return pendingUsers;
      } else {
        setError(data.message || "Failed to fetch pending annotators");
        return [];
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching pending annotators";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMicroTaskers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "Authentication token not found. Please log in again.";
        setError(errorMessage);
        return [];
      }

      const url = `${import.meta.env.VITE_API_URL}${endpoints.adminActions.getAllDTUsers}?status=rejected`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: GetAllDTUsersResult = await response.json();

      if (data.success && data.data) {
        const rejectedUsers = data.data.users || [];
        return rejectedUsers;
      } else {
        setError(data.message || "Failed to fetch micro-taskers");
        return [];
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching micro-taskers";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    getAllDTUsers,
    refreshUsers,
    filterUsers,
    getApprovedAnnotators,
    getPendingAnnotators,
    getMicroTaskers,
    loading,
    error,
    users,
    pagination,
    summary,
    resetState,
  };
};