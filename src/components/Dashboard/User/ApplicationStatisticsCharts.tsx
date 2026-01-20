import React from 'react';
import { Card, Row, Col } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { ApplicationStatistics, ResultSubmissions } from '../../../types/dtuser-dashboard.types';
import CountUp from 'react-countup';

interface ApplicationStatisticsChartsProps {
  applicationStatistics: ApplicationStatistics;
  resultSubmissions: ResultSubmissions;
}

const ApplicationStatisticsCharts: React.FC<ApplicationStatisticsChartsProps> = ({ 
  applicationStatistics,
  resultSubmissions 
}) => {
  const COLORS = {
    pending: '#fa8c16',
    approved: '#52c41a', 
    rejected: '#ff4d4f',
    submissions: '#1890ff'
  };

  const applicationData = [
    { 
      name: 'Pending', 
      value: applicationStatistics?.pendingApplications, 
      color: COLORS.pending,
      percentage: applicationStatistics?.totalApplications > 0 
        ? (applicationStatistics?.pendingApplications / applicationStatistics?.totalApplications * 100).toFixed(1)
        : '0'
    },
    { 
      name: 'Approved', 
      value: applicationStatistics?.approvedApplications, 
      color: COLORS.approved,
      percentage: applicationStatistics?.totalApplications > 0 
        ? (applicationStatistics?.approvedApplications / applicationStatistics?.totalApplications * 100).toFixed(1)
        : '0'
    },
    { 
      name: 'Rejected', 
      value: applicationStatistics?.rejectedApplications, 
      color: COLORS.rejected,
      percentage: applicationStatistics?.totalApplications > 0 
        ? (applicationStatistics?.rejectedApplications / applicationStatistics?.totalApplications * 100).toFixed(1)
        : '0'
    }
  ];

  const submissionData = [
    {
      name: 'Applications',
      submitted: applicationStatistics?.totalApplications,
      approved: applicationStatistics?.approvedApplications,
      pending: applicationStatistics?.pendingApplications,
      rejected: applicationStatistics?.rejectedApplications
    },
    {
      name: 'Submissions',
      submitted: resultSubmissions?.totalSubmissions,
      approved: resultSubmissions?.totalSubmissions,
      pending: 0,
      rejected: 0
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            Count: {data.value}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        {/* Application Status Distribution */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card title="Application Status Distribution" className="h-full">
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    <CountUp end={applicationStatistics?.totalApplications} duration={2} />
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>

                {/* Pie Chart */}
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={applicationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {applicationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {applicationData.map((item) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="p-2"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>
                      <div className="text-sm font-bold">{item.value}</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Applications vs Submissions Comparison */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card title="Applications vs Submissions" className="h-full">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={submissionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e8e8e8',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="submitted" 
                      fill={COLORS.submissions} 
                      name="Total Submitted"
                      radius={[2, 2, 0, 0]}
                      animationDuration={1000}
                    />
                    <Bar 
                      dataKey="approved" 
                      fill={COLORS.approved} 
                      name="Approved"
                      radius={[2, 2, 0, 0]}
                      animationDuration={1000}
                      animationBegin={200}
                    />
                    <Bar 
                      dataKey="pending" 
                      fill={COLORS.pending} 
                      name="Pending"
                      radius={[2, 2, 0, 0]}
                      animationDuration={1000}
                      animationBegin={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Performance Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-2">Success Rate</div>
              <div className="text-2xl font-bold text-green-600">
                <CountUp 
                  end={
                    applicationStatistics?.totalApplications > 0
                      ? (applicationStatistics?.approvedApplications / applicationStatistics?.totalApplications) * 100
                      : 0
                  }
                  duration={2}
                  decimals={1}
                  suffix="%"
                />
              </div>
              <div className="text-sm text-gray-500">
                {applicationStatistics?.approvedApplications} of {applicationStatistics?.totalApplications} approved
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-2">Pending Review</div>
              <div className="text-2xl font-bold text-orange-600">
                <CountUp 
                  end={applicationStatistics?.pendingApplications}
                  duration={2}
                />
              </div>
              <div className="text-sm text-gray-500">
                Applications awaiting review
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-2">Total Submissions</div>
              <div className="text-2xl font-bold text-blue-600">
                <CountUp 
                  end={resultSubmissions?.totalSubmissions}
                  duration={2}
                />
              </div>
              <div className="text-sm text-gray-500">
                Work samples submitted
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default ApplicationStatisticsCharts;