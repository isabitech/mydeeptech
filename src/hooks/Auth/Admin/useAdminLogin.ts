import { useState, useCallback, useEffect } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { storeUserInfoToStorage, storeTokenToStorage } from "../../../helpers";
import { useUserInfoActions } from "../../../store/useAuthStore";
import axiosInstance from "../../../service/axiosApi";
import ErrorMessage from "../../../lib/error-message";

interface AdminLoginPayload {
  email: string;
  password: string;
}



export interface AdminLoginResponse {
  success: boolean
  message: string
  _usrinfo: Usrinfo
  token: string
  admin: Admin
}

export interface Usrinfo {
  data: string
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
  role: string
}

interface AdminLoginResult {
  success: boolean;
  data?: AdminLoginResponse;
  error?: string;
}

export const useAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    return localStorage.getItem('authError') || null;
  });

  const location = useLocation();
  const navigate = useNavigate();

  const { setUserInfo } = useUserInfoActions();

  const from = location.state?.from?.pathname;

  useEffect(() => {
    const authError = localStorage.getItem('authError');
    if (authError) {
      setError(authError);
    }
  }, []);

  const login = async (payload: AdminLoginPayload): Promise<AdminLoginResult> => {
    setLoading(true);
    
    // Clear backup error from localStorage when starting new login attempt
    localStorage.removeItem('authError');

    try {
    
      const response = await axiosInstance.post<AdminLoginResponse>(`${import.meta.env.VITE_API_URL}${endpoints.adminAuth.login}`, payload);
      const data = response.data;

      if (data.success && data.admin) {
        // Check if admin has verified email and set password
        if (!data.admin.isEmailVerified) {
          notification.open({
            type: "warning",
            message: "Please verify your email before logging in. Check your inbox for verification link."
          });
          setError("Please verify your email before logging in.");
          return { success: false, error: "Email not verified" };
        }

        if (!data.admin.hasSetPassword) {
          notification.open({
            type: "warning",
            message: "Please complete your account setup by setting a password."
          });
          setError("Please complete your account setup by setting a password.");
          return { success: false, error: "Password not set" };
        }

        // Store admin info and token
        const adminInfo = {
          id: data.admin.id,
          fullName: data.admin.fullName,
          email: data.admin.email,
          role: data.admin.role,
          phone: data.admin.phone,
          isEmailVerified: data.admin.isEmailVerified,
          hasSetPassword: data.admin.hasSetPassword,
        };

        await storeUserInfoToStorage(adminInfo);
        setUserInfo(adminInfo);
        await storeTokenToStorage(data.token);

        // Clear backup error on successful login
        localStorage.removeItem('authError');
        setError(null);

        notification.success({
          message: "Login successful!",
          description: "Welcome to the admin dashboard."
        });

        // Navigate to admin dashboard
        navigate(from ?? "/admin/overview");

        return { success: true, data };
      } else {
        const errorMessage = data.message || "Admin login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = ErrorMessage(err);
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
    login,
    loading,
    error,
    resetState,
  };
};