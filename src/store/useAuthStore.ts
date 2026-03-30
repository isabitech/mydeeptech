import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import { retrieveUserInfoFromStorage, storeUserInfoToStorage } from "../helpers";

// Global navigation callback for avoiding page refreshes on logout
let globalNavigateCallback: ((path: string, options?: { replace?: boolean }) => void) | null = null;

export const setAuthStoreNavigate = (navigateCallback: ((path: string, options?: { replace?: boolean }) => void) | null) => {
  globalNavigateCallback = navigateCallback;
};


interface RBACPermission {
  _id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface RBACRole {
  _id: string;
  name: string;
  description: string;
  permissions: RBACPermission[];
  isActive: boolean;
}

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  domains?: string[];
  socialsFollowed?: any[];
  consent?: boolean;
  isEmailVerified?: boolean;
  hasSetPassword?: boolean;
  annotatorStatus?: string;
  microTaskerStatus?: string;
  qaStatus?: string;
  resultLink?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  role_permission?: RBACRole;
  isAssessmentSubmitted?: boolean;
}


type UserRoleType = "admin" | "user";

export type UserInfoData = 
| (UserInfo & { role: "user"; })
| (UserInfo & { role: "admin"; role_permission: RBACRole })



type UserInfoStates = {
  userInfo: UserInfoData | null;
  userRoleType: UserRoleType | null;
};



type UserInfoActions = {
  setUserInfo: (userInfo: UserInfoData | null) => void;
  setIsAssessmentSubmitted: () => Promise<void>;
  clearUserInfo: () => void;
  handleLogout: () => void;
};

 type UserInfoStore = UserInfoStates & UserInfoActions;

const initialStates: UserInfoStates = {
  userInfo: null,
  userRoleType: null,
};

const useUserInfoStore = create<UserInfoStore>()(
  persist(
    (set) => ({
      ...initialStates,
      // --- Actions ---
      setUserInfo: (userInfo) => set({ userInfo, userRoleType: (userInfo?.role as UserRoleType) || null }),

        setIsAssessmentSubmitted: async () => {
  
          const userInfo = await retrieveUserInfoFromStorage();

          if (userInfo && userInfo.role === "user") {
            userInfo.isAssessmentSubmitted = true;
          }
    
          await storeUserInfoToStorage(userInfo);
    
           set((state) => ({
            ...state,
            userInfo: state.userInfo?.role === "user"
              ? { ...state.userInfo, isAssessmentSubmitted: true }
              : state.userInfo,
          }));
        },
      clearUserInfo: () => set({ userInfo: null }),
      handleLogout: () => {
        // Clear session storage
        sessionStorage.removeItem('ACCESS_TOKEN');
        sessionStorage.removeItem('userInfo');

        // Clear local storage
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('userInfo');
        
        // Clear all session storage to ensure complete logout
        sessionStorage.clear();

        // Clear all local storage to ensure complete logout
        localStorage.clear();
        
        set({ userInfo: null });


        // Use global navigate callback if available (no page refresh)
        // Otherwise fall back to window.location.replace
        if (globalNavigateCallback) {
          globalNavigateCallback('/login', { replace: true });
        } else {
          console.warn('No global navigate callback set in auth store. Using window.location.replace which causes page refresh.');
          window.location.replace('/login');
        }
      },
    }),
    {
      name: 'user-info-storage', // unique name for sessionStorage key
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage
      partialize: (state) => ({
        userInfo: state.userInfo, // only persist userInfo
        userRoleType: state.userRoleType, // persist userRoleType
      }),
    }
  )
);


const useUserInfoActions = () => {
return  useUserInfoStore(
    useShallow((state) => ({
        setUserInfo: state.setUserInfo,
        setIsAssessmentSubmitted: state.setIsAssessmentSubmitted,
        clearUserInfo: state.clearUserInfo,
        handleLogout: state.handleLogout,
    }))
)}

const useUserInfoStates = () => {
return  useUserInfoStore(
    useShallow((state) => ({
        userInfo: state.userInfo,
        userRoleType: state.userRoleType,
    }))
)}


export type { UserInfoStore, UserInfoStates, UserInfoActions };
export { useUserInfoStates, useUserInfoActions, useUserInfoStore };