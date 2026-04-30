import { CONSTANTS } from "../../config/constants";
import { storeTokenToStorage, storeUserInfoToStorage } from "../../helpers";
import { AdminInfo, LoginResponse, UserInfo, UserInfoData } from "../../store/useAuthStore";
import { LoginResponseSchema } from "../../validators/authentication/user-schema";

const isUserData = (data: LoginResponse): data is LoginResponseSchema => {
    if(typeof data === "object" && 
        data !== null && "user" in data && 
        data.user !== undefined && 
        typeof data.user.email === "string") {
        return true;
    } else {
        return false;
    }
};

const formatUserInfo = (data: LoginResponse): UserInfoData => {
    
    const isUser = isUserData(data);
    const raw = isUser ? (data.user) : (data.admin);

    if (!raw) {
       throw new Error("Invalid login response: expected data was not returned");
    }

    if(isUser && isRestrictedEmail(raw.email)) {
        throw new Error("Invalid credentials: Please check your email and password and try again.");
    }

    // Base data
    const base = {
        id: raw?._id || (raw as typeof raw & {id?: string}).id || '',
        fullName: raw.fullName,
        email: raw.email,
        phone: raw.phone,
        domains: raw.domains || [], // Legacy domain field
        userDomains: raw.userDomains || [], // New structured domain field
        role: raw.role || (isUser ? 'user' : 'admin'), // Default role based on user type
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
        const userResult = {
            ...base,
            socialsFollowed: user.socialsFollowed,
            consent: user.consent,
            resultLink: user.resultLink,
            isAssessmentSubmitted: user.isAssessmentSubmitted,
        } as UserInfo;

        return userResult;
    }

    //Admin data
    const admin = data.admin;
    const adminResult = {
        ...base,
        role: admin.role_permission.name ?? "admin",
        role_permission: admin.role_permission,
    } as AdminInfo;
    
    return adminResult;
}


const persistUserInfo = async (rawUser: LoginResponse): Promise<UserInfoData | null> => {
    if (!rawUser) return null;
    const userInfo: UserInfoData = formatUserInfo(rawUser);
    
    // Determine role for token storage
    const isUser = isUserData(rawUser);
    const roleType = isUser ? 'user' : 'admin';
    
    await storeUserInfoToStorage(userInfo, roleType);
    await storeTokenToStorage(rawUser.token, roleType);
    return userInfo;
};

const isRestrictedEmail = (email: string): boolean => {
    if (email.includes(CONSTANTS.RESTRICTED_EMAIL_DOMAIN)) {
      return true;
    }
    return false;
  };

export { formatUserInfo, persistUserInfo, isRestrictedEmail };