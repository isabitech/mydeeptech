import { useState } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { retrieveTokenFromStorage } from "../../../../helpers";

interface UpdateStatusPayload {
  userId: string;
  annotatorStatus?: string;
  microTaskerStatus?: string;
}

interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface UpdateStatusResult {
  success: boolean;
  data?: UpdateStatusResponse;
  error?: string;
}

export const useUpdateUserStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserStatus = async (payload: UpdateStatusPayload): Promise<UpdateStatusResult> => {
    setLoading(true);
    setError(null);

    try {
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "Authentication token not found. Please log in again.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const url = `${import.meta.env.VITE_API_URL}${endpoints.adminActions.updateUserStatus}/${payload.userId}/${payload.annotatorStatus || payload.microTaskerStatus}`;

      const response = await fetch(url, {
        method: "PATCH",
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

      const data: UpdateStatusResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to update user status";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while updating user status. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    updateUserStatus,
    loading,
    error,
    resetState,
  };
};