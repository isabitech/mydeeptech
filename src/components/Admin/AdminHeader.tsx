import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Typography, Space, Divider } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import AdminChatNotifications from '../Chat/AdminChatNotifications';
import { retrieveUserInfoFromStorage } from '../../helpers';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface UserInfo {
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
  createdAt: string;
  updatedAt: string;
}

const AdminHeader: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await retrieveUserInfoFromStorage();
      setUserInfo(user);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('ACCESS_TOKEN');
    sessionStorage.removeItem('userInfo');
    
    // Navigate to login
    navigate('/auth/admin-login');
  };

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/settings')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
      <div>
        <Text className="text-lg font-['gilroy-semibold'] text-[#333333]">
          Admin Dashboard
        </Text>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Chat Notifications */}
        <AdminChatNotifications />
        
        <Divider type="vertical" />
        
        {/* User Menu */}
        <Dropdown 
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#F6921E' }}
              size="small"
            />
            <Space direction="vertical" size={0}>
              <Text className="font-['gilroy-medium'] text-sm">
                {userInfo?.fullName || 'Admin User'}
              </Text>
              <Text className="text-xs text-gray-500">
                Administrator
              </Text>
            </Space>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminHeader;