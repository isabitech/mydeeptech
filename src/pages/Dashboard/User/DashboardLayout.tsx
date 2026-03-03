import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { retrieveTokenFromStorage } from "../../../helpers";
import { useState, useEffect } from "react";
import UserHeader from "./UserHeader";


const DashboardLayout = () => {
  const [token, setToken] = useState<string>('');

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
