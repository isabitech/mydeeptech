import { useState, useCallback, useEffect } from "react";
import { endpoints } from "../../../store/api/endpoints";

interface ResendOTPPayload {
  email: string;
  adminKey: string;
}

interface ResendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expiresIn: string;
    message: string;
  };
}

interface ResendOTPResult {
  success: boolean;
  data?: ResendOTPResponse;
  error?: string;
}

export const useAdminResendOTP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // 30 seconds cooldown between resend attempts
  const RESEND_COOLDOWN = 30000; // 30 seconds

  // Update timer every second
  useEffect(() => {
    if (!lastResendTime) {
      setCanResend(true);
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - lastResendTime;
      const remaining = RESEND_COOLDOWN - elapsed;
      
      if (remaining <= 0) {
        setCanResend(true);
        setTimeRemaining(0);
      } else {
        setCanResend(false);
        setTimeRemaining(Math.ceil(remaining / 1000));
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastResendTime]);

  const resendOTP = async (payload: ResendOTPPayload): Promise<ResendOTPResult> => {
    if (!canResend) {
      return { 
        success: false, 
        error: `Please wait ${timeRemaining} seconds before resending` 
      };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.adminAuth.resendOTP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: ResendOTPResponse = await response.json();

      if (data.success) {
        setLastResendTime(Date.now());
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to resend OTP";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while resending OTP. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setLastResendTime(null);
    setCanResend(true);
    setTimeRemaining(0);
  }, []);

  return {
    resendOTP,
    loading,
    error,
    canResend,
    timeRemaining,
    resetState,
  };
};