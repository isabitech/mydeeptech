import React from 'react';
import { Card, Avatar, Tag, List, Timeline } from 'antd';
import { motion } from 'framer-motion';
import { 
  UserOutlined, 
  ProjectOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { RecentActivities, TopPerformers } from '../../../../../hooks/Auth/Admin/admin-dashboard-type';

interface RecentActivitiesProps {
  recentData: RecentActivities;
  topPerformers: TopPerformers;
}

const RecentActivitiesComponent: React.FC<RecentActivitiesProps> = ({ 
  recentData, 
  topPerformers 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      case 'submitted': return 'blue';
      case 'verified': return 'purple';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'rejected': return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card title="Recent Users" className="h-96 overflow-y-auto">
          <List
            itemLayout="horizontal"
            dataSource={recentData.recentUsers?.slice(0, 5) || []}
            renderItem={(user, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{user.fullName}</span>
                        {user.isEmailVerified && (
                          <CheckCircleOutlined className="text-green-500 text-xs" />
                        )}
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="flex gap-1">
                          <Tag 
                            color={getStatusColor(user.annotatorStatus)}
                            icon={getStatusIcon(user.annotatorStatus)}
                            className="text-xs"
                          >
                            A: {user.annotatorStatus}
                          </Tag>
                          <Tag 
                            color={getStatusColor(user.microTaskerStatus)}
                            className="text-xs"
                          >
                            M: {user.microTaskerStatus}
                          </Tag>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              </motion.div>
            )}
          />
        </Card>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card title="Recent Projects" className="h-96 overflow-y-auto">
          <Timeline>
            {recentData.recentProjects?.slice(0, 4).map((project, index) => (
              <Timeline.Item
                key={index}
                dot={<ProjectOutlined className="text-blue-500" />}
                color="blue"
              >
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="pb-2"
                >
                  <div className="font-medium text-gray-800">
                    {project.projectName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag color={getStatusColor(project.status)}>
                      {project.status}
                    </Tag>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(project.createdAt)}
                  </div>
                </motion.div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card title="Top Annotators" className="h-96 overflow-y-auto">
          <List
            itemLayout="horizontal"
            dataSource={topPerformers.topAnnotators?.slice(0, 5) || []}
            renderItem={(annotator, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: index < 3 ? '#faad14' : '#1890ff' 
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {annotator.fullName}
                        </span>
                        <Tag color="gold">
                          {annotator.submissionCount} submissions
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          {annotator.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          Last: {formatDate(annotator.lastSubmission)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              </motion.div>
            )}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default RecentActivitiesComponent;