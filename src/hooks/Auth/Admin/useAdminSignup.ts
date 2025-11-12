import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";

interface AdminSignupPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  adminKey: string;
}


export interface AdminSignupResponse {
  success: boolean
  message: string
  otpVerificationRequired: boolean
  admin: Admin
}

export interface Admin {
  id: string
  fullName: string
  email: string
  phone: string
  domains: string[]
  isEmailVerified: boolean
  hasSetPassword: boolean
  annotatorStatus: string
  microTaskerStatus: string
  createdAt: string
  isAdmin: boolean
}


interface AdminSignupResult {
  success: boolean;
  data?: AdminSignupResponse;
  error?: string;
}

export const useAdminSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (payload: AdminSignupPayload): Promise<AdminSignupResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.adminAuth.signup}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: AdminSignupResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Admin signup failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during admin signup. Please try again.";
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
    signup,
    loading,
    error,
    resetState,
  };
};