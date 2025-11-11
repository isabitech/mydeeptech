import React, { useEffect, useRef } from 'react';
import { Card, Col, Row } from 'antd';
import { motion } from 'framer-motion';
import { CountUp } from 'countup.js';
import {
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Overview } from '../../../../../hooks/Auth/Admin/admin-dashboard-type';

interface OverviewCardsProps {
  data: Overview;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const totalUsersRef = useRef<HTMLSpanElement>(null);
  const totalProjectsRef = useRef<HTMLSpanElement>(null);
  const totalInvoicesRef = useRef<HTMLSpanElement>(null);
  const totalRevenueRef = useRef<HTMLSpanElement>(null);
  const pendingAppsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate numbers when data is loaded
    if (data && totalUsersRef.current) {
      new CountUp(totalUsersRef.current, data.totalUsers, {
        duration: 2,
        separator: ',',
      }).start();
    }
    
    if (data && totalProjectsRef.current) {
      new CountUp(totalProjectsRef.current, data.totalProjects, {
        duration: 2,
        separator: ',',
      }).start();
    }
    
    if (data && totalInvoicesRef.current) {
      new CountUp(totalInvoicesRef.current, data.totalInvoices, {
        duration: 2,
        separator: ',',
      }).start();
    }
    
    if (data && totalRevenueRef.current) {
      new CountUp(totalRevenueRef.current, data.totalRevenue, {
        duration: 2.5,
        separator: ',',
        decimal: '.',
        decimalPlaces: 2,
        prefix: '$',
      }).start();
    }
    
    if (data && pendingAppsRef.current) {
      new CountUp(pendingAppsRef.current, data.pendingApplications, {
        duration: 2,
        separator: ',',
      }).start();
    }
  }, [data]);

  const iconVariants = {
    hover: { 
      scale: 1.2, 
      rotate: 360,
      transition: { duration: 0.6 }
    }
  };

  const cards = [
    {
      title: 'Total Users',
      value: data?.totalUsers || 0,
      ref: totalUsersRef,
      icon: <UserOutlined />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Projects',
      value: data?.totalProjects || 0,
      ref: totalProjectsRef,
      icon: <ProjectOutlined />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Invoices',
      value: data?.totalInvoices || 0,
      ref: totalInvoicesRef,
      icon: <FileTextOutlined />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Paid ',
      value: data?.totalRevenue || 0,
      ref: totalRevenueRef,
      icon: <DollarOutlined />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pending Applications',
      value: data?.pendingApplications || 0,
      ref: pendingAppsRef,
      icon: <ClockCircleOutlined />,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={8} xl={4} key={card.title}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <Card
              className="h-32 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className={`text-sm font-medium ${card.textColor} mb-1`}>
                    {card.title}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    <span ref={card.ref}>0</span>
                  </div>
                </div>
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center text-white text-xl`}
                >
                  {card.icon}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default OverviewCards;