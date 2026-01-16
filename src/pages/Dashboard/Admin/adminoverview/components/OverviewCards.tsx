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
import { AdminDashboardData, Overview } from '../../../../../hooks/Auth/Admin/admin-dashboard-type';


interface OverviewCardsProps {
  data: AdminDashboardData;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const totalUsersRef = useRef<HTMLSpanElement>(null);
  const totalProjectsRef = useRef<HTMLSpanElement>(null);
  const totalInvoicesRef = useRef<HTMLSpanElement>(null);
  const totalRevenueRef = useRef<HTMLSpanElement>(null);
  const pendingAppsRef = useRef<HTMLSpanElement>(null);
  const submittedAnnotatorsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate numbers when data is loaded
    if (data && totalUsersRef.current) {
      new CountUp(totalUsersRef.current, data.overview.totalUsers, {
        duration: 2,
        separator: ',',
      }).start();
    }

    if (data && totalProjectsRef.current) {
      new CountUp(totalProjectsRef.current, data.overview.totalProjects, {
        duration: 2,
        separator: ',',
      }).start();
    }

    if (data && totalInvoicesRef.current) {
      new CountUp(totalInvoicesRef.current, data.overview.totalInvoices, {
        duration: 2,
        separator: ',',
      }).start();
    }

    if (data && totalRevenueRef.current) {
      new CountUp(totalRevenueRef.current, data.overview.totalRevenue, {
        duration: 2.5,
        separator: ',',
        decimal: '.',
        decimalPlaces: 2,
        prefix: '$',
      }).start();
    }

    if (data && pendingAppsRef.current) {
      new CountUp(pendingAppsRef.current, data.overview.pendingApplications, {
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
      value: data?.overview.totalUsers || 0,
      ref: totalUsersRef,
      icon: <UserOutlined />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Projects',
      value: data?.overview.totalProjects || 0,
      ref: totalProjectsRef,
      icon: <ProjectOutlined />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Invoices',
      value: data?.overview.totalInvoices || 0,
      ref: totalInvoicesRef,
      icon: <FileTextOutlined />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Paid ',
      value: data?.overview.totalRevenue || 0,
      ref: totalRevenueRef,
      icon: <DollarOutlined />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pending Applications',
      value: data?.overview.pendingApplications || 0,
      ref: pendingAppsRef,
      icon: <ClockCircleOutlined />,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Submitted Annotators',
      value: data?.dtUserStatistics.submittedAnnotators || 0,
      ref: submittedAnnotatorsRef,
      icon: <UserOutlined />,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <Row gutter={[12, 12]}
    >
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={8} xl={8} key={card.title}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="w-full"
          >
            <Card
              className="h-32 overflow-x-auto cursor-pointer hover:shadow-lg transition-shadow duration-300"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="flex flex-col gap-5 h-24">
                <div className="flex items-center gap-2 w-full flex-1">
                  <div className={`text-normal font-medium ${card.textColor} mb-1`}>
                    {card.title}
                  </div>
                  <motion.div
                    variants={iconVariants}
                    whileHover="hover"
                    className={`size-8 ${card.color} shrink-0 rounded-full ml-auto flex items-center justify-center text-white text-xl`}
                  >
                    {card.icon}
                  </motion.div>
                </div>
                <div className="text-2xl font-bold text-gray-800 text-left w-full mt-auto">
                  <span ref={card.ref}>0</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default OverviewCards;