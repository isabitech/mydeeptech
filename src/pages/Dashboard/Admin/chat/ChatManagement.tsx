import React, { useState, useEffect } from 'react';
import AdminChatDashboard from '../../../../components/Chat/AdminChatDashboard';
import { useUserContext } from '../../../../UserContext';
import { retrieveTokenFromStorage } from '../../../../helpers';

const ChatManagement: React.FC = () => {
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
    <div className="min-h-screen">
      <AdminChatDashboard adminToken={token} />
    </div>
  );
};

export default ChatManagement;