import React from 'react';
import { Typography } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { STYLES } from '../utilities/constants';

const { Title, Text } = Typography;

interface SupportHeaderProps {
  className?: string;
}

const SupportHeader: React.FC<SupportHeaderProps> = ({ className = '' }) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <CustomerServiceOutlined className="text-6xl text-[#F6921E] mb-4" />
      <Title 
        level={1} 
        className={`!text-[${STYLES.colors.text}] !mb-2 ${STYLES.fonts.bold}`}
      >
        Support Center
      </Title>
      <Text className={`text-lg text-gray-600 ${STYLES.fonts.regular}`}>
        View your support conversations and get help when you need it
      </Text>
    </div>
  );
};

export default SupportHeader;