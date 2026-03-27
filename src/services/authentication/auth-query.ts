import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { useUserInfoActions } from "../../store/useAuthStore";
import { persistUserInfo } from "./_helper";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { useEffect } from "react";

const useProfile = () => {

    const { setUserInfo } = useUserInfoActions();

    const query = useQuery({
        queryKey: [REACT_QUERY_KEYS.QUERY.userProfile],
        queryFn: async () => {
            const response = await axiosInstance.get(endpoints.authDT.me);
            return response.data;
        },
    });

    useEffect(() => {
        const updateSessionStorage = async () => {
            if (query.data) {
                const userInfo = await persistUserInfo(query.data);
                if (userInfo) setUserInfo(userInfo);
            }
        };
        updateSessionStorage();
    }, [query.data]);

    return {
        userProfile: query.data,
        isUserProfileLoading: query.isLoading,
        isUserProfileError: query.isError,
        userProfileError: query.error,
        isUserProfileFetching: query.isFetching,
        userProfileRefetch: () => query.refetch(),
    }
}

const authService = {
    useProfile,
}

export default authService;