import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { retrieveTokenFromStorage } from "../../../helpers";
import { useState, useEffect } from "react";
import UserHeader from "./UserHeader";
import { useLogin } from "../../../hooks/Auth/useLogin";


const DashboardLayout = () => {
  const [token, setToken] = useState<string>('');
  const { loading } = useLogin();

  useEffect(() => {
    const getToken = async () => {
      try {
        const retrievedToken = await retrieveTokenFromStorage();
        setToken(retrievedToken || '');
      } catch (error) {
        console.error('Failed to retrieve token:', error);
        setToken('');
      }
    };

    getToken();
  }, []);

  if(loading) {
    return <div className="h-screen w-screen bg-gradient-to-br from-primary via-primary to-background-accent flex items-center justify-center p-4"></div>
  }

  return (
      <>
      <div className="flex h-screen w-full">
         <Sidebar />
        <div className="grid grid-rows-[auto_1fr] grid-cols-1 w-full">
         <UserHeader />
          {/* Main Content */}
          <div className="bg-gray-100 p-6 overflow-y-auto w-full flex flex-col flex-1">
            <Outlet />
          </div>
        </div>
      </div>
      </>
  );
};

export default DashboardLayout;
