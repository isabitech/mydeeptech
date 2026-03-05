import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { persist, createJSONStorage } from "zustand/middleware";


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
  resultLink?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
}

type UserRoleType = "admin" | "user";


type UserInfoStates = {
  userInfo: UserInfo | null;
  userRoleType: UserRoleType | null;
};



type UserInfoActions = {
  setUserInfo: (userInfo: UserInfo | null) => void;
  clearUserInfo: () => void;
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
      clearUserInfo: () => set({ userInfo: null }),
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
        clearUserInfo: state.clearUserInfo,
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