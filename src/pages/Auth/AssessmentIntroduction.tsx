import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, Typography, Space, Divider, Alert, Checkbox } from 'antd';
import { ClockCircleOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { assessmentSections } from '../../data/assessmentQuestions';

const { Title, Text, Paragraph } = Typography;

interface AssessmentIntroductionProps {
  onStartAssessment: () => void;
}

const AssessmentIntroduction: React.FC<AssessmentIntroductionProps> = ({ onStartAssessment }) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const type = searchParams.get('type') || 'english_proficiency';
  const isAkan = type === 'akan_proficiency';

  const title = isAkan ? 'Akan (Twi) Proficiency Assessment' : 'English Proficiency Assessment';
  const timeText = isAkan ? '35 Minutes Total' : '15 Minutes Total';
  const questionText = isAkan ? '25 Multiple Choice' : '20 Multiple Choice';
  const sectionSubtitle = isAkan
    ? '5 sections: Grammar, Vocabulary, Translation, Writing, Reading'
    : '4 sections: Comprehension, Vocabulary, Grammar, Writing';
  const sectionsList = isAkan
    ? [
        { id: 1, title: 'Grammar', description: 'Akan grammar, structure, and usage' },
        { id: 2, title: 'Vocabulary', description: 'Common Akan words and meanings' },
        { id: 3, title: 'Translation', description: 'Translate between English and Akan' },
        { id: 4, title: 'Writing', description: 'Spelling and sentence formation in Akan' },
        { id: 5, title: 'Reading', description: 'Reading comprehension in Akan' },
      ]
    : assessmentSections;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full shadow-2xl border-0 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#F6921E] to-[#ff7b00] text-white p-8 -m-6 mb-6">
          <Title level={1} className="!text-white !mb-2 font-[gilroy-regular]">{title}</Title>
          <Text className="!text-white text-lg opacity-90 font-[gilroy-regular]">
            MyDeepTech Language Evaluation
          </Text>
        </div>

        <Space direction="vertical" size="large" className="w-full">
          <Alert
            message="Important Instructions"
            description="Please read all instructions carefully before starting the assessment."
            type="info"
            icon={<WarningOutlined />}
            className="border-l-4 border-l-[#F6921E]"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-gray-200 rounded-xl">
              <div className="text-center">
                <ClockCircleOutlined className="text-4xl text-[#F6921E] mb-4" />
                <Title level={3} className="!text-[#333333] font-[gilroy-regular]">Time Limit</Title>
                <Text className="text-lg text-gray-600 font-[gilroy-regular]">{timeText}</Text>
                <Paragraph className="text-sm text-gray-500 mt-2">
                  The assessment will automatically submit when time expires
                </Paragraph>
              </div>
            </Card>

            <Card className="border-2 border-gray-200 rounded-xl">
              <div className="text-center">
                <FileTextOutlined className="text-4xl text-[#F6921E] mb-4" />
                <Title level={3} className="!text-[#333333] font-[gilroy-regular]">Questions</Title>
                <Text className="text-lg text-gray-600 font-[gilroy-regular]">{questionText}</Text>
                <Paragraph className="text-sm text-gray-500 mt-2">
                  {sectionSubtitle}
                </Paragraph>
              </div>
            </Card>
          </div>

            <Card className="border-2 border-gray-200 rounded-xl">
            <Title level={3} className="!text-[#333333] mb-4 font-[gilroy-regular]">
              Assessment Sections
            </Title>
            <div className="grid md:grid-cols-2 gap-4">
              {sectionsList.map((section, index) => (
                <div key={section.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#F6921E] text-white rounded-full flex items-center justify-center font-[gilroy-regular] font-semibold">
                    {section.id}
                  </div>
                  <div>
                    <Text strong className="text-[#333333] font-[gilroy-regular]">
                      {section.title}
                    </Text>
                    <br />
                    <Text className="text-gray-600 text-sm font-[gilroy-regular]">
                      {section.description}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-2 border-gray-200 rounded-xl">
            <Title level={3} className="!text-[#333333] mb-4 font-[gilroy-regular]">
              Scoring Information
            </Title>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <CheckCircleOutlined className="text-green-600 mr-2" />
                <Text strong className="text-green-700 font-[gilroy-regular]">
                  Score ≥ 60%
                </Text>
                <br />
                <Text className="text-green-600 text-sm font-[gilroy-regular]">
                  Qualified for Advanced English Tasks
                </Text>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <CheckCircleOutlined className="text-blue-600 mr-2" />
                <Text strong className="text-blue-700 font-[gilroy-regular]">
                  Score &lt; 60%
                </Text>
                <br />
                <Text className="text-blue-600 text-sm font-[gilroy-regular]">
                  Qualified for Basic English Tasks
                </Text>
              </div>
            </div>
          </Card>

          <Card className="border-2 border-gray-200 rounded-xl bg-amber-50">
            <Title level={4} className="!text-[#333333] mb-3 font-[gilroy-regular]">
              Assessment Rules
            </Title>
            <ul className="space-y-2 text-gray-700 font-[gilroy-regular]">
              <li className="flex items-start">
                <span className="text-[#F6921E] mr-2">•</span>
                You have only one attempt at this assessment
              </li>
              <li className="flex items-start">
                <span className="text-[#F6921E] mr-2">•</span>
                You cannot go back to previous questions once submitted
              </li>
              <li className="flex items-start">
                <span className="text-[#F6921E] mr-2">•</span>
                All questions must be answered to proceed
              </li>
              <li className="flex items-start">
                <span className="text-[#F6921E] mr-2">•</span>
                The assessment will auto-submit when time expires
              </li>
              <li className="flex items-start">
                <span className="text-[#F6921E] mr-2">•</span>
                Ensure stable internet connection throughout
              </li>
            </ul>
          </Card>

          <Divider />

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={hasAcceptedTerms}
                onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                className="font-[gilroy-regular]"
              >
                <Text className="font-[gilroy-regular]">
                  I have read and understood all instructions and agree to the assessment terms
                </Text>
              </Checkbox>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={onStartAssessment}
              disabled={!hasAcceptedTerms}
              className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] h-12 px-12 text-lg font-[gilroy-regular] font-semibold rounded-lg"
              icon={<CheckCircleOutlined />}
            >
              Start Assessment
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AssessmentIntroduction;