import React, { useState, useEffect } from "react";
import { CommentOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import FloatingChat from "./Chat/FloatingChat";
import { retrieveTokenFromStorage } from "../helpers";
import AdminChatNotifications from "./Chat/AdminChatNotifications";
import EnhancedUserChatWidget from "./Chat/EnhancedUserChatWidget";

const CustomerService: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const renderChatComponent = () => {
    const isAdminRoute = currentPath.includes("/admin");
    const isUserRoute = currentPath.includes("/dashboard");
    const isHomePage = currentPath === "/";

    if (isAdminRoute && !isHomePage) {
      return <AdminChatNotifications />;
    }

    if (isUserRoute && !isHomePage) {
      return <EnhancedUserChatWidget />;
    }
    if (isHomePage) {
      <FloatButton
        icon={<CommentOutlined />}
        tooltip={
          <span className="!font-[gilory-regular]">Contact Support</span>
        }
        href="mailto:support@mydeeptech.ng"
      />;
    }
    return <></>;
  };

  return (
    <div className=" absolute bottom-4 right-4">{renderChatComponent()}</div>
  );
};

export default CustomerService;
