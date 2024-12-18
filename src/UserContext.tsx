import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the user info
interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  phone: string;
  userName: string;
  userRole: string;
}

// Default user info object
const defaultUserInfo: UserInfo = {
  firstName: "",
  lastName: "",
  email: "",
  userId: "",
  phone: "",
  userName: "",
  userRole: "",
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
