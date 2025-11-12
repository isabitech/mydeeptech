
import { useState, useCallback } from "react";
import { endpoints } from "../../store/api/endpoints";

export interface ResetPasswordResponse {
  success: boolean
  message: string
  user: User
}

export interface User {
  id: string
  fullName: string
  email: string
  hasSetPassword: boolean
  updatedAt: string
}

interface ResetPasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ResetPasswordResult {
  success: boolean;
  data?: ResetPasswordResponse;
  error?: string;
}

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (payload: ResetPasswordPayload): Promise<ResetPasswordResult> => {
    setLoading(true);
    setError(null);

    try {
      // Client-side password confirmation check
      if (payload.newPassword !== payload.confirmNewPassword) {
        const errorMessage = "Passwords do not match";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.authDT.resetPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: payload.oldPassword,
          newPassword: payload.newPassword,
          confirmNewPassword: payload.confirmNewPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: ResetPasswordResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Password reset failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during password reset. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

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