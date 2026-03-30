import { useMutation } from "@tanstack/react-query";
import { useUserInfoActions } from "../../store/useAuthStore";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import { persistUserInfo } from "./_helper";
import { SignUpSchema } from "../../validators/authentication/user-signup-schema";


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
            const response = await axiosInstance.post(endpoints.authDT.loginDTUser, payload);
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

const authMutationService = {
    useUserSignin,
    useUserSignup,
}

export default authMutationService;