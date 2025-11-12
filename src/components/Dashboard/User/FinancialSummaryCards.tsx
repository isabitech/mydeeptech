import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  DollarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FinancialSummary, PerformanceMetrics } from '../../../types/dtuser-dashboard.types';

interface FinancialSummaryCardsProps {
  financialSummary: FinancialSummary;
  performanceMetrics: PerformanceMetrics;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ 
  financialSummary, 
  performanceMetrics 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    }),
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const financialCards = [
    {
      title: 'Total Earnings',
      value: financialSummary.totalEarnings,
      icon: <DollarOutlined className="text-green-500" />,
      color: '#52c41a',
      description: 'All-time earnings'
    },
    {
      title: 'Paid Earnings',
      value: financialSummary.paidEarnings,
      icon: <CheckCircleOutlined className="text-blue-500" />,
      color: '#1890ff',
      description: 'Successfully received'
    },
    {
      title: 'Pending Earnings',
      value: financialSummary.pendingEarnings,
      icon: <ClockCircleOutlined className="text-orange-500" />,
      color: '#fa8c16',
      description: 'Awaiting payment'
    },
    {
      title: 'Overdue Earnings',
      value: financialSummary.overdueEarnings,
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      color: '#ff4d4f',
      description: 'Past due date'
    }
  ];

  const invoiceCards = [
    {
      title: 'Total Invoices',
      value: financialSummary.totalInvoices,
      icon: <FileTextOutlined className="text-purple-500" />,
      color: '#722ed1',
      description: 'All invoices created',
      isCount: true
    },
    {
      title: 'Paid Invoices',
      value: financialSummary.paidInvoices,
      icon: <CheckCircleOutlined className="text-green-500" />,
      color: '#52c41a',
      description: 'Invoices paid',
      isCount: true
    },
    {
      title: 'Pending Invoices',
      value: financialSummary.pendingInvoices,
      icon: <ClockCircleOutlined className="text-orange-500" />,
      color: '#fa8c16',
      description: 'Awaiting payment',
      isCount: true
    },
    {
      title: 'Average per Invoice',
      value: performanceMetrics.avgEarningsPerInvoice,
      icon: <DollarOutlined className="text-cyan-500" />,
      color: '#13c2c2',
      description: 'Average earnings'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarOutlined />
          Earnings Overview
        </h3>
        <Row gutter={[16, 16]}>
          {financialCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <motion.div
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{card.icon}</div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {card.title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold" style={{ color: card.color }}>
                      <CountUp 
                        end={card.value}
                        duration={2}
                        separator=","
                        prefix="$"
                        decimals={2}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      {card.description}
                    </div>
                    <Progress
                      percent={
                        financialSummary.totalEarnings > 0
                          ? (card.value / financialSummary.totalEarnings) * 100
                          : 0
                      }
                      showInfo={false}
                      strokeColor={card.color}
                      size="small"
                    />
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Invoice Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileTextOutlined />
          Invoice Statistics
        </h3>
        <Row gutter={[16, 16]}>
          {invoiceCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <motion.div
                custom={index + 4}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{card.icon}</div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {card.title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold" style={{ color: card.color }}>
                      {card.isCount ? (
                        <CountUp 
                          end={card.value}
                          duration={2}
                        />
                      ) : (
                        <CountUp 
                          end={card.value}
                          duration={2}
                          separator=","
                          prefix="$"
                          decimals={0}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {card.description}
                    </div>
                    {!card.isCount && (
                      <Progress
                        percent={75}
                        showInfo={false}
                        strokeColor={card.color}
                        size="small"
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Payment Performance Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card title="Payment Performance" className="mt-6">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={performanceMetrics.paymentRate}
                  size={100}
                  strokeColor="#52c41a"
                  format={() => (
                    <div>
                      <CountUp 
                        end={performanceMetrics.paymentRate} 
                        duration={2}
                        suffix="%"
                      />
                    </div>
                  )}
                />
                <div className="mt-2 text-sm font-medium">Payment Rate</div>
                <div className="text-xs text-gray-500">Invoices paid on time</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={performanceMetrics.applicationSuccessRate}
                  size={100}
                  strokeColor="#1890ff"
                  format={() => (
                    <div>
                      <CountUp 
                        end={performanceMetrics.applicationSuccessRate} 
                        duration={2}
                        suffix="%"
                      />
                    </div>
                  )}
                />
                <div className="mt-2 text-sm font-medium">Success Rate</div>
                <div className="text-xs text-gray-500">Applications approved</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={performanceMetrics.profileCompletionPercentage}
                  size={100}
                  strokeColor="#fa8c16"
                  format={() => (
                    <div>
                      <CountUp 
                        end={performanceMetrics.profileCompletionPercentage} 
                        duration={2}
                        suffix="%"
                      />
                    </div>
                  )}
                />
                <div className="mt-2 text-sm font-medium">Profile Complete</div>
                <div className="text-xs text-gray-500">Profile completion</div>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default FinancialSummaryCards;