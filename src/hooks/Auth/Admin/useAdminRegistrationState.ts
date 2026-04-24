import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";

interface RegistrationStateData {
  currentStep: "signup" | "verify-otp";
  formData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    adminKey: string;
  };
  adminId?: string;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    lastDeviceType: string;
  };
  lastUpdated: string;
}

interface RegistrationStateResponse {
  success: boolean;
  message: string;
  data?: RegistrationStateData;
}

interface RegistrationStateResult {
  success: boolean;
  data?: RegistrationStateData;
  error?: string;
}

export const useAdminRegistrationState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get registration state by email
  const getRegistrationState = async (email: string): Promise<RegistrationStateResult> => {
    if (!email) {
      return { success: false, error: "Email is required" };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoints.adminAuth.getRegistrationState}/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: "NO_REGISTRATION_STATE" };
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RegistrationStateResponse = await response.json();

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to retrieve registration state";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while retrieving registration state";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Save registration state
  const saveRegistrationState = async (payload: {
    email: string;
    currentStep: "signup" | "verify-otp";
    formData: RegistrationStateData["formData"];
    adminId?: string;
  }): Promise<RegistrationStateResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoints.adminAuth.saveRegistrationState}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RegistrationStateResponse = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        const errorMessage = data.message || "Failed to save registration state";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while saving registration state";
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
    getRegistrationState,
    saveRegistrationState,
    loading,
    error,
    resetState,
  };
};