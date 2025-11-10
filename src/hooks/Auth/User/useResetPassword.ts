import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiPatch, apiPost, getErrorMessage } from "../../../service/apiUtils";

interface ResetPasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface HookOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (passwordData: ResetPasswordForm): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: ResetPasswordResponse = await apiPatch(endpoints.authDT.resetPassword, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to reset password";
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
  }, []);

  return {
    resetPassword,
    loading,
    error,
    resetState,
  };
};