import React, { useState, useEffect } from 'react';
import EnhancedAdminChatDashboard from '../../../../components/Chat/EnhancedAdminChatDashboard';
import { useUserContext } from '../../../../UserContext';
import { retrieveTokenFromStorage } from '../../../../helpers';
import AdminChatDashboard from '../../../../components/Chat/AdminChatDashboard';

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
      {/* <EnhancedAdminChatDashboard adminToken={token} /> */}
      <AdminChatDashboard adminToken={token} />
    </div>
  );
};

export default ChatManagement;