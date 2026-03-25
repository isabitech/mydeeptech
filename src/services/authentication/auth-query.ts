import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { useUserInfoActions } from "../../store/useAuthStore";
import { formatUserInfo } from "./_helper";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { storeTokenToStorage, storeUserInfoToStorage } from "../../helpers";

const useUserSignup = () => {}
const useUserSignin = () => {}

const useProfile = () => {
    const { setUserInfo } = useUserInfoActions();
    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.userProfile],
        queryFn: async () => {

            const response =  await axiosInstance.get(endpoints.authDT.me);

            if(response.data) {
                const userInfo = formatUserInfo(response.data.user);
                await storeUserInfoToStorage(userInfo);
                await storeTokenToStorage(response.data.token);
                setUserInfo(userInfo);
            }

            return response.data;
        },
       refetchOnMount: true,
       refetchOnWindowFocus: true,
       refetchOnReconnect: true,
    });

    return {
        data: query,
        userProfile: query.data,
        isUserProfileLoading: query.isLoading,
        isUserProfileError: query.isError,
        userProfileError: query.error,
        userProfileRefetch: query.refetch,
    }
}

const authService = {
    useProfile,
    useUserSignup,
    useUserSignin,
}

export default authService;