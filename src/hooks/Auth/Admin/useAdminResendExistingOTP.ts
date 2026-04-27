import { useState, useCallback, useEffect } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { getErrorMessage } from "../../../service/apiUtils";

interface ResendExistingOTPPayload {
  email: string;
}

interface ResendExistingOTPResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expiresIn: string;
    message: string;
  };
}

interface ResendExistingOTPResult {
  success: boolean;
  data?: ResendExistingOTPResponse;
  error?: string;
}

export const useAdminResendExistingOTP = () => {
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

  const resendOTP = async (payload: ResendExistingOTPPayload): Promise<ResendExistingOTPResult> => {
    if (!canResend) {
      return { 
        success: false, 
        error: `Please wait ${timeRemaining} seconds before resending` 
      };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.adminAuth.resendOTPExisting}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: ResendExistingOTPResponse = await response.json();

      if (data.success) {
        setLastResendTime(Date.now());
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to resend OTP";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err) || "An error occurred while resending OTP. Please try again.";
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