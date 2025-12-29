import React, { useState } from 'react';
import { Card, Button, Typography, Space, Alert, Divider, Tag, Checkbox } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface AssessmentInstructionsProps {
  assessmentId: string;
  onStartAssessment: () => void;
  loading?: boolean;
}

const AssessmentInstructions: React.FC<AssessmentInstructionsProps> = ({
  assessmentId,
  onStartAssessment,
  loading = false,
}) => {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Card 
          className="shadow-xl border-0 rounded-2xl overflow-hidden"
          styles={{
            body: { padding: 0 }
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="text-center">
              <VideoCameraOutlined className="text-5xl mb-4 opacity-90" />
              <Title level={2} className="!text-white !mb-2">
                Video Annotation Assessment
              </Title>
              <Text className="text-blue-100 text-lg">
                Create engaging conversations from video content
              </Text>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Overview */}
            <div className="mb-8">
              <Title level={4} className="!text-gray-800 !mb-4 flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-600" />
                Assessment Overview
              </Title>
              <Paragraph className="text-gray-600 text-base leading-relaxed">
                This assessment evaluates your ability to analyze video content and create natural, 
                engaging conversations. You'll work with short video reels and demonstrate your 
                annotation skills by building meaningful dialogue based on the content.
              </Paragraph>
            </div>

            {/* Assessment Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center border border-gray-200 hover:shadow-md transition-shadow">
                <ClockCircleOutlined className="text-2xl text-orange-500 mb-3" />
                <Title level={5} className="!mb-2">Duration</Title>
                <Text className="text-gray-600">45 minutes</Text>
              </Card>
              
              <Card className="text-center border border-gray-200 hover:shadow-md transition-shadow">
                <FileTextOutlined className="text-2xl text-green-500 mb-3" />
                <Title level={5} className="!mb-2">Tasks</Title>
                <Text className="text-gray-600">5 conversations</Text>
              </Card>
              
              <Card className="text-center border border-gray-200 hover:shadow-md transition-shadow">
                <MessageOutlined className="text-2xl text-purple-500 mb-3" />
                <Title level={5} className="!mb-2">Min Turns</Title>
                <Text className="text-gray-600">3-8 per conversation</Text>
              </Card>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <Title level={4} className="!text-gray-800 !mb-4 flex items-center gap-2">
                <CheckCircleOutlined className="text-green-600" />
                What You'll Do
              </Title>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  </div>
                  <div>
                    <Title level={5} className="!mb-1 !text-gray-800">Watch Video Reels</Title>
                    <Text className="text-gray-600">
                      Analyze short video content to understand the context, theme, and key elements.
                    </Text>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  </div>
                  <div>
                    <Title level={5} className="!mb-1 !text-gray-800">Create Conversations</Title>
                    <Text className="text-gray-600">
                      Build natural, multi-turn conversations that relate to the video content and demonstrate engagement.
                    </Text>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  </div>
                  <div>
                    <Title level={5} className="!mb-1 !text-gray-800">Submit Your Work</Title>
                    <Text className="text-gray-600">
                      Complete all 5 tasks within the time limit and submit your conversations for review.
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <Title level={4} className="!text-gray-800 !mb-4">
                Requirements & Guidelines
              </Title>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Title level={5} className="!mb-3 text-gray-700">Conversation Quality</Title>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                        <Text className="text-gray-600">Minimum 3 conversation turns</Text>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                        <Text className="text-gray-600">Natural and engaging dialogue</Text>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                        <Text className="text-gray-600">Relevant to video content</Text>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <Title level={5} className="!mb-3 text-gray-700">Assessment Rules</Title>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                        <Text className="text-gray-600">45-minute time limit</Text>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                        <Text className="text-gray-600">Pausing allowed</Text>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                        <Text className="text-gray-600">Progress automatically saved</Text>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <Alert
              message="Project Context"
              description={
                <div>
                  <Text strong>Fact-checking Project - Research</Text>
                  <br />
                  <Text className="text-gray-600">
                    We're looking for detail-oriented individuals to review and create high-quality 
                    content. This assessment helps us evaluate your attention to detail and ability 
                    to create engaging, natural conversations.
                  </Text>
                </div>
              }
              type="info"
              showIcon
              className="mb-8"
            />

            <Divider />

            {/* Confirmation and Start */}
            <div className="text-center">
              <div className="mb-6">
                <Checkbox 
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="text-base"
                >
                  <Text className="text-gray-700">
                    I have read and understood the assessment instructions and requirements
                  </Text>
                </Checkbox>
              </div>

              <Space size="large">
                <Button 
                  size="large" 
                  className="px-8"
                >
                  Review Instructions
                </Button>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  onClick={onStartAssessment}
                  disabled={!understood}
                  loading={loading}
                  className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Starting Assessment...' : 'Start Assessment'}
                </Button>
              </Space>

              <div className="mt-6 text-center">
                <Text type="secondary" className="text-sm">
                  Make sure you have a stable internet connection and are in a quiet environment
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AssessmentInstructions;