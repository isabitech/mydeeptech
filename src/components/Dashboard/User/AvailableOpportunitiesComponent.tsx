import React from 'react';
import { Card, List, Button, Tag, Badge, Row, Col } from 'antd';
import { 
  ProjectOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AvailableOpportunities } from '../../../types/dtuser-dashboard.types';

interface AvailableOpportunitiesComponentProps {
  opportunities: AvailableOpportunities;
}

const AvailableOpportunitiesComponent: React.FC<AvailableOpportunitiesComponentProps> = ({ 
  opportunities 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'closed': return 'red';
      default: return 'blue';
    }
  };

  const getApplicationStatusIcon = (hasApplied: boolean, applicationStatus: string | null) => {
    if (!hasApplied) {
      return <PlusOutlined className="text-blue-500" />;
    }
    
    switch (applicationStatus) {
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

  const getApplicationStatusText = (hasApplied: boolean, applicationStatus: string | null) => {
    if (!hasApplied) {
      return 'Apply Now';
    }
    
    switch (applicationStatus) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Application Pending';
      default:
        return 'Application Pending';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      case 'expert': return 'purple';
      default: return 'blue';
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProjectOutlined />
              <span>Available Opportunities</span>
            </div>
            <Badge 
              count={opportunities.projectCount} 
              style={{ backgroundColor: '#52c41a' }}
            />
          </div>
        }
        extra={
          <Button type="primary" className="bg-blue-500">
            View All Projects
          </Button>
        }
      >
        {opportunities?.availableProjects?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ProjectOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>No opportunities available at the moment</div>
            <div className="text-sm">Check back later for new projects</div>
          </div>
        ) : (
          <List
            dataSource={opportunities.availableProjects}
            renderItem={(project: any, index) => (
              <motion.div
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <List.Item
                  className="border border-gray-100 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-full">
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {project.projectName}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Tag color={getStatusColor(project.status)}>
                          {project.status.toUpperCase()}
                        </Tag>
                      </div>
                    </div>

                    {/* Project Details */}
                    <Row gutter={[16, 8]} className="mb-4">
                      <Col xs={24} sm={6}>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarOutlined className="text-green-500" />
                          <span className="font-medium">
                            ${project.budget ? project.budget.toLocaleString() : 'TBD'}
                          </span>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div className="flex items-center gap-2 text-sm">
                          <ClockCircleOutlined className="text-blue-500" />
                          <span>{project.timeline || 'TBD'}</span>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div className="flex items-center gap-2 text-sm">
                          <TeamOutlined className="text-purple-500" />
                          <span>
                            {project.requirements?.maxAnnotators || 'TBD'} positions
                          </span>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <Tag color={getExperienceLevelColor(project.requirements?.experience_level || 'beginner')}>
                          {project.requirements?.experience_level || 'beginner'}
                        </Tag>
                      </Col>
                    </Row>

                    {/* Skills Required */}
                    {project.requirements?.skills && project.requirements.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Skills Required
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.requirements.skills.slice(0, 4).map((skill: string, skillIndex: number) => (
                            <Tag key={skillIndex}>
                              {skill}
                            </Tag>
                          ))}
                          {project.requirements.skills.length > 4 && (
                            <Tag color="blue">
                              +{project.requirements.skills.length - 4} more
                            </Tag>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        ID: {(project._id || project.id || 'unknown').toString().slice(-8)}
                      </div>
                      <Button
                        type={project.hasApplied ? "default" : "primary"}
                        icon={getApplicationStatusIcon(project.hasApplied || false, project.applicationStatus)}
                        disabled={project.hasApplied && project.applicationStatus === 'rejected'}
                        className={project.hasApplied ? '' : 'bg-blue-500'}
                      >
                        {getApplicationStatusText(project.hasApplied || false, project.applicationStatus)}
                      </Button>
                    </div>
                  </div>
                </List.Item>
              </motion.div>
            )}
          />
        )}

        {/* Summary Footer */}
        {opportunities?.availableProjects?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing {opportunities?.availableProjects.length} of {opportunities?.projectCount} projects
              </span>
              <div className="flex gap-4">
                <span>
                  Applied: {opportunities?.availableProjects.filter(p => p.hasApplied).length}
                </span>
                <span>
                  Available: {opportunities?.availableProjects.filter(p => !p.hasApplied).length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default AvailableOpportunitiesComponent;