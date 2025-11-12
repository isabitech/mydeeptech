import React from 'react';
import { Card } from 'antd';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DtUserStatistics } from '../../../../../hooks/Auth/Admin/admin-dashboard-type';

interface UserStatisticsChartsProps {
  data: DtUserStatistics;
}

const UserStatisticsCharts: React.FC<UserStatisticsChartsProps> = ({ data }) => {
  // Annotator status data for pie chart
  const annotatorData = [
    { name: 'Approved', value: data.approvedAnnotators, color: '#52c41a' },
    { name: 'Pending', value: data.pendingAnnotators, color: '#faad14' },
    { name: 'Submitted', value: data.submittedAnnotators, color: '#1890ff' },
    { name: 'Verified', value: data.verifiedAnnotators, color: '#722ed1' },
    { name: 'Rejected', value: data.rejectedAnnotators, color: '#ff4d4f' },
  ];

  // User engagement data for bar chart
  const engagementData = [
    { name: 'Total Users', value: data.totalUsers },
    { name: 'Verified Emails', value: data.verifiedEmails },
    { name: 'Set Passwords', value: data.usersWithPasswords },
    { name: 'Submitted Results', value: data.usersWithResults },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Annotator Status Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card title="Annotator Status Distribution" className="h-auto">
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
          <Pie
            data={annotatorData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
          >
            {annotatorData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Annotator Data Text Summary */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {annotatorData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm font-bold">{item.value}</span>
          </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Engagement Bar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card title="User Engagement Metrics" className="h-96">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="#1890ff"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationBegin={100}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserStatisticsCharts;