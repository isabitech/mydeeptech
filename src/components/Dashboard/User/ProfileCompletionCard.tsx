import React from 'react';
import { Card, Progress, List, Badge, Button } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { ProfileCompletion, Recommendations, NextStep } from '../../../types/dtuser-dashboard.types';

interface ProfileCompletionCardProps {
  profileCompletion: ProfileCompletion;
  recommendations: Recommendations;
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ 
  profileCompletion, 
  recommendations 
}) => {
  const getSectionIcon = (completed: boolean) => (
    completed ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
    )
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  const sectionsList = [
    { key: 'basicInfo', name: 'Basic Information', data: profileCompletion.sections.basicInfo },
    { key: 'personalInfo', name: 'Personal Information', data: profileCompletion.sections.personalInfo },
    { key: 'professionalBackground', name: 'Professional Background', data: profileCompletion.sections.professionalBackground },
    { key: 'paymentInfo', name: 'Payment Information', data: profileCompletion.sections.paymentInfo },
    { key: 'attachments', name: 'Document Attachments', data: profileCompletion.sections.attachments },
    { key: 'profilePicture', name: 'Profile Picture', data: profileCompletion.sections.profilePicture },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>Profile Completion</span>
          </div>
        }
        className="h-full"
      >
        <div className="space-y-6">
          {/* Progress Overview */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="mb-4">
              <Progress
                type="circle"
                percent={profileCompletion.percentage}
                size={120}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={() => (
                  <div className="text-center">
                    <CountUp 
                      end={profileCompletion.percentage} 
                      duration={2}
                      suffix="%"
                    />
                  </div>
                )}
              />
            </div>
            <p className="text-gray-600">
              {profileCompletion.completedSections} of {profileCompletion.totalSections} sections completed
            </p>
          </motion.div>

          {/* Section Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="font-semibold mb-3">Section Status</h4>
            <List
              size="small"
              dataSource={sectionsList}
              renderItem={(section, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <List.Item
                    className="border-b border-gray-100 last:border-b-0 py-3"
                    actions={[getSectionIcon(section.data.completed)]}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs text-gray-500">
                        {section.data.fields.length} fields
                      </div>
                    </div>
                  </List.Item>
                </motion.div>
              )}
            />
          </motion.div>

          {/* Recommendations */}
          {recommendations.nextSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <List
                size="small"
                dataSource={recommendations.nextSteps}
                renderItem={(recommendation: NextStep, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <List.Item className="border-b border-gray-100 last:border-b-0 py-3">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{recommendation.title}</span>
                          <Badge 
                            color={getPriorityColor(recommendation.priority)}
                            text={recommendation.priority.toUpperCase()}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {recommendation.description}
                        </p>
                        <Button 
                          type="primary" 
                          size="small"
                          className="bg-blue-500"
                        >
                          Take Action
                        </Button>
                      </div>
                    </List.Item>
                  </motion.div>
                )}
              />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ProfileCompletionCard;