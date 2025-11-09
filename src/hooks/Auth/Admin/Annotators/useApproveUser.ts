import { useState } from "react";
import { useUpdateUserStatus } from "./useUpdateUserStatus";

interface ApproveUserPayload {
  userId: string;
  status: string;
}

interface ApproveUserResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const useApproveUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { updateUserStatus } = useUpdateUserStatus();

  const approveUser = async (payload: ApproveUserPayload): Promise<ApproveUserResult> => {
    setLoading(true);
    setError(null);

    try {
      const { userId, status } = payload;

      const updatePayload = { 
        userId,
        annotatorStatus: status 
      };

      const result = await updateUserStatus(updatePayload);

      if (result.success) {
        return { 
          success: true, 
          message: `User status updated to ${status}` 
        };
      } else {
        const errorMessage = result.error || "Failed to update user status";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while updating user status";
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
    approveUser,
    loading,
    error,
    resetState,
  };
};
