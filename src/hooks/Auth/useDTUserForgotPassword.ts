import { useState, useCallback } from "react";
import passwordResetService, { ApiResponse } from "../../service/PasswordResetService";

interface ForgotPasswordResult {
  success: boolean;
  data?: ApiResponse;
  error?: string;
}

export const useDTUserForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const requestPasswordReset = async (email: string): Promise<ForgotPasswordResult> => {
    setLoading(true);
    setError(null);

    try {
      if (!email.trim()) {
        const errorMessage = "Email address is required";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const errorMessage = "Please enter a valid email address";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const response = await passwordResetService.requestDTUserPasswordReset(email);

      if (response.success) {
        setEmailSent(true);
        return { success: true, data: response };
      } else {
        const errorMessage = response.message || "Failed to send reset email";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while sending the reset email. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setEmailSent(false);
  }, []);

  return {
    requestPasswordReset,
    loading,
    error,
    emailSent,
    resetState,
  };
};