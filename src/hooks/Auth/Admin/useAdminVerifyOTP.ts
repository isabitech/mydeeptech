import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { AdminAuthResponse, AdminAuthResult } from "../../../types/admin";

interface VerifyOTPPayload {
  verificationCode: string;
  email: string;
  adminKey: string;
}

export const useAdminVerifyOTP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOTP = async (payload: VerifyOTPPayload): Promise<AdminAuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.adminAuth.verifyOTP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: AdminAuthResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "OTP verification failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during OTP verification. Please try again.";
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
    verifyOTP,
    loading,
    error,
    resetState,
  };
};