import React, { useState, useEffect } from 'react';
import { Avatar, Button, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons';
import { retrieveUserInfoFromStorage } from '../../helpers';
import { Navigate, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { useSidebarContext } from '../../pages/Dashboard/Admin/_context/SidebarContext';
import { useUserInfoActions, useUserInfoStates } from '../../store/useAuthStore';

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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebarContext();
  const { setUserInfo, clearUserInfo } = useUserInfoActions();
  const { userInfo } = useUserInfoStates();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await retrieveUserInfoFromStorage();
        setUserInfo(user);
      } catch (error) {
        console.error('Failed to load user info:', error);
        clearUserInfo();
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('ACCESS_TOKEN');
    sessionStorage.removeItem('userInfo');

    // Clear local storage as well (in case any auth data is stored there)
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('userInfo');

    // Clear all storage to ensure complete logout
    sessionStorage.clear();
    clearUserInfo();
    // Navigate to login
    navigate('/auth/admin-login', { replace: true });

  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  // Only redirect after we've finished loading
  if (!userInfo) {
    return <Navigate to="/auth/admin-login" replace />;
  }


  const userMenuItems = [
    {
      key: "email-address",
      disabled: true,
      label: (
        <div className="px-2 py-1">
          <div className="font-medium text-sm">
            {userInfo?.email || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/settings')
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b px-6 py-3 flex flex-wrap items-center">
      <div className='flex items-center gap-2'>
        <Button className='size-8 lg:hidden rounded-sm flex items-center justify-center  bg-primary text-white' onClick={toggleSidebar}>
          <MenuOutlined />
        </Button>
        <Text className="hidden lg:block text-lg font-['gilroy-semibold'] text-[#333333]">
          Admin Dashboard
        </Text>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        {/* Chat Notifications */}

        {/* User Menu */}
        <div className="h-10 w-10 flex items-center justify-center">
          <NotificationDropdown isAdmin={true} />
        </div>
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">

            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: '#F6921E' }}
              size="default"
            />

            <div className="flex flex-col gap-[2px]">
              <Text className="font-['gilroy-medium'] text-sm leading-tight">
                {userInfo?.fullName || 'Admin User'}
              </Text>
              <Text className="text-xs text-gray-500 leading-tight">
                Administrator
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminHeader;