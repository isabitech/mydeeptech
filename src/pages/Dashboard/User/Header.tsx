import { LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../../../components/NotificationDropdown";
import Dropdown from "antd/es/dropdown/dropdown";
import { Avatar, Typography } from "antd";
import { useGetUserInfo } from "../../../store/useAuthStore";
import useLogout from "../../../hooks/useLogout";

const { Text } = Typography;

type Props = {
  title: string;
};

const Header: React.FC<Props> = ({ title }) => {
  const navigate = useNavigate();
  const userInfo = useGetUserInfo("user");
  const handleLogout = useLogout({ userType: 'user' });

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
      onClick: () => handleLogout()
    }
  ];


  return (
    // 
    <header className="bg-white shadow-sm border-b px-6 py-3 flex flex-wrap items-center">
      <div className="pl-10 lg:pl-0 hidden lg:block w-1/2">
        <h2 className="font-medium text-lg capitalize truncate">{title}</h2>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        {/* Chat Notifications */}

        {/* User Menu */}
        <div className="h-10 w-10 flex items-center justify-center">
          <NotificationDropdown isAdmin={false} />
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

    </header>
  );
};

export default Header;
