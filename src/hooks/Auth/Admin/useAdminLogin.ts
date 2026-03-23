import { useState, useCallback, useEffect } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { storeUserInfoToStorage, storeTokenToStorage } from "../../../helpers";
import { useUserInfoActions } from "../../../store/useAuthStore";
import axiosInstance from "../../../service/axiosApi";
import { getDefaultRedirectPath } from "../../../utils/permissions";
import ErrorMessage from "../../../lib/error-message";

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminLoginResult {
  success: boolean;
  data?: any;
  error?: string;
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
          });
          return { success: false };
        }

        if (!data.admin.hasSetPassword) {
          notification.warning({
            message: "Complete account setup first",
          });
          return { success: false };
        }

        // store user
        const adminInfo = {
          id: data.admin.id,
          fullName: data.admin.fullName,
          email: data.admin.email,
          role: data.admin.role,
          phone: data.admin.phone,
          isEmailVerified: data.admin.isEmailVerified,
          hasSetPassword: data.admin.hasSetPassword,
          role_permission: data.admin.role_permission,
        };
        await storeTokenToStorage(data.token);
        setUserInfo(adminInfo);

        localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", data.token);

        notification.success({
          message: "Login successful",
        });

        // 🎯 Smart redirect
        const target = getDefaultRedirectPath(
          data.admin?.role_permission?.permissions,
          data.admin?.role_permission?.name
        );

        navigate(from ?? target, { replace: true });

        return { success: true, data };
      }

      setError(data.message);
      return { success: false };
    } catch (err: any) {
      const errorMessage = ErrorMessage(err);
      setError(errorMessage);
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