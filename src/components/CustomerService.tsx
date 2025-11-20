import React, { useState, useEffect } from 'react';
import { CommentOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import FloatingChat from './Chat/FloatingChat';
import { retrieveTokenFromStorage } from '../helpers';

const CustomerService: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const retrievedToken = await retrieveTokenFromStorage();
        if (retrievedToken) {
          setToken(retrievedToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to retrieve token:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // If user is authenticated, show floating chat
  if (isAuthenticated && token) {
    return <FloatingChat token={token} />;
  }

  // If user is not authenticated, show normal contact button
  return (
    <FloatButton
      icon={<CommentOutlined />}
      tooltip={<span className="!font-[gilory-regular]">Contact Support</span>}
      href="mailto:support@mydeeptech.ng"
    />
  );
};

export default CustomerService;
