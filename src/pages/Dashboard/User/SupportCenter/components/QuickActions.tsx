import React from 'react';
import { Row, Col } from 'antd';
import {
  MessageOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import StatCard from './StatCard';

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  return (
    <Row gutter={[16, 16]} className={`mb-8 ${className}`}>
      <Col xs={24} md={8}>
        <StatCard
          icon={<MessageOutlined />}
          title="Start New Chat"
          description="Get instant help from our support team"
          extraInfo="Click the chat button in the bottom right corner"
          iconColor="text-[#F6921E]"
          bordered
        />
      </Col>
      
      <Col xs={24} md={8}>
        <StatCard
          icon={<ClockCircleOutlined />}
          title="Average Response Time"
          description={<span className="text-2xl font-['gilroy-bold'] text-blue-500">&lt; 5 min</span>}
          extraInfo="During business hours"
          iconColor="text-blue-500"
        />
      </Col>
      
      <Col xs={24} md={8}>
        <StatCard
          icon={<CustomerServiceOutlined />}
          title="Support Hours"
          description="24/7 Support Available"
          extraInfo="We're always here to help"
          iconColor="text-green-500"
        />
      </Col>
    </Row>
  );
};

export default QuickActions;