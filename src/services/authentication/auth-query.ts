import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { useUserInfoActions } from "../../store/useAuthStore";
import { persistUserInfo } from "./_helper";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";


const useProfile = () => {

    const { setUserInfo } = useUserInfoActions();

    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.userProfile],
        queryFn: async () => {
            const response =  await axiosInstance.get(endpoints.authDT.me);
            const userInfo = await persistUserInfo(response.data);
            if (userInfo) setUserInfo(userInfo);
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
}

export default authService;