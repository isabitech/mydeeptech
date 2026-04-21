import React from 'react';
import { Modal, Card, Row, Col, Statistic, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AssessmentRecord } from '../../../../types/assessment.types';

const { Title, Text } = Typography;

interface AssessmentDetailsModalProps {
  assessment: AssessmentRecord | null;
  visible: boolean;
  onClose: () => void;
}

const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
  assessment,
  visible,
  onClose,
}) => {
  const getGradeColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  return (
    <Modal
      title={
        <span className="text-[#333333] font-[gilroy-regular] text-lg">
          Assessment Details
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="font-[gilroy-regular]"
    >
      {assessment && (
        <div>
          {/* Assessment Summary */}
          <Row gutter={16} className="mb-6">
            <Col span={12}>
              <Card size="small" className="text-center">
                <Statistic
                  title="Score"
                  value={assessment.scorePercentage}
                  suffix="%"
                  valueStyle={{ 
                    color: getGradeColor(assessment.scorePercentage),
                    fontFamily: 'gilroy-regular' 
                  }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" className="text-center">
                <Statistic
                  title="Time Spent"
                  value={assessment.timeSpentMinutes}
                  suffix="min"
                  valueStyle={{ fontFamily: 'gilroy-regular' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Question Details */}
          {assessment.questions && assessment.questions.length > 0 && (
            <div>
              <Title level={5} className="!text-[#333333] font-[gilroy-regular]">
                Question Breakdown
              </Title>
              <div className="max-h-96 overflow-y-auto">
                {assessment.questions.map((question, index) => (
                  <Card 
                    key={question.questionId}
                    size="small" 
                    className={`mb-3 ${question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Text strong className="font-[gilroy-regular]">
                          Q{index + 1}: {question.questionText}
                        </Text>
                        <br />
                        <Text className="font-[gilroy-regular]">
                          Your answer: <Text strong>{question.userAnswer}</Text>
                        </Text>
                      </div>
                      <Tag 
                        color={question.isCorrect ? 'success' : 'error'}
                        icon={question.isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      >
                        {question.isCorrect ? 'Correct' : 'Incorrect'}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AssessmentDetailsModal;
export { AssessmentDetailsModal };
