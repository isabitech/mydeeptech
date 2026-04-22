import React from 'react';
import { Card, Typography, Badge, Space, Tag, Row, Col, Progress, Button } from 'antd';
import { 
  BookOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  StarOutlined,
  HistoryOutlined,
  ReloadOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Assessment } from '../../../../../validators/assessment/assessment-schema';
import { 
  getStatusColor, 
  getDifficultyColor, 
  formatDuration 
} from '../../../../../utils/assessment-formatters';

const { Title, Text, Paragraph } = Typography;

interface DashboardAssessmentCardProps {
  assessment: Assessment;
  onStart: (assessment: Assessment) => void;
  onViewResults: (attemptId: string) => void;
}

const DashboardAssessmentCard: React.FC<DashboardAssessmentCardProps> = ({ 
  assessment, 
  onStart,
  onViewResults
}) => {
  const canStart = !assessment.userStatus || 
    assessment.userStatus === 'not_started' ||
    (assessment.userStatus === 'failed' && assessment.lastAttempt?.canRetake) ||
    (assessment.userStatus === 'completed' && assessment.lastAttempt?.canRetake);

  const isPassed = assessment.userStatus === 'passed';
  const isInProgress = assessment.userStatus === 'in_progress';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" as const }}
      className="h-full"
    >
      <Card
        className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white group"
        styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' } }}
      >
        {/* Card Header & Status */}
        <div className="mb-5">
          <div className="flex justify-between items-start mb-3">
            <Title level={4} className="!mb-0 font-[gilroy-regular] text-[#333333] group-hover:text-[#F6921E] transition-colors">
              {assessment.title}
            </Title>
            <Badge
              status={getStatusColor(assessment.userStatus)}
              text={
                <Text className="font-[gilroy-regular] text-xs font-semibold uppercase tracking-wider">
                  {assessment.userStatus?.replace('_', ' ') || 'Available'}
                </Text>
              }
            />
          </div>
          
          <Space wrap className="mb-4">
            <Tag color="#F6921E" className="border-0 rounded-full px-3 py-0.5 font-[gilroy-regular] text-[10px] font-bold">
              {assessment.type.replace('_', ' ').toUpperCase()}
            </Tag>
            <Tag 
              color={getDifficultyColor(assessment.difficulty)}
              className="border-0 rounded-full px-3 py-0.5 font-[gilroy-regular] text-[10px] font-bold"
            >
              {assessment.difficulty.toUpperCase()}
            </Tag>
          </Space>

          <Paragraph 
            className="text-gray-500 font-[gilroy-regular] mb-0 leading-relaxed text-sm"
            ellipsis={{ rows: 2 }}
          >
            {assessment.description}
          </Paragraph>
        </div>

        {/* Stats Grid */}
        <div className="flex-grow space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
              <BookOutlined className="text-[#F6921E] text-xl mb-1" />
              <span className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-tighter">Tasks</span>
              <span className="font-bold text-sm font-[gilroy-regular] text-[#333333]">{assessment.numberOfTasks}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
              <ClockCircleOutlined className="text-[#F6921E] text-xl mb-1" />
              <span className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-tighter">Duration</span>
              <span className="font-bold text-sm font-[gilroy-regular] text-[#333333]">{formatDuration(assessment.estimatedDuration)}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
              <TrophyOutlined className="text-[#F6921E] text-xl mb-1" />
              <span className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-tighter">Pass Score</span>
              <span className="font-bold text-sm font-[gilroy-regular] text-[#333333]">{assessment.passingScore}%</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
              <StarOutlined className="text-[#F6921E] text-xl mb-1" />
              <span className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-tighter">Attempts</span>
              <span className="font-bold text-sm font-[gilroy-regular] text-[#333333]">
                {assessment.currentAttempts || 0}/{assessment.maxAttempts || '∞'}
              </span>
            </div>
          </div>

          {/* Last Attempt Results */}
          {assessment.lastAttempt && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <Text className="font-[gilroy-regular] text-xs font-bold text-blue-800">
                  <HistoryOutlined className="mr-1" /> LAST ATTEMPT
                </Text>
                <Tag color={getStatusColor(assessment.lastAttempt.status)} className="m-0 text-[10px] border-0 rounded-md">
                  {assessment.lastAttempt.status.toUpperCase()}
                </Tag>
              </div>
              
              {assessment.lastAttempt.score !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Text className="font-[gilroy-regular] text-[10px] text-gray-500">Your Performance</Text>
                    <Text className="font-[gilroy-regular] text-xs font-black text-blue-900">
                      {assessment.lastAttempt.score}%
                    </Text>
                  </div>
                  <Progress 
                    percent={assessment.lastAttempt.score} 
                    size="small"
                    showInfo={false}
                    strokeColor={assessment.lastAttempt.score >= assessment.passingScore ? '#52c41a' : '#ff4d4f'}
                    trailColor="#e6f4ff"
                    strokeWidth={6}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          {canStart ? (
            <Button
              type="primary"
              icon={isInProgress ? <PlayCircleOutlined /> : (assessment.userStatus === 'not_started' ? <PlayCircleOutlined /> : <ReloadOutlined />)}
              block
              size="large"
              onClick={() => onStart(assessment)}
              className="bg-[#F6921E] border-0 hover:bg-[#e5831c] font-[gilroy-regular] h-12 rounded-xl shadow-lg shadow-orange-200 font-bold transition-all"
            >
              {isInProgress ? 'Continue' : (assessment.userStatus === 'not_started' ? 'Start Assessment' : 'Retake Assessment')}
            </Button>
          ) : isPassed ? (
            <Button
              icon={<HistoryOutlined />}
              block
              size="large"
              className="font-[gilroy-regular] h-12 rounded-xl border-2 border-gray-200 hover:border-[#F6921E] hover:text-[#F6921E] transition-all font-bold"
              onClick={() => assessment.lastAttempt?.id && onViewResults(assessment.lastAttempt.id)}
            >
              View Results
            </Button>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
};

export default DashboardAssessmentCard;
