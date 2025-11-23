import Header from "../Header";
import Reset from "./Reset";
import { Card, Button, Divider } from 'antd';
import { FileTextOutlined, SafetyOutlined, DownloadOutlined } from '@ant-design/icons';

const Settings = () => {
  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <Header title="Settings" />

      <Reset />
      
      {/* Privacy & Legal Section */}
      <Card 
        title={<span className="flex items-center gap-2"><SafetyOutlined className="text-[#F6921E]" />Privacy & Legal</span>}
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
              View Privacy Policy
            </Button>
            <Button 
              icon={<FileTextOutlined />}
              href="/terms-of-service"
              target="_blank"
              className="flex items-center gap-2 hover:border-[#F6921E] hover:text-[#F6921E]"
            >
              View Terms of Service
            </Button>
            {/* <Button 
              icon={<DownloadOutlined />}
              className="flex items-center gap-2 hover:border-[#F6921E] hover:text-[#F6921E]"
              onClick={() => {
                // TODO: Implement data download functionality
                console.log('Download user data requested');
              }}
            >
              Download My Data
            </Button> */}
          </div>
          <Divider className="my-3" />
          <p className="text-sm text-gray-600">
            Need help with privacy or data concerns? Contact us at{' '}
            <a href="mailto:privacy@mydeeptech.ng" className="text-[#F6921E] hover:underline">
              privacy@mydeeptech.ng
            </a>
          </p>
        </div>
      </Card>
      
      {/* <Component/>
      <Analysis/> */}
    </div>
  );
};

export default Settings;
