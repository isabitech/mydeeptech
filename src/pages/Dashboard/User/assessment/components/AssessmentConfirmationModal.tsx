import React from 'react';
import { Modal, Typography, Row, Col, Divider, Space, Button } from 'antd';
import { 
  BookOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Assessment } from '../../../../../validators/assessment/assessment-schema';
import { formatDuration } from '../../../../../utils/assessment-formatters';

const { Title, Text, Paragraph } = Typography;

interface AssessmentConfirmationModalProps {
  assessment: Assessment | null;
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const AssessmentConfirmationModal: React.FC<AssessmentConfirmationModalProps> = ({
  assessment,
  visible,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!assessment) return null;

  return (
    <Modal
      title={
        <span className="font-[gilroy-regular] text-xl font-bold text-[#333333]">
          Start Assessment
        </span>
      }
      open={visible}
      onCancel={onCancel}
      centered
      footer={[
        <Button 
          key="cancel" 
          onClick={onCancel}
          className="font-[gilroy-regular] h-10 px-6 rounded-lg border-2 border-gray-100 hover:border-gray-200"
        >
          Cancel
        </Button>,
        <Button
          key="start"
          type="primary"
          loading={loading}
          onClick={onConfirm}
          className="bg-[#F6921E] border-0 hover:bg-[#e5831c] font-[gilroy-regular] h-10 px-8 rounded-lg shadow-md shadow-orange-100 font-bold"
        >
          Begin Session
        </Button>,
      ]}
      width={650}
      className="custom-modal"
    >
      <div className="py-2">
        <div className="mb-6">
          <Title level={4} className="!mb-2 font-[gilroy-regular] text-[#1a1a1a]">
            {assessment.title}
          </Title>
          <Paragraph className="text-gray-500 font-[gilroy-regular] leading-relaxed">
            {assessment.description}
          </Paragraph>
        </div>

        <Divider className="my-6 border-gray-100" />

        <Row gutter={[24, 24]} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Col span={8}>
            <div className="text-center">
              <BookOutlined className="text-[#F6921E] text-2xl mb-2" />
              <div className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-widest">Tasks</div>
              <div className="font-bold text-[#333333] font-[gilroy-regular]">
                {assessment.numberOfTasks}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center border-x border-gray-200">
              <ClockCircleOutlined className="text-[#F6921E] text-2xl mb-2" />
              <div className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-widest">Time Limit</div>
              <div className="font-bold text-[#333333] font-[gilroy-regular]">
                {formatDuration(assessment.timeLimit)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <TrophyOutlined className="text-[#F6921E] text-2xl mb-2" />
              <div className="text-[10px] text-gray-400 font-[gilroy-regular] uppercase tracking-widest">Pass Score</div>
              <div className="font-bold text-[#333333] font-[gilroy-regular]">
                {assessment.passingScore}%
              </div>
            </div>
          </Col>
        </Row>

        {assessment.instructions && (
          <div className="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-100">
            <Title level={5} className="!mb-2 font-[gilroy-regular] text-blue-900 text-sm">
              Important Instructions
            </Title>
            <Paragraph className="!mb-0 text-blue-700 font-[gilroy-regular] text-sm leading-relaxed">
              {assessment.instructions}
            </Paragraph>
          </div>
        )}

        {(assessment.prerequisites && assessment.prerequisites.length > 0) && (
          <div className="mb-6 p-5 bg-orange-50 rounded-2xl border border-orange-100">
            <Title level={5} className="!mb-2 font-[gilroy-regular] text-orange-900 text-sm">
              Prerequisites
            </Title>
            <ul className="!mb-0 text-orange-800 font-[gilroy-regular] text-sm space-y-1 pl-4 list-disc">
              {assessment.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <ExclamationCircleOutlined className="text-amber-600 mt-1" />
          <Text className="font-[gilroy-regular] text-amber-900 text-xs leading-relaxed">
            <strong>Warning:</strong> Once started, the timer cannot be paused. Please ensure you have a stable internet connection and at least {formatDuration(assessment.timeLimit)} of uninterrupted time.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default AssessmentConfirmationModal;
