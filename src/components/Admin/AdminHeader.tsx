import React from 'react';
import { Avatar, Button, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons';
import { Navigate, useNavigate } from 'react-router-dom';
import useLogout from '../../hooks/useLogout';
import NotificationDropdown from '../NotificationDropdown';
import { useSidebarContext } from '../../pages/Dashboard/Admin/_context/SidebarContext';
import { useGetUserInfo } from '../../store/useAuthStore';

const { Text } = Typography;

const AdminHeader: React.FC = () => {

  const navigate = useNavigate();
  const { toggleSidebar } = useSidebarContext();
  const handleLogout = useLogout({ userType: 'admin' });
  const userInfo = useGetUserInfo("admin");
  
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
      onClick: () => handleLogout()
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b px-6 py-3 flex flex-wrap items-center">
      <div className='flex items-center gap-2'>
        <Button className='size-8 lg:hidden rounded-md flex items-center justify-center  bg-primary text-white' onClick={toggleSidebar}>
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
                {userInfo?.role || 'Administrator'}
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminHeader;