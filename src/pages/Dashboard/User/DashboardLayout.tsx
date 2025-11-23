import Sidebar from "./Sidebar";
import { Outlet} from "react-router-dom";
import { retrieveTokenFromStorage } from "../../../helpers";
import { useState, useEffect } from "react";


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
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </div>
      
    </div>
  );
};

export default DashboardLayout;
