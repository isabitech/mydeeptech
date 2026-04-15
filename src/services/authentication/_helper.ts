import { storeTokenToStorage, storeUserInfoToStorage } from "../../helpers";
import { AdminInfo, LoginResponse, UserInfo, UserInfoData } from "../../store/useAuthStore";
import { LoginResponseSchema } from "../../validators/authentication/user-schema";

const isUserData = (data: LoginResponse): data is LoginResponseSchema => {
  return "user" in data;
};


const formatUserInfo = (data: LoginResponse): UserInfoData => {
    // console.log("🔧 formatUserInfo input:", data);
    
    const isUser = isUserData(data);
    // console.log("👤 Is User Data:", isUser);
    
    const raw = isUser ? (data.user) : data.admin;
    // console.log("📦 Raw user/admin data:", raw);

    // Base data
    const base = {
        id: raw._id || (raw as typeof raw & {id?: string}).id || '',
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
    
    // console.log("📝 Base data created:", base);

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
        
        // console.log("✅ Returning User Info:", userResult);
        return userResult;
    }

    const admin = data.admin;
    //Admin data
    const adminResult = {
        ...base,
        role: admin.role_permission.name ?? "admin",
        role_permission: admin.role_permission,
    } as AdminInfo;
    
    // console.log("✅ Returning Admin Info:", adminResult);
    return adminResult;

}


const persistUserInfo = async (rawUser: LoginResponse): Promise<UserInfoData | null> => {
    if (!rawUser) return null;
    const userInfo: UserInfoData = formatUserInfo(rawUser);
    await storeUserInfoToStorage(userInfo);
    await storeTokenToStorage(rawUser.token);
    return userInfo;
};

export { formatUserInfo, persistUserInfo };