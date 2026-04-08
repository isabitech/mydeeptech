import { useMutation } from "@tanstack/react-query";
import { LoginResponse, useUserInfoActions } from "../../store/useAuthStore";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import { persistUserInfo } from "./_helper";
import { EmailSchema, SignUpSchema } from "../../validators/authentication/user-signup-schema";
import { ResetPasswordSchema } from "../../validators/authentication/user-reset-password-schema";

const useUserSignup = () => {
    const mutation  = useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.userSignup],
        mutationFn: async (payload: SignUpSchema) => {
            const response = await axiosInstance.post(endpoints.authDT.createDTUser, payload);
            return response.data;
        },
    });

    return {
        signupMutation: mutation,
        isSignupLoading: mutation.isPending,
        isSignupError: mutation.isError,
        signupError: mutation.error,
    }
}

const useUserSignin = () => {

    const { setUserInfo } = useUserInfoActions();

    const mutation  = useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.userSignin],
        mutationFn: async (payload: { email: string; password: string }) => {
            const response = await axiosInstance.post<LoginResponse>(endpoints.authDT.loginDTUser, payload);
            return response.data;
        },
        onSuccess: async (data) => {
            const userInfo = await persistUserInfo(data);
            if (userInfo) setUserInfo(userInfo);
        }
    });

    return {
        mutation,
        signinMutation: mutation,
        isSigninLoading: mutation.isPending,
        isSigninError: mutation.isError,
        signinError: mutation.error,
    }
}

const useResetPassword = () => {
   const mutation =  useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.resetPassword],
        mutationFn: async (payload: ResetPasswordSchema) => {
            const response = await axiosInstance.post(endpoints.authDT.resetPassword, payload);
            return response.data;
        }
    });
    return {
        resetPasswordMutation: mutation,
        isResetPasswordLoading: mutation.isPending,
        isResetPasswordError: mutation.isError,
        resetPasswordError: mutation.error,
    };
}

/**
 *   async requestDTUserPasswordReset(email: string): Promise<ApiResponse> {
     return this.request(endpoints.authDT.forgotPassword, {
       method: 'POST',
       body: JSON.stringify({ email }),
     });
   }
 */

   const useForgotPassword = () => {
    const mutation = useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.forgotPassword],
        mutationFn: async (email: EmailSchema) => {
            const response = await axiosInstance.post(endpoints.authDT.forgotPassword, { email });
            return response.data;
        }
    });

    return mutation;
}   

const authMutationService = {
    useUserSignin,
    useUserSignup,
    useResetPassword,
    useForgotPassword,
}

export default authMutationService;