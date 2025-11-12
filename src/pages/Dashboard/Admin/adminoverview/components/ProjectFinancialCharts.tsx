import React from 'react';
import { Card, Progress } from 'antd';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  ProjectStatistics, 
  InvoiceStatistics,
  Trends 
} from '../../../../../hooks/Auth/Admin/admin-dashboard-type';

interface ProjectFinancialChartsProps {
  projectData: ProjectStatistics;
  invoiceData: InvoiceStatistics;
  trendsData: Trends;
}

const ProjectFinancialCharts: React.FC<ProjectFinancialChartsProps> = ({ 
  projectData, 
  invoiceData, 
  trendsData 
}) => {
  // Project status data
  const projectStatusData = [
    { name: 'Active', value: projectData.activeProjects, color: '#52c41a' },
    { name: 'Completed', value: projectData.completedProjects, color: '#1890ff' },
    { name: 'Paused', value: projectData.pausedProjects, color: '#faad14' },
  ];

  // Budget vs Spent
  const budgetSpent = projectData.totalBudget > 0 ? 
    (projectData.totalSpent / projectData.totalBudget) * 100 : 0;

  // Payment rate
  const paymentRate = invoiceData.totalAmount > 0 ? 
    (invoiceData.paidAmount / invoiceData.totalAmount) * 100 : 0;

  // Registration trends - format for chart
  const registrationTrends = trendsData.recentRegistrations?.map(item => ({
    date: `${item._id.month}/${item._id.day}`,
    registrations: item.count
  })) || [];

  // Invoice activity trends
  const invoiceTrends = trendsData.recentInvoiceActivity?.map(item => ({
    date: `${item._id.month}/${item._id.day}`,
    created: item.invoicesCreated,
    paid: item.invoicesPaid,
    amount: item.amountPaid
  })) || [];

  return (
    <div className="space-y-6">
      {/* Project and Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600">
                {projectData.activeProjects}
              </div>
              <div className="text-sm text-gray-500">Active Projects</div>
            </div>
            <Progress 
              type="circle" 
              percent={Math.round((projectData.activeProjects / projectData.totalProjects) * 100)} 
              size={60}
              strokeColor="#1890ff"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(budgetSpent)}%
              </div>
              <div className="text-sm text-gray-500">Budget Utilized</div>
            </div>
            <Progress 
              type="circle" 
              percent={Math.round(budgetSpent)} 
              size={60}
              strokeColor="#52c41a"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-purple-600">
                {invoiceData.paidCount}
              </div>
              <div className="text-sm text-gray-500">Paid Invoices</div>
            </div>
            <Progress 
              type="circle" 
              percent={Math.round(paymentRate)} 
              size={60}
              strokeColor="#722ed1"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-red-600">
                ${invoiceData.unpaidAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Unpaid Amount</div>
            </div>
            <Progress 
              type="circle" 
              percent={Math.round((invoiceData.unpaidAmount / invoiceData.totalAmount) * 100)} 
              size={60}
              strokeColor="#ff4d4f"
            />
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card title="Registration Trends (Last 30 Days)" className="h-80">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#1890ff" 
                  fill="#1890ff"
                  fillOpacity={0.3}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Invoice Activity Trends */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card title="Invoice Activity (Last 7 Days)" className="h-80">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={invoiceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="Created"
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="paid" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Paid"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectFinancialCharts;