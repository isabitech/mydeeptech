import React from 'react';
import { Card, Typography, Button, Space, Result, Statistic, Progress, Alert } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AssessmentResultsProps {
  score: number;
  status: string;
  onReturnToDashboard: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ 
  score, 
  status, 
  onReturnToDashboard 
}) => {
  const isAnnotatorApproved = status === 'annotator';
  const resultIcon = isAnnotatorApproved ? 
    <TrophyOutlined className="text-6xl text-yellow-500" /> : 
    <CheckCircleOutlined className="text-6xl text-blue-500" />;

  const resultTitle = isAnnotatorApproved ? 
    "Congratulations! Advanced English Proficiency" : 
    "Assessment Complete - Basic English Proficiency";

  const resultSubtitle = isAnnotatorApproved ?
    "You've qualified for Advanced English Tasks" :
    "You've been approved for Basic English Tasks";

  const statusColor = isAnnotatorApproved ? "success" : "info";
  const badgeColor = isAnnotatorApproved ? "#52c41a" : "#1890ff";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full shadow-2xl border-0 rounded-2xl overflow-hidden">
        <div className="text-center">
          <Result
            icon={resultIcon}
            title={
              <Title level={2} className={`!mb-2 font-[gilroy-regular] ${
                isAnnotatorApproved ? '!text-green-600' : '!text-blue-600'
              }`}>
                {resultTitle}
              </Title>
            }
            subTitle={
              <Text className="text-lg text-gray-600 font-[gilroy-regular]">
                {resultSubtitle}
              </Text>
            }
          />

          <Space direction="vertical" size="large" className="w-full mt-8">
            {/* Score Display */}
            <Card className="border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white">
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={Math.round(score)}
                  strokeColor={badgeColor}
                  size={120}
                  strokeWidth={8}
                  format={(percent) => (
                    <div>
                      <div className="text-3xl font-bold text-[#333333] font-[gilroy-regular]">
                        {percent}%
                      </div>
                      <div className="text-sm text-gray-500 font-[gilroy-regular]">
                        Score
                      </div>
                    </div>
                  )}
                />
                <Title level={3} className="!text-[#333333] !mt-4 font-[gilroy-regular]">
                  Your Assessment Score
                </Title>
              </div>
            </Card>

            {/* Status Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-gray-200 rounded-xl">
                <div className="text-center">
                  <UserOutlined className="text-4xl text-[#F6921E] mb-4" />
                  <Title level={4} className="!text-[#333333] font-[gilroy-regular]">
                    Account Status
                  </Title>
                  <Alert
                    message={isAnnotatorApproved ? "Data Annotator" : "Micro Tasker"}
                    type={statusColor}
                    showIcon
                    className="mt-3 font-[gilroy-regular]"
                  />
                  <Text className="text-sm text-gray-600 mt-2 block font-[gilroy-regular]">
                    {isAnnotatorApproved 
                      ? "You can now work on advanced English language projects"
                      : "You can now work on basic English language tasks"
                    }
                  </Text>
                </div>
              </Card>

              <Card className="border-2 border-gray-200 rounded-xl">
                <div className="text-center">
                  <ClockCircleOutlined className="text-4xl text-[#F6921E] mb-4" />
                  <Title level={4} className="!text-[#333333] font-[gilroy-regular]">
                    Next Steps
                  </Title>
                  <Text className="text-gray-600 font-[gilroy-regular]">
                    {isAnnotatorApproved 
                      ? "Browse available advanced English projects in your dashboard"
                      : "Check out basic English tasks available for you"
                    }
                  </Text>
                </div>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="border-2 border-gray-200 rounded-xl">
              <Title level={4} className="!text-[#333333] !mb-4 font-[gilroy-regular]">
                Assessment Details
              </Title>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Statistic
                  title={<span className="font-[gilroy-regular]">Total Questions</span>}
                  value={20}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#333333', fontFamily: 'gilroy-regular' }}
                />
                <Statistic
                  title={<span className="font-[gilroy-regular]">Correct Answers</span>}
                  value={Math.round((score / 100) * 20)}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: badgeColor, fontFamily: 'gilroy-regular' }}
                />
                <Statistic
                  title={<span className="font-[gilroy-regular]">Score Percentage</span>}
                  value={Math.round(score)}
                  suffix="%"
                  valueStyle={{ color: badgeColor, fontFamily: 'gilroy-regular' }}
                />
                <Statistic
                  title={<span className="font-[gilroy-regular]">Status</span>}
                  value={isAnnotatorApproved ? "Passed" : "Approved"}
                  valueStyle={{ color: badgeColor, fontFamily: 'gilroy-regular' }}
                />
              </div>
            </Card>

            {/* Information Card */}
            <Card className="border-2 border-gray-200 rounded-xl bg-blue-50">
              <Title level={5} className="!text-[#333333] !mb-3 font-[gilroy-regular]">
                Important Information
              </Title>
              <ul className="space-y-2 text-gray-700 font-[gilroy-regular]">
                <li className="flex items-start">
                  <span className="text-[#F6921E] mr-2">•</span>
                  Your assessment results have been saved to your profile
                </li>
                <li className="flex items-start">
                  <span className="text-[#F6921E] mr-2">•</span>
                  You can now access projects based on your approved status
                </li>
                <li className="flex items-start">
                  <span className="text-[#F6921E] mr-2">•</span>
                  {isAnnotatorApproved 
                    ? "Continue to excel in advanced English projects to build your reputation"
                    : "You can retake the assessment after 24 hours to qualify for advanced English tasks"
                  }
                </li>
                <li className="flex items-start">
                  <span className="text-[#F6921E] mr-2">•</span>
                  Check your dashboard for available projects and tasks
                </li>
              </ul>
            </Card>

            {/* Action Buttons */}
            <div className="text-center pt-6">
              <Button
                type="primary"
                size="large"
                onClick={onReturnToDashboard}
                className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] h-12 px-12 text-lg font-[gilroy-regular] font-semibold rounded-lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default AssessmentResults;