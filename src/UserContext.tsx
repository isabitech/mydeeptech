import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the user info - updated to match login response
export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  domains: string[];
  socialsFollowed: any[];
  consent: boolean;
  isEmailVerified: boolean;
  hasSetPassword: boolean;
  annotatorStatus: string;
  microTaskerStatus: string;
  resultLink: string;
}

// Default user info object
const defaultUserInfo: UserInfo = {
  id: "",
  fullName: "",
  email: "",
  phone: "",
  domains: [],
  socialsFollowed: [],
  consent: false,
  isEmailVerified: false,
  hasSetPassword: false,
  annotatorStatus: "",
  microTaskerStatus: "",
  resultLink: "",
};

// Create the context
const UserContext = createContext<{
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
}>({
  userInfo: defaultUserInfo,
  setUserInfo: () => {},
});

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the UserContext
export const useUserContext = () => useContext(UserContext);
