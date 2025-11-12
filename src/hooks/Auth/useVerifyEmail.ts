import { useState } from "react";
import { endpoints } from "../../store/api/endpoints";

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    isVerified: boolean;
  };
}

interface SetupPasswordPayload {
  userId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SetupPasswordResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    isVerified: boolean;
    hasPassword: boolean;
  };
}

export const useVerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const verifyEmail = async (userId: string, email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.authDT.verifyEmail}/${userId }?email=${email}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: VerifyEmailResponse = await response.json();

      if (data.success) {
        setIsVerified(true);
        setUserData(data.user);
        return { success: true, data };
      } else {
        setError(data.message || "Email verification failed");
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || "Email verification failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const setupPassword = async (payload: SetupPasswordPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.authDT.setUpPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: SetupPasswordResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        setError(data.message || "Password setup failed");
        return { success: false, error: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || "Password setup failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setIsVerified(false);
    setUserData(null);
  };

  return {
    verifyEmail,
    setupPassword,
    loading,
    error,
    isVerified,
    userData,
    resetState,
  };
};