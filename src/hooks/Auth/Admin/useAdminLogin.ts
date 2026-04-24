import { useState, useCallback, useEffect } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { useUserInfoActions } from "../../../store/useAuthStore";
import axiosInstance from "../../../service/axiosApi";
import { getDefaultRedirectPath } from "../../../utils/permissions";
import { formatUserInfo, persistUserInfo } from "../../../services/authentication/_helper";
import errorMessage from "../../../lib/error-message";
import { AdminAuthResponse } from "../../../types/admin";

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminLoginResult {
  success: boolean;
  data?: AdminAuthResponse;
  error?: string;
}

// Type for axios error response
interface AxiosError {
  response?: {
    status: number;
    data: unknown;
  };
}

// Type for direct error format
interface DirectError {
  status: number;
  data: unknown;
}

// Type guard for axios error
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as AxiosError).response === 'object' &&
    (error as AxiosError).response !== null
  );
}

// Type guard for direct error
function isDirectError(error: unknown): error is DirectError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'data' in error &&
    typeof (error as DirectError).status === 'number'
  );
}

// Type guard for EMAIL_NOT_VERIFIED error response
function isEmailNotVerifiedError(data: unknown): data is { code: string; data: { email: string; fullName?: string } } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    (data as { code: string }).code === 'EMAIL_NOT_VERIFIED' &&
    'data' in data &&
    typeof (data as { data: unknown }).data === 'object'
  );
}

export const useAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    return localStorage.getItem("authError") || null;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { setUserInfo } = useUserInfoActions();

  // 🔥 Handle both string + object safely
  const from =
    typeof location.state?.from === "string"
      ? location.state.from
      : location.state?.from?.pathname;

  useEffect(() => {
    const authError = localStorage.getItem("authError");
    if (authError) setError(authError);
  }, []);

  const login = async (payload: AdminLoginPayload): Promise<AdminLoginResult> => {
    setLoading(true);
    localStorage.removeItem("authError");

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}${endpoints.adminAuth.login}`,
        payload
      );

      const data = response.data;

      if (data.success && data.admin) {
        // validations
        if (!data.admin.isEmailVerified) {
          notification.warning({
            message: "Verify your email before logging in",
            key: "email-verification-required",
          });
          return { success: false };
        }

        if (!data.admin.hasSetPassword) {
          notification.warning({
            message: "Complete account setup first",
            key: "account-setup-required",
          });
          return { success: false };
        }

        // Store user information
        const adminInfo = formatUserInfo(data);
        // Store in encrypted sessionStorage only - more secure for admin auth
        await persistUserInfo(data);
        setUserInfo(adminInfo);
        
        notification.success({
          message: "Login successful",
          key: "admin-login-success",
        });

        // Smart redirect based on permissions
        const target = getDefaultRedirectPath(
          data.admin?.role_permission?.permissions,
          data.admin?.role_permission?.name
        );
        
        navigate(from ?? target, { replace: true });

        return { success: true, data };
      }

      setError(data.message);
      return { success: false };
    } catch (err: unknown) {
      // Check if this is a 403 error for unverified email
      let errorData: unknown = null;
      let errorStatus: number | null = null;
      
      if (isAxiosError(err)) {
        // Handle axios response format
        errorStatus = err.response?.status ?? null;
        errorData = err.response?.data ?? null;
      } else if (isDirectError(err)) {
        // Handle direct error format
        errorStatus = err.status;
        errorData = err.data;
      }
        
      if (errorStatus === 403 && isEmailNotVerifiedError(errorData)) {
        const responseData = errorData.data;
        
        notification.info({
          message: "Email Verification Required",
          description: `Please complete email verification to access your account.`,
          duration: 5,
          key: "email-verification-required",
        });

        // Redirect to admin signup page with OTP verification step and pre-filled email
        navigate('/auth/admin-signup', {
          state: {
            step: 'verify-otp',
            email: responseData.email,
            fullName: responseData.fullName,
            message: 'Please complete email verification to access your account',
            fromLogin: true
          }
        });

        return { success: false, error: "EMAIL_NOT_VERIFIED" };
      }

      const errorMsg = errorMessage(err);
      setError(errorMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { login, loading, error, resetState };
};