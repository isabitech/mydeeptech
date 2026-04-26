import React from 'react';
import { Card, Typography } from 'antd';
import { STYLES } from '../utilities/constants';

const { Title, Text } = Typography;

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  extraInfo?: string;
  className?: string;
  iconColor?: string;
  bordered?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  description,
  extraInfo,
  className = '',
  iconColor,
  bordered = false
}) => {
  const cardClasses = `
    text-center hover:shadow-lg transition-all duration-300
    ${bordered ? 'cursor-pointer border-2 border-dashed border-[#F6921E]' : ''}
    ${className}
  `;

  return (
    <Card 
      className={cardClasses}
      styles={bordered ? { body: { padding: '24px' } } : {}}
    >
      <div className={`text-4xl mb-3 ${iconColor || 'text-blue-500'}`}>
        {icon}
      </div>
      <Title 
        level={4} 
        className={`!text-[${STYLES.colors.text}] ${STYLES.fonts.semibold}`}
      >
        {title}
      </Title>
      <Text className="text-gray-600">
        {description}
      </Text>
      {extraInfo && (
        <div className="mt-2">
          <Text className={`text-sm ${iconColor || 'text-blue-500'} ${STYLES.fonts.medium}`}>
            {extraInfo}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default StatCard;