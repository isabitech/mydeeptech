import Reset from "../../User/settings/Reset";
import { Card, Button, Divider } from 'antd';
import { FileTextOutlined, SafetyOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';

const SettingsMgt = () => {
  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      {/* <Header title="Settings" /> */}

      <Reset />
      {/* Admin Privacy & Legal Section */}
      <Card
        title={<span className="flex items-center gap-2"><SafetyOutlined className="text-[#F6921E]" />Privacy & Legal Management</span>}
        className="shadow-sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              icon={<FileTextOutlined />}
              href="/privacy-policy"
              target="_blank"
              className="flex items-center gap-2 hover:border-[#F6921E] hover:text-[#F6921E]"
            >
              Review Privacy Policy
            </Button>
            <Button
              icon={<FileTextOutlined />}
              href="/terms-of-service"
              target="_blank"
              className="flex items-center gap-2 hover:border-[#F6921E] hover:text-[#F6921E]"
            >
              Review Terms of Service
            </Button>
            <Button
              icon={<UserOutlined />}
              className="flex items-center gap-2 hover:border-[#F6921E] hover:text-[#F6921E]"
              onClick={() => {
                // TODO: Implement user data management for admins
                console.log('User data management requested');
              }}
            >
              Manage User Data
            </Button>
          </div>
          <Divider className="my-3" />
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Admin Note:</strong> As an administrator, you have access to user data. Please ensure compliance with our privacy policy and applicable data protection laws.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Legal questions? Contact{' '}
            <a href="mailto:legal@mydeeptech.ng" className="text-[#F6921E] hover:underline">
              legal@mydeeptech.ng
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsMgt;
