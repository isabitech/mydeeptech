import { useState } from "react";
import { endpoints } from "../../store/api/endpoints";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notification } from "antd";
import { useUserContext } from "../../UserContext";
import { storeUserInfoToStorage, storeTokenToStorage } from "../../helpers";
import { apiPost, getErrorMessage } from "../../service/apiUtils";

interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  domains: string[];
  socialsFollowed: any[];
  consent: boolean;
  isEmailVerified: boolean;
  hasSetPassword: boolean;
  annotatorStatus: string;
  microTaskerStatus: string;
  resultLink: string;
  createdAt: string;
  updatedAt: string;
  qaStatus: string;

}

interface LoginResult {
  success: boolean;
  data?: LoginResponse;
  error?: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUserInfo } = useUserContext();

  const login = async (payload: LoginPayload): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: LoginResponse = await apiPost(endpoints.authDT.loginDTUser, payload);

      console.log(data);

      if (data.success && data.user) {
        // Check if user has verified email and set password
        if (!data.user.isEmailVerified) {
            notification.open({
                type: "warning",
                message: "Please verify your email before logging in. Check your inbox for verification link."
            })
        toast.error("Please verify your email before logging in. Check your inbox for verification link.");
          setError("Please verify your email before logging in. Check your inbox for verification link.");
          return { success: false, error: "Email not verified" };
        }

        if (!data.user.hasSetPassword) {
            notification.open({
                type: "warning",
                message: "Please complete your account setup by setting a password."
            })
          setError("Please complete your account setup by setting a password.");
          return { success: false, error: "Password not set" };
        }

        // Set user info to context
        const userInfo = {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          domains: data.user.domains,
          socialsFollowed: data.user.socialsFollowed,
          consent: data.user.consent,
          isEmailVerified: data.user.isEmailVerified,
          hasSetPassword: data.user.hasSetPassword,
          annotatorStatus: data.user.annotatorStatus,
          microTaskerStatus: data.user.microTaskerStatus,
          resultLink: data.user.resultLink,
          qaStatus: data.user.qaStatus,
        };

        setUserInfo(userInfo);

        // Store user information and token using encrypted storage
        await storeUserInfoToStorage(userInfo);
        await storeTokenToStorage(data.token);

        // Navigate based on user status or role
        // You can customize this navigation logic based on your needs
        if (data.user.annotatorStatus || data.user.microTaskerStatus) {
            notification.open({
                type: "success",
                message: "Login successful! "
            });
          navigate("/dashboard/overview");
        } else {
          navigate("/admin/overview"); // Default navigation
        }

        return { success: true, data };
      } else {
        const errorMessage = data.message || "Login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    login,
    loading,
    error,
    resetState,
  };
};