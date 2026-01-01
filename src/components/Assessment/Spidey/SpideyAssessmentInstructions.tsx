import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Checkbox, 
  Alert, 
  Space, 
  Row, 
  Col, 
  Divider,
  Timeline,
  Tag,
  Modal
} from 'antd';
import { 
  ClockCircleOutlined,
//   ShieldOutlined,
  TrophyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BookOutlined,
  StarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { SpideyAssessment } from '../../../hooks/Assessment/useSpideyAssessment';

const { Title, Text, Paragraph } = Typography;

interface SpideyAssessmentInstructionsProps {
  assessment: SpideyAssessment;
  onAcceptInstructions: () => void;
  loading?: boolean;
}

export const SpideyAssessmentInstructions: React.FC<SpideyAssessmentInstructionsProps> = ({
  assessment,
  onAcceptInstructions,
  loading = false
}) => {
  const [acknowledgments, setAcknowledments] = useState({
    readInstructions: false,
    understoodRules: false,
    acceptedConsequences: false,
    confirmedReadiness: false
  });

  const [showFinalWarning, setShowFinalWarning] = useState(false);

  const allAcknowledged = Object.values(acknowledgments).every(Boolean);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}min`;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleAcknowledgmentChange = (key: keyof typeof acknowledgments) => (checked: boolean) => {
    setAcknowledments(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleProceedClick = () => {
    if (!allAcknowledged) return;
    setShowFinalWarning(true);
  };

  const handleFinalConfirm = () => {
    setShowFinalWarning(false);
    onAcceptInstructions();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 font-[gilroy-regular]">
        <div className="max-w-4xl mx-auto p-6">
          {/* Critical Warning Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-red-600 text-white p-4 rounded-t-lg text-center font-bold text-lg">
              ⚠️ HIGH-DISCIPLINE ASSESSMENT - CRITICAL BRIEFING ⚠️
            </div>
          </motion.div>

          {/* Main Instructions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-2xl border-2 border-red-200 rounded-t-none">
              {/* Assessment Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {/* <ShieldOutlined className="text-red-500 text-3xl" /> */}
                  <Title level={2} className="!mb-0 !text-red-700 font-[gilroy-regular]">
                    {assessment.title}
                  </Title>
                  {/* <ShieldOutlined className="text-red-500 text-3xl" /> */}
                </div>
                <Tag color="red" className="font-[gilroy-regular] font-bold text-sm px-4 py-1">
                  {assessment.difficulty.toUpperCase()} LEVEL - {assessment.category.replace('_', ' ').toUpperCase()}
                </Tag>
                <Paragraph className="text-gray-600 font-[gilroy-regular] mt-3 text-lg">
                  {assessment.description}
                </Paragraph>
              </div>

              {/* Assessment Overview */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-red-50 rounded border border-red-200">
                    <BookOutlined className="text-red-500 text-2xl mb-2" />
                    <div className="font-bold text-red-700 text-lg">{assessment.totalStages}</div>
                    <div className="text-red-600 text-sm font-[gilroy-regular]">Stages</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-orange-50 rounded border border-orange-200">
                    <ClockCircleOutlined className="text-orange-500 text-2xl mb-2" />
                    <div className="font-bold text-orange-700 text-lg">{formatDuration(assessment.estimatedDuration)}</div>
                    <div className="text-orange-600 text-sm font-[gilroy-regular]">Total Time</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-yellow-50 rounded border border-yellow-200">
                    <TrophyOutlined className="text-yellow-500 text-2xl mb-2" />
                    <div className="font-bold text-yellow-700 text-lg">{assessment.passingScore}%</div>
                    <div className="text-yellow-600 text-sm font-[gilroy-regular]">Pass Score</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-purple-50 rounded border border-purple-200">
                    <StarOutlined className="text-purple-500 text-2xl mb-2" />
                    <div className="font-bold text-purple-700 text-lg">{assessment.maxAttempts}</div>
                    <div className="text-purple-600 text-sm font-[gilroy-regular]">Attempt Only</div>
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Assessment Stages */}
              <div className="mb-6">
                <Title level={4} className="!mb-4 font-[gilroy-regular] text-gray-800">
                  Assessment Stages Overview
                </Title>
                <Timeline
                  items={assessment.stages.map((stage, index) => ({
                    dot: <CheckCircleOutlined className="text-blue-500" />,
                    children: (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Text strong className="font-[gilroy-regular]">{stage.name}</Text>
                          <Tag color="blue" className="font-[gilroy-regular]">
                            {stage.timeLimit}min limit
                          </Tag>
                        </div>
                        <Text className="text-gray-600 font-[gilroy-regular]">
                          {stage.description}
                        </Text>
                      </div>
                    )
                  }))}
                />
              </div>

              <Divider />

              {/* Requirements */}
              <div className="mb-6">
                <Title level={4} className="!mb-4 font-[gilroy-regular] text-gray-800 flex items-center gap-2">
                  {/* <ExclamationTriangleOutlined className="text-orange-500" /> */}
                  Assessment Requirements
                </Title>
                <div className="space-y-2">
                  {assessment.requirements.map((requirement, index) => (
                    <Alert
                      key={index}
                      message={requirement}
                      type="warning"
                      showIcon
                      className="font-[gilroy-regular]"
                    />
                  ))}
                </div>
              </div>

              {/* Critical Warnings */}
              <div className="mb-6">
                <Title level={4} className="!mb-4 font-[gilroy-regular] text-red-800 flex items-center gap-2">
                  <WarningOutlined className="text-red-500" />
                  CRITICAL WARNINGS - ZERO TOLERANCE
                </Title>
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <div className="space-y-2">
                    {assessment.warnings.map((warning, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">⚠️</span>
                        <Text className="text-red-700 font-[gilroy-regular] font-semibold">
                          {warning}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <Title level={4} className="!mb-4 font-[gilroy-regular] text-green-800 flex items-center gap-2">
                  <TrophyOutlined className="text-green-500" />
                  Benefits Upon Successful Completion
                </Title>
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="space-y-2">
                    {assessment.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-500" />
                        <Text className="text-green-700 font-[gilroy-regular]">
                          {benefit}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Divider />

              {/* Acknowledgment Section */}
              <div className="mb-6">
                <Title level={4} className="!mb-4 font-[gilroy-regular] text-gray-800">
                  Mandatory Acknowledgments
                </Title>
                <div className="space-y-4 bg-gray-50 p-4 rounded border">
                  <Checkbox
                    checked={acknowledgments.readInstructions}
                    onChange={(e) => handleAcknowledgmentChange('readInstructions')(e.target.checked)}
                    className="font-[gilroy-regular]"
                  >
                    <Text className="font-[gilroy-regular] font-medium">
                      I have thoroughly read and understood all assessment instructions, requirements, and stage descriptions
                    </Text>
                  </Checkbox>
                  
                  <Checkbox
                    checked={acknowledgments.understoodRules}
                    onChange={(e) => handleAcknowledgmentChange('understoodRules')(e.target.checked)}
                    className="font-[gilroy-regular]"
                  >
                    <Text className="font-[gilroy-regular] font-medium">
                      I understand this is a ONE ATTEMPT ONLY assessment with zero tolerance for rule violations
                    </Text>
                  </Checkbox>
                  
                  <Checkbox
                    checked={acknowledgments.acceptedConsequences}
                    onChange={(e) => handleAcknowledgmentChange('acceptedConsequences')(e.target.checked)}
                    className="font-[gilroy-regular]"
                  >
                    <Text className="font-[gilroy-regular] font-medium">
                      I accept full responsibility for my performance and understand that failure results in a {assessment.cooldownDays}-day cooldown period
                    </Text>
                  </Checkbox>
                  
                  <Checkbox
                    checked={acknowledgments.confirmedReadiness}
                    onChange={(e) => handleAcknowledgmentChange('confirmedReadiness')(e.target.checked)}
                    className="font-[gilroy-regular]"
                  >
                    <Text className="font-[gilroy-regular] font-medium">
                      I confirm that I am fully prepared, have {formatDuration(assessment.estimatedDuration)} of uninterrupted time, and am ready to begin this high-stakes assessment
                    </Text>
                  </Checkbox>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-x-4">
                <Button
                  size="large"
                  className="font-[gilroy-regular] px-8"
                  onClick={() => window.history.back()}
                >
                  Cancel - I Need More Preparation Time
                </Button>
                
                <Button
                  type="primary"
                  size="large"
                  className={`font-[gilroy-regular] font-bold px-8 ${
                    allAcknowledged 
                      ? 'bg-red-500 border-red-500 hover:bg-red-600' 
                      : 'bg-gray-400 border-gray-400'
                  }`}
                  disabled={!allAcknowledged}
                  onClick={handleProceedClick}
                  loading={loading}
                >
                  I Am Ready - Proceed to Assessment
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Final Warning Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-700">
            {/* <ExclamationTriangleOutlined className="text-red-500" /> */}
            <span className="font-[gilroy-regular] font-bold">FINAL WARNING: Point of No Return</span>
          </div>
        }
        open={showFinalWarning}
        onCancel={() => setShowFinalWarning(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setShowFinalWarning(false)}
            className="font-[gilroy-regular]"
          >
            Wait - Let Me Reconsider
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={loading}
            onClick={handleFinalConfirm}
            className="bg-red-500 border-red-500 hover:bg-red-600 font-[gilroy-regular] font-bold"
          >
            I UNDERSTAND - START ASSESSMENT NOW
          </Button>,
        ]}
        width={600}
        className="critical-warning-modal"
      >
        <div className="space-y-4">
          <Alert
            message="⚠️ LAST CHANCE TO BACK OUT"
            description="Once you click 'START ASSESSMENT NOW', there is absolutely no going back. This is your only attempt."
            type="error"
            showIcon
            className="font-[gilroy-regular]"
          />
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <Text className="font-[gilroy-regular] font-semibold text-yellow-800 block mb-2">
              Final Checklist - Confirm ALL items:
            </Text>
            <ul className="text-yellow-700 font-[gilroy-regular] text-sm space-y-1">
              <li>✓ Stable internet connection verified</li>
              <li>✓ Quiet environment secured for {formatDuration(assessment.estimatedDuration)}</li>
              <li>✓ No distractions or interruptions expected</li>
              <li>✓ Computer and browser fully functional</li>
              <li>✓ Mentally prepared for high-stakes assessment</li>
              <li>✓ Understood this is my ONLY chance</li>
            </ul>
          </div>
          
          <div className="text-center">
            <Text className="font-[gilroy-regular] text-gray-600">
              Are you absolutely certain you want to proceed?
            </Text>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .critical-warning-modal .ant-modal-header {
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border-bottom: 2px solid #dc2626;
        }
      `}</style>
    </>
  );
};