import React, { useState } from 'react';
import { Card, Timeline, Tabs, List, Tag, Button, Badge } from 'antd';
import { 
  ClockCircleOutlined,
  ProjectOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { RecentActivitySchema } from '../../../validators/dashboard/user-dashboard-schema';

interface RecentActivityTimelineProps {
  recentActivity: RecentActivitySchema;
}

const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({ 
  recentActivity 
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const getApplicationStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'rejected':
        return <ExclamationCircleOutlined className="text-red-500" />;
      case 'pending':
        return <ClockCircleOutlined className="text-orange-500" />;
      default:
        return <ClockCircleOutlined className="text-orange-500" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'pending':
        return <ClockCircleOutlined className="text-orange-500" />;
      case 'overdue':
        return <ExclamationCircleOutlined className="text-red-500" />;
      default:
        return <ClockCircleOutlined className="text-orange-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentDate = (payment: any) => {
    const { year, month, day } = payment._id;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Combine all activities for timeline
  const allActivities = [
    ...(recentActivity.recentApplications || []).map((app: any) => ({
      type: 'application',
      date: app.appliedAt || new Date().toISOString(),
      data: app,
      title: `Applied to ${app.projectId?.projectName || 'Unknown Project'}`,
      description: `Application status: ${app.status || 'unknown'}`,
      icon: <ProjectOutlined />
    })),
    ...(recentActivity.recentInvoices || []).map((invoice: any) => ({
      type: 'invoice',
      date: invoice.createdAt || new Date().toISOString(),
      data: invoice,
      title: `Invoice created for ${invoice.projectId?.projectName || 'Unknown Project'}`,
      description: `$${invoice.invoiceAmount ? invoice.invoiceAmount.toLocaleString() : '0'} - ${invoice.paymentStatus || 'unknown'}`,
      icon: <FileTextOutlined />
    })),
    ...(recentActivity.recentPayments || []).map((payment: any) => ({
      type: 'payment',
      date: payment._id ? `${payment._id.year}-${payment._id.month.toString().padStart(2, '0')}-${payment._id.day.toString().padStart(2, '0')}` : new Date().toISOString(),
      data: payment,
      title: 'Payment received',
      description: `$${payment.dailyEarnings ? payment.dailyEarnings.toLocaleString() : '0'} from ${payment.invoiceCount || 0} invoice(s)`,
      icon: <DollarOutlined />
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          All Activity
          <Badge count={allActivities.length} className="ml-2" />
        </span>
      ),
      children: (
        <motion.div
          variants={timelineVariants}
          initial="hidden"
          animate="visible"
          className="max-w-full overflow-hidden"
        >
          <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Timeline
              items={allActivities.slice(0, 10).map((activity, index) => ({
                dot: activity.icon,
                children: (
                  <motion.div variants={itemVariants} key={index}>
                    <div className="mb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{activity.title}</h4>
                          <p className="text-sm text-gray-600 break-words">{activity.description}</p>
                        </div>
                        <Tag className="flex-shrink-0">
                          {activity.type}
                        </Tag>
                      </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <CalendarOutlined />
                      {activity.type === 'payment' ? formatPaymentDate(activity.data) : formatDate(activity.date)}
                    </div>
                  </div>
                </motion.div>
              )
            }))}
          />
          </div>
        </motion.div>
      )
    },
    {
      key: 'applications',
      label: (
        <span>
          Applications
          <Badge count={(recentActivity.recentApplications || []).length} className="ml-2" />
        </span>
      ),
      children: (
        <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <List
            dataSource={recentActivity.recentApplications || []}
            renderItem={(app: any, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <List.Item
                  className="border border-gray-100 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-full overflow-hidden">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {app.projectId?.projectName || 'Unknown Project'}
                      </h4>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        {getApplicationStatusIcon(app.status || 'unknown')}
                        <span className="capitalize">{app.status || 'unknown'}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 flex-shrink-0">
                      <div>{formatDate(app.appliedAt || new Date().toISOString())}</div>
                      {app.projectId?.budget && (
                        <div className="font-medium text-green-600">
                          ${app.projectId.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {app.projectId?.timeline && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockCircleOutlined />
                      Timeline: {app.projectId.timeline}
                    </div>
                  )}
                </div>
              </List.Item>
            </motion.div>
          )}
        />
        </div>      )
    },
    {
      key: 'invoices',
      label: (
        <span>
          Invoices
          <Badge count={(recentActivity.recentInvoices || []).length} className="ml-2" />
        </span>
      ),
      children: (
        <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <List
            dataSource={recentActivity.recentInvoices || []}
            renderItem={(invoice: any, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <List.Item
                  className="border border-gray-100 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-full overflow-hidden">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {invoice.projectId?.projectName || 'Unknown Project'}
                      </h4>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        {getPaymentStatusIcon(invoice.paymentStatus || 'unknown')}
                        <span className="capitalize">{invoice.paymentStatus || 'unknown'}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-lg text-green-600">
                        ${invoice.invoiceAmount ? invoice.invoiceAmount.toLocaleString() : '0'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(invoice.createdAt || new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 gap-2">
                    <div className="truncate">Due: {formatDate(invoice.dueDate || new Date().toISOString())}</div>
                    {invoice.paidAt && (
                      <div className="text-green-600 flex-shrink-0">
                        Paid: {formatDate(invoice.paidAt)}
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            </motion.div>
          )}
        />
        </div>
      )
    },
    {
      key: 'payments',
      label: (
        <span>
          Payments
          <Badge count={(recentActivity.recentPayments || []).length} className="ml-2" />
        </span>
      ),
      children: (
        <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <List
            dataSource={recentActivity.recentPayments || []}
            renderItem={(payment: any, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <List.Item
                  className="border border-gray-100 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-full overflow-hidden">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <DollarOutlined className="text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-800">
                            Daily Earnings
                          </h4>
                          <div className="text-sm text-gray-600 truncate">
                            {payment.invoiceCount || 0} invoice{(payment.invoiceCount || 0) !== 1 ? 's' : ''} processed
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-lg text-green-600">
                          ${payment.dailyEarnings ? payment.dailyEarnings.toLocaleString() : '0'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment._id ? formatPaymentDate(payment) : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                  </div>
              </List.Item>
            </motion.div>
          )}
        />
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='grid grid-cols-1 overflow-hidden'
    >
      <Card 
        title={
          <div className="flex items-center gap-2">
            <ClockCircleOutlined />
            <span>Recent Activity</span>
          </div>
        }
        extra={
          <Button type="link" icon={<SendOutlined />} className="flex-shrink-0">
            View All
          </Button>
        }
        className="h-full"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
          className="overflow-hidden"
        />
      </Card>
    </motion.div>
  );
};

export default RecentActivityTimeline;