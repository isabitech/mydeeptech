import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { 
  ToolOutlined, 
  ClockCircleOutlined, 
  MailOutlined, 
  PhoneOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GlobalOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import Logo from '../../assets/deeptech.png';
import { MAINTENANCE_CONFIG } from '../../config/maintenance';

interface MaintenancePageProps {
  onRetry?: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onRetry }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (targetDate: string): string => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) return "Soon";

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={Logo} 
              alt="DeepTech Logo" 
              className="h-12 mx-auto mb-4"
            />
          </div>

          {/* Maintenance Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <ToolOutlined className="text-3xl text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'gilroy-semibold' }}>
              {MAINTENANCE_CONFIG.title}
            </h1>
            <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'gilroy-regular' }}>
              {MAINTENANCE_CONFIG.message}
            </p>
          </div>

          {/* Estimated Completion Time */}
          {MAINTENANCE_CONFIG.estimatedCompletion && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <ClockCircleOutlined className="mr-2" />
                <span className="font-medium" style={{ fontFamily: 'gilroy-medium' }}>
                  Estimated completion
                </span>
              </div>
              <div className="text-blue-800 font-bold text-lg">
                {formatTimeRemaining(MAINTENANCE_CONFIG.estimatedCompletion)}
              </div>
              <div className="text-blue-600 text-sm mt-1">
                {new Date(MAINTENANCE_CONFIG.estimatedCompletion).toLocaleString()}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="mb-6">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              className="bg-primary hover:bg-primary-hover border-primary hover:border-primary-hover"
              size="large"
              style={{ fontFamily: 'gilroy-medium' }}
            >
              Check Again
            </Button>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: 'gilroy-regular' }}>
              Need help? Contact our support team:
            </p>
            {/* <div className="space-y-2">
              {MAINTENANCE_CONFIG.contact.email && (
                <div className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
                  <MailOutlined className="mr-2" />
                  <a 
                    href={`mailto:${MAINTENANCE_CONFIG.contact.email}`}
                    className="text-sm hover:underline"
                    style={{ fontFamily: 'gilroy-regular' }}
                  >
                    {MAINTENANCE_CONFIG.contact.email}
                  </a>
                </div>
              )}
              {MAINTENANCE_CONFIG.contact.phone && (
                <div className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
                  <PhoneOutlined className="mr-2" />
                  <a 
                    href={`tel:${MAINTENANCE_CONFIG.contact.phone}`}
                    className="text-sm hover:underline"
                    style={{ fontFamily: 'gilroy-regular' }}
                  >
                    {MAINTENANCE_CONFIG.contact.phone}
                  </a>
                </div>
              )}
            </div> */}
          </div>

          {/* Social Links */}
          {/* <div className="border-t pt-4 mt-4">
            <p className="text-gray-500 text-xs mb-3" style={{ fontFamily: 'gilroy-regular' }}>
              Follow us for updates:
            </p>
            <div className="flex justify-center space-x-4">
              {MAINTENANCE_CONFIG.socialLinks.twitter && (
                <a
                  href={MAINTENANCE_CONFIG.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <TwitterOutlined className="text-lg" />
                </a>
              )}
              {MAINTENANCE_CONFIG.socialLinks.linkedin && (
                <a
                  href={MAINTENANCE_CONFIG.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-700 transition-colors"
                >
                  <LinkedinOutlined className="text-lg" />
                </a>
              )}
              {MAINTENANCE_CONFIG.socialLinks.website && (
                <a
                  href={MAINTENANCE_CONFIG.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <GlobalOutlined className="text-lg" />
                </a>
              )}
            </div>
          </div> */}
        </div>

        {/* Current Time Display */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'gilroy-regular' }}>
            Current time: {currentTime.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;