import { storeTokenToStorage, storeUserInfoToStorage } from "../../helpers";
import { UserInfoData } from "../../store/useAuthStore";

const formatUserInfo = (data: any): UserInfoData => {

    if(data.role === "user") {
        return {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            domains: data.domains,
            socialsFollowed: data.socialsFollowed,
            consent: data.consent,
            isEmailVerified: data.isEmailVerified,
            hasSetPassword: data.hasSetPassword,
            annotatorStatus: data.annotatorStatus,
            microTaskerStatus: data.microTaskerStatus,
            resultLink: data.resultLink,
            qaStatus: data.qaStatus,
            isAssessmentSubmitted: data.isAssessmentSubmitted,
            role: "user",
        }
    }

    return {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            domains: data.domains,
            socialsFollowed: data.socialsFollowed,
            consent: data.consent,
            isEmailVerified: data.isEmailVerified,
            hasSetPassword: data.hasSetPassword,
            annotatorStatus: data.annotatorStatus,
            microTaskerStatus: data.microTaskerStatus,
            resultLink: data.resultLink,
            qaStatus: data.qaStatus,
            isAssessmentSubmitted: data.isAssessmentSubmitted,
            role_permission: data.role_permission,
            role: "admin",
    };
}


const persistUserInfo = async (rawUser: any): Promise<UserInfoData | null> => {
    if (!rawUser) return null;
    const userInfo: UserInfoData = formatUserInfo(rawUser.user ?? rawUser);
    await storeUserInfoToStorage(userInfo);
    await storeTokenToStorage(rawUser.token);
    return userInfo;
};

export { formatUserInfo, persistUserInfo };