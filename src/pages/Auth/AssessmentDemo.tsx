import React from 'react';
import { Card, Typography, Space, Button, Alert } from 'antd';
import { BookOutlined, ClockCircleOutlined, CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AssessmentDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="!text-[#333333] font-[gilroy-regular]">
            English Proficiency Assessment System
          </Title>
          <Text className="text-xl text-gray-600 font-[gilroy-regular]">
            Complete In-House Language Evaluation Platform
          </Text>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-gray-200 rounded-xl shadow-lg">
            <div className="text-center p-6">
              <BookOutlined className="text-5xl text-[#F6921E] mb-4" />
              <Title level={3} className="!text-[#333333] font-[gilroy-regular]">
                Introduction Page
              </Title>
              <Paragraph className="text-gray-600 font-[gilroy-regular]">
                Comprehensive instructions, rules, and assessment overview for English proficiency evaluation.
              </Paragraph>
            </div>
          </Card>

          <Card className="border-2 border-gray-200 rounded-xl shadow-lg">
            <div className="text-center p-6">
              <ClockCircleOutlined className="text-5xl text-[#F6921E] mb-4" />
              <Title level={3} className="!text-[#333333] font-[gilroy-regular]">
                Timed Exam
              </Title>
              <Paragraph className="text-gray-600 font-[gilroy-regular]">
                15-minute countdown timer with 4 sections: Comprehension, Vocabulary, Grammar, and Writing.
              </Paragraph>
            </div>
          </Card>

          <Card className="border-2 border-gray-200 rounded-xl shadow-lg">
            <div className="text-center p-6">
              <TrophyOutlined className="text-5xl text-[#F6921E] mb-4" />
              <Title level={3} className="!text-[#333333] font-[gilroy-regular]">
                Results Page
              </Title>
              <Paragraph className="text-gray-600 font-[gilroy-regular]">
                Detailed score breakdown with automatic English proficiency level assignment.
              </Paragraph>
            </div>
          </Card>
        </div>

        {/* Assessment Specifications */}
        <Card className="border-2 border-gray-200 rounded-xl shadow-xl mb-8">
          <Title level={2} className="!text-[#333333] !mb-6 font-[gilroy-regular]">
            Assessment Specifications
          </Title>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Title level={4} className="!text-[#F6921E] font-[gilroy-regular]">
                Structure & Timing
              </Title>
              <ul className="space-y-3 text-gray-700 font-[gilroy-regular]">
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>15-minute total time limit</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>20 Multiple Choice Questions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>4 Sections (5 questions each)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>Auto-submit when time expires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>Progress tracking across sections</span>
                </li>
              </ul>
            </div>

            <div>
              <Title level={4} className="!text-[#F6921E] font-[gilroy-regular]">
                Scoring & Status
              </Title>
              <ul className="space-y-3 text-gray-700 font-[gilroy-regular]">
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-green-600 mr-2 mt-1" />
                  <span>Score ≥60% → Qualified for Advanced English Tasks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-blue-600 mr-2 mt-1" />
                  <span>Score &lt;60% → Qualified for Basic English Tasks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>Real-time score calculation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>Automatic status updates via API</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleOutlined className="text-[#F6921E] mr-2 mt-1" />
                  <span>24-hour retake cooldown</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Question Categories */}
        <Card className="border-2 border-gray-200 rounded-xl shadow-xl mb-8">
          <Title level={2} className="!text-[#333333] !mb-6 font-[gilroy-regular]">
            Assessment Sections
          </Title>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="border border-orange-200 bg-orange-50">
                <Title level={5} className="!text-[#F6921E] font-[gilroy-regular]">
                  Section 1: Comprehension
                </Title>
                <Text className="text-gray-600 font-[gilroy-regular]">
                  Reading comprehension, text analysis, and inference skills.
                </Text>
              </Card>
              
              <Card className="border border-blue-200 bg-blue-50">
                <Title level={5} className="!text-blue-600 font-[gilroy-regular]">
                  Section 2: Vocabulary
                </Title>
                <Text className="text-gray-600 font-[gilroy-regular]">
                  Word knowledge, definitions, synonyms, and appropriate usage.
                </Text>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card className="border border-green-200 bg-green-50">
                <Title level={5} className="!text-green-600 font-[gilroy-regular]">
                  Section 3: Grammar
                </Title>
                <Text className="text-gray-600 font-[gilroy-regular]">
                  English grammar rules, sentence structure, and syntax evaluation.
                </Text>
              </Card>
              
              <Card className="border border-purple-200 bg-purple-50">
                <Title level={5} className="!text-purple-600 font-[gilroy-regular]">
                  Section 4: Writing
                </Title>
                <Text className="text-gray-600 font-[gilroy-regular]">
                  Writing skills, style, composition techniques, and formal communication.
                </Text>
              </Card>
            </div>
          </div>
        </Card>

        {/* Features List */}
        <Card className="border-2 border-gray-200 rounded-xl shadow-xl mb-8">
          <Title level={2} className="!text-[#333333] !mb-6 font-[gilroy-regular]">
            Key Features Implemented
          </Title>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Title level={4} className="!text-[#F6921E] font-[gilroy-regular]">
                User Experience
              </Title>
              <ul className="space-y-2 text-gray-700 font-[gilroy-regular]">
                <li>• MyDeepTech branding with custom colors (#F6921E)</li>
                <li>• Gilroy font family throughout</li>
                <li>• Responsive design for all devices</li>
                <li>• Intuitive navigation between sections</li>
                <li>• Real-time progress indicators</li>
                <li>• Time warnings (5-minute alert)</li>
                <li>• Smooth transitions and animations</li>
              </ul>
            </div>

            <div>
              <Title level={4} className="!text-[#F6921E] font-[gilroy-regular]">
                Technical Features
              </Title>
              <ul className="space-y-2 text-gray-700 font-[gilroy-regular]">
                <li>• API-driven question loading with fallback</li>
                <li>• TypeScript integration with type safety</li>
                <li>• Assessment submission and scoring API</li>
                <li>• Local state management for answers</li>
                <li>• Error handling and validation</li>
                <li>• Dashboard integration and routing</li>
                <li>• English proficiency level assignment</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Alert
            message="English Proficiency Assessment Ready"
            description="The complete in-house English proficiency assessment system has been successfully implemented with API integration and is ready for use."
            type="success"
            showIcon
            className="mb-6 font-[gilroy-regular]"
          />
          
          <Space size="large">
            <Button
              type="primary"
              size="large"
              className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] h-12 px-8 font-[gilroy-regular]"
              onClick={() => window.location.href = '/assessment'}
            >
              Try English Assessment
            </Button>
            
            <Button
              size="large"
              className="h-12 px-8 font-[gilroy-regular]"
              onClick={() => window.location.href = '/dashboard/assessment'}
            >
              Dashboard Integration
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDemo;