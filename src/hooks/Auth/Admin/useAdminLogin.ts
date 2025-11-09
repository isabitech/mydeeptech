import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { storeUserInfoToStorage, storeTokenToStorage } from "../../../helpers";

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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (payload: AdminLoginPayload): Promise<AdminLoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.adminAuth.login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: AdminLoginResponse = await response.json();

      console.log(data);

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
        await storeTokenToStorage(data.token);

        notification.success({
          message: "Login successful!",
          description: "Welcome to the admin dashboard."
        });

        // Navigate to admin dashboard
        navigate("/admin/overview");

        return { success: true, data };
      } else {
        const errorMessage = data.message || "Admin login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during login. Please try again.";
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