import { storeTokenToStorage, storeUserInfoToStorage } from "../../helpers";
import { AdminInfo, LoginResponse, UserInfo, UserInfoData } from "../../store/useAuthStore";
import { LoginResponseSchema } from "../../validators/authentication/user-schema";

const isUserData = (data: LoginResponse): data is LoginResponseSchema => {
  return "user" in data;
};


const formatUserInfo = (data: LoginResponse): UserInfoData => {

    const isUser = isUserData(data);
    const raw = isUser ? (data.user) : data.admin;

    // Base data
    const base = {
        id: raw._id || (raw as typeof raw & {id?: string}).id || '',
        fullName: raw.fullName,
        email: raw.email,
        phone: raw.phone,
        domains: raw.domains,
        role: raw.role,
        isAdmin: !isUser,
        isEmailVerified: raw.isEmailVerified,
        hasSetPassword: raw.hasSetPassword,
        annotatorStatus: raw.annotatorStatus,
        microTaskerStatus: raw.microTaskerStatus,
        qaStatus: raw.qaStatus,
    };

    // User data
    if(isUser) {
            const user = data.user;
            return {
            ...base,
            socialsFollowed: user.socialsFollowed,
            consent: user.consent,
            resultLink: user.resultLink,
            isAssessmentSubmitted: user.isAssessmentSubmitted,
        } as UserInfo;
    }

    const admin = data.admin;
    //Admin data
    return {
        ...base,
        role: admin.role_permission.name ?? "admin",
        role_permission: admin.role_permission,
    } as AdminInfo;

}


const persistUserInfo = async (rawUser: LoginResponse): Promise<UserInfoData | null> => {
    if (!rawUser) return null;
    const userInfo: UserInfoData = formatUserInfo(rawUser);
    await storeUserInfoToStorage(userInfo);
    await storeTokenToStorage(rawUser.token);
    return userInfo;
};

export { formatUserInfo, persistUserInfo };