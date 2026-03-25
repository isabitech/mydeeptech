import { useMutation } from "@tanstack/react-query";
import { useUserInfoActions } from "../../store/useAuthStore";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { endpoints } from "../../store/api/endpoints";
import axiosInstance from "../../service/axiosApi";
import { persistUserInfo } from "./_helper";
import { signUpSchema } from "../../validators/authentication/user-signup-schema";


const useUserSignup = () => {
    const mutation  = useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.userSignup],
        mutationFn: async (payload: signUpSchema) => {
            const response = await axiosInstance.post(endpoints.authDT.createDTUser, payload);
            return response.data;
        },
    });

    return {
        mutation,
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
            const userInfo = await persistUserInfo(response.data);
            if (userInfo) setUserInfo(userInfo);
            return response.data;
        },
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