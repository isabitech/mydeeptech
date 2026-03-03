import { LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { retrieveUserInfoFromStorage } from "../../../helpers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../../../components/NotificationDropdown";
import Dropdown from "antd/es/dropdown/dropdown";
import { Avatar, Typography } from "antd";

const { Text } = Typography;

type Props = {
  title: string;
};

export type UserInfoProps = {
  id: string
  fullName: string
  email: string
  phone: string
  domains: string[]
  socialsFollowed: any[]
  consent: boolean
  isEmailVerified: boolean
  hasSetPassword: boolean
  annotatorStatus: string
  microTaskerStatus: string
  resultLink: string
  createdAt: string
  updatedAt: string
};

const Header: React.FC<Props> = ({ title }) => {
  const [userInfo, setUserInfo] = useState<UserInfoProps | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('ACCESS_TOKEN');
    sessionStorage.removeItem('userInfo');
    
    // Clear local storage as well (in case any auth data is stored there)
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('userInfo');
    
    // Clear all storage to ensure complete logout
    sessionStorage.clear();
    
    // Navigate to login and replace current history entry
    navigate('/login', { replace: true });
    
    // Optional: Force a page reload to clear any cached state
    window.location.replace('/login');
  };

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
      onClick: () => navigate('/dashboard/settings')
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

  useEffect(() => {
    const loadUser = async () => {
      const user = await retrieveUserInfoFromStorage();
      setUserInfo(user);
    };
    loadUser();
  }, []);

  const handleOpenProfile = () => {
    if (userInfo?.annotatorStatus) {
      navigate('/dashboard/profile');
    }
  }

  return (
    // 
    <div className="bg-white shadow-sm border-b px-6 py-3 flex flex-wrap items-center">
      <div className="pl-10 lg:pl-0 hidden lg:block w-1/2">
        <h2 className="font-medium text-lg capitalize truncate">{title}</h2>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        {/* Chat Notifications */}

        {/* User Menu */}
        <div className="h-10 w-10 flex items-center justify-center">
          <NotificationDropdown />
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
                {userInfo?.fullName || 'User'}
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>

    </div>
  );
};

export default Header;
