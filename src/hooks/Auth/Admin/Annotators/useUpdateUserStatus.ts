import { useState } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import axios from "axios";

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
      const url = `${endpoints.adminActions.approveAnnotator}/${payload.userId}/approve`;

      const requestBody = {
        newStatus: payload.annotatorStatus || payload.microTaskerStatus
      };

      const response = await axios.patch(url, requestBody, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: UpdateStatusResponse = response.data;

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