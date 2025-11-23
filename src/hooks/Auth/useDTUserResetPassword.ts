import { useState, useCallback } from "react";
import passwordResetService, { ApiResponse } from "../../service/PasswordResetService";

interface ResetPasswordResult {
  success: boolean;
  data?: ApiResponse;
  error?: string;
}

export const useDTUserResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const verifyToken = async (token: string): Promise<boolean> => {
    if (!token) {
      setError("Invalid or missing reset token");
      return false;
    }

    setIsValidatingToken(true);
    setError(null);

    try {
      const response = await passwordResetService.verifyResetToken(token);
      if (response.success) {
        setIsTokenValid(true);
        return true;
      } else {
        setError("Reset token is invalid or expired");
        setIsTokenValid(false);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || "Token validation failed";
      setError(errorMessage);
      setIsTokenValid(false);
      return false;
    } finally {
      setIsValidatingToken(false);
    }
  };

  const resetPassword = async (
    token: string, 
    password: string, 
    confirmPassword: string
  ): Promise<ResetPasswordResult> => {
    setLoading(true);
    setError(null);

    try {
      // Client-side validation
      if (!password || !confirmPassword) {
        const errorMessage = "All fields are required";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (password.length < 8) {
        const errorMessage = "Password must be at least 8 characters long";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      if (password !== confirmPassword) {
        const errorMessage = "Passwords do not match";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (!token) {
        const errorMessage = "Reset token is missing";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const response = await passwordResetService.resetDTUserPassword(token, password, confirmPassword);

      if (response.success) {
        setPasswordReset(true);
        return { success: true, data: response };
      } else {
        const errorMessage = response.message || "Failed to reset password";
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
    setIsValidatingToken(false);
    setIsTokenValid(false);
    setPasswordReset(false);
  }, []);

  return {
    verifyToken,
    resetPassword,
    loading,
    error,
    isValidatingToken,
    isTokenValid,
    passwordReset,
    resetState,
  };
};