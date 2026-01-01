import React, { useState } from 'react';
import { Card, Button, Modal, Typography, Space, Checkbox, Alert, Row, Col } from 'antd';
import { 
  ExclamationTriangleOutlined, 
  ClockCircleOutlined, 
  BookOutlined,
  TrophyOutlined,
  WarningOutlined,
  ShieldOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { SpideyAssessment } from '../../../hooks/Assessment/useSpideyAssessment';

const { Title, Text, Paragraph } = Typography;

interface SpideyAssessmentCardProps {
  assessment: SpideyAssessment;
  onStartAssessment: (assessment: SpideyAssessment) => void;
  loading?: boolean;
}

export const SpideyAssessmentCard: React.FC<SpideyAssessmentCardProps> = ({
  assessment,
  onStartAssessment,
  loading = false
}) => {
  const [showStartModal, setShowStartModal] = useState(false);
  const [acknowledged, setAcknowledged] = useState({
    oneAttempt: false,
    timeLimit: false,
    hardRules: false,
    serverAuthority: false
  });

  const allAcknowledged = Object.values(acknowledged).every(Boolean);
  const isHighRisk = assessment.type === 'spidey_assessment';
  
  const canStartAssessment = () => {
    if (!assessment.userStatus) return true;
    
    return (
      assessment.userStatus.status === 'not_started' ||
      (assessment.userStatus.status === 'failed' && assessment.userStatus.canRetake)
    );
  };

  const getStatusText = () => {
    switch (assessment.userStatus?.status) {
      case 'in_progress':
        return 'In Progress - Continue Assessment';
      case 'submitted':
        return 'Under Review';
      case 'passed':
        return 'Passed - Assessment Complete';
      case 'failed':
        return assessment.userStatus.canRetake ? 'Failed - Retake Available' : 'Failed - No Retakes';
      default:
        return 'Start High-Discipline Assessment';
    }
  };

  const getStatusColor = () => {
    switch (assessment.userStatus?.status) {
      case 'in_progress':
        return 'processing';
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'submitted':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleStartClick = () => {
    if (assessment.userStatus?.status === 'in_progress') {
      // Direct start for in-progress assessments
      onStartAssessment(assessment);
    } else {
      // Show confirmation modal for new attempts
      setShowStartModal(true);
    }
  };

  const handleConfirmStart = () => {
    onStartAssessment(assessment);
    setShowStartModal(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card
          className={`h-full border-2 shadow-lg hover:shadow-2xl transition-all duration-300 ${
            isHighRisk ? 'border-red-500 bg-gradient-to-br from-red-50 to-white' : 'border-gray-200'
          }`}
          bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* High-Risk Warning Banner */}
          {isHighRisk && (
            <div className="warning-banner bg-red-500 text-white p-2 text-center font-bold font-[gilroy-regular] -mx-6 -mt-6 mb-4 text-sm">
              ⚠️ HIGH-DISCIPLINE ASSESSMENT - ONE ATTEMPT ONLY ⚠️
            </div>
          )}

          {/* Assessment Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <Title level={4} className="!mb-0 font-[gilroy-regular] text-gray-800 flex items-center gap-2">
                <ShieldOutlined className="text-red-500" />
                {assessment.title}
              </Title>
              <div className="flex flex-col items-end gap-1">
                <span className="critical-badge bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  EXPERT LEVEL
                </span>
                <span className="text-xs font-[gilroy-regular] text-gray-500">
                  {assessment.maxAttempts} attempt only
                </span>
              </div>
            </div>
            
            <Paragraph className="text-gray-600 font-[gilroy-regular] mb-0">
              {assessment.description}
            </Paragraph>
          </div>

          {/* Assessment Details */}
          <div className="flex-grow">
            <Row gutter={[8, 8]} className="mb-4">
              <Col span={12}>
                <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                  <BookOutlined className="text-red-500 text-lg mb-1" />
                  <div className="text-xs text-red-600 font-[gilroy-regular] font-semibold">Stages</div>
                  <div className="font-bold font-[gilroy-regular] text-red-700">{assessment.totalStages}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                  <ClockCircleOutlined className="text-orange-500 text-lg mb-1" />
                  <div className="text-xs text-orange-600 font-[gilroy-regular] font-semibold">Duration</div>
                  <div className="font-bold font-[gilroy-regular] text-orange-700">
                    {formatDuration(assessment.estimatedDuration)}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={[8, 8]} className="mb-4">
              <Col span={12}>
                <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                  <TrophyOutlined className="text-yellow-500 text-lg mb-1" />
                  <div className="text-xs text-yellow-600 font-[gilroy-regular] font-semibold">Pass Score</div>
                  <div className="font-bold font-[gilroy-regular] text-yellow-700">{assessment.passingScore}%</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                  <WarningOutlined className="text-gray-500 text-lg mb-1" />
                  <div className="text-xs text-gray-600 font-[gilroy-regular] font-semibold">Cooldown</div>
                  <div className="font-bold font-[gilroy-regular] text-gray-700">{assessment.cooldownDays} days</div>
                </div>
              </Col>
            </Row>

            {/* Stage Time Limits */}
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <Text className="font-[gilroy-regular] text-sm font-semibold text-blue-800 block mb-2">
                Stage Time Limits (Strict):
              </Text>
              <div className="grid grid-cols-2 gap-2 text-xs font-[gilroy-regular]">
                <div className="text-blue-700">Stage 1: {assessment.stageLimits.stage1}min</div>
                <div className="text-blue-700">Stage 2: {assessment.stageLimits.stage2}min</div>
                <div className="text-blue-700">Stage 3: {assessment.stageLimits.stage3}min</div>
                <div className="text-blue-700">Stage 4: {assessment.stageLimits.stage4}min</div>
              </div>
            </div>

            {/* Critical Warnings */}
            <div className="mb-4">
              {assessment.warnings?.map((warning, index) => (
                <Alert
                  key={index}
                  message={warning}
                  type="error"
                  showIcon
                  className="mb-2 font-[gilroy-regular] text-xs"
                  banner
                />
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            <Button
              type="primary"
              size="large"
              className={`w-full font-[gilroy-regular] font-bold ${
                assessment.userStatus?.status === 'failed' && !assessment.userStatus.canRetake
                  ? 'bg-gray-400 border-gray-400'
                  : 'bg-red-500 border-red-500 hover:bg-red-600'
              }`}
              onClick={handleStartClick}
              loading={loading}
              disabled={!canStartAssessment()}
            >
              {getStatusText()}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Start Assessment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationTriangleOutlined className="text-red-500" />
            <span className="font-[gilroy-regular]">⚠️ CRITICAL: Start High-Discipline Assessment</span>
          </div>
        }
        open={showStartModal}
        onCancel={() => {
          setShowStartModal(false);
          setAcknowledged({
            oneAttempt: false,
            timeLimit: false,
            hardRules: false,
            serverAuthority: false
          });
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setShowStartModal(false)}
            className="font-[gilroy-regular]"
          >
            Cancel - I Need More Time to Prepare
          </Button>,
          <Button
            key="start"
            type="primary"
            loading={loading}
            onClick={handleConfirmStart}
            disabled={!allAcknowledged}
            className="bg-red-500 border-red-500 hover:bg-red-600 font-[gilroy-regular] font-bold"
          >
            I Understand - Start Assessment NOW
          </Button>,
        ]}
        width={700}
        className="high-risk-modal"
      >
        <div className="space-y-4">
          <Alert
            message="⚠️ FINAL WARNING: ONE ATTEMPT ONLY"
            description="This assessment has ZERO tolerance for mistakes. Once started, you cannot pause, restart, or retake. Failure means waiting 30 days for another opportunity."
            type="error"
            showIcon
            className="font-[gilroy-regular]"
          />

          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <Title level={5} className="!mb-3 font-[gilroy-regular] text-red-800">
              Critical Assessment Rules - NO EXCEPTIONS:
            </Title>
            <div className="space-y-3">
              <Checkbox
                checked={acknowledged.oneAttempt}
                onChange={(e) => setAcknowledged(prev => ({ ...prev, oneAttempt: e.target.checked }))}
                className="font-[gilroy-regular]"
              >
                <Text className="text-red-700 font-[gilroy-regular] font-medium">
                  I understand this is ONE ATTEMPT ONLY. No retakes, no exceptions, no technical issues excuse.
                </Text>
              </Checkbox>
              
              <Checkbox
                checked={acknowledged.timeLimit}
                onChange={(e) => setAcknowledged(prev => ({ ...prev, timeLimit: e.target.checked }))}
                className="font-[gilroy-regular]"
              >
                <Text className="text-red-700 font-[gilroy-regular] font-medium">
                  I understand each stage has STRICT time limits. Auto-submit on timeout = immediate failure.
                </Text>
              </Checkbox>
              
              <Checkbox
                checked={acknowledged.hardRules}
                onChange={(e) => setAcknowledged(prev => ({ ...prev, hardRules: e.target.checked }))}
                className="font-[gilroy-regular]"
              >
                <Text className="text-red-700 font-[gilroy-regular] font-medium">
                  I understand ANY violation of assessment rules results in immediate termination and failure.
                </Text>
              </Checkbox>
              
              <Checkbox
                checked={acknowledged.serverAuthority}
                onChange={(e) => setAcknowledged(prev => ({ ...prev, serverAuthority: e.target.checked }))}
                className="font-[gilroy-regular]"
              >
                <Text className="text-red-700 font-[gilroy-regular] font-medium">
                  I understand the server has final authority on all decisions. No appeals, no disputes.
                </Text>
              </Checkbox>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <Space direction="vertical" size="small">
              <Text className="font-[gilroy-regular] font-semibold text-yellow-800">
                Before starting, ensure you have:
              </Text>
              <ul className="text-yellow-700 font-[gilroy-regular] text-sm list-disc list-inside space-y-1">
                <li>Stable internet connection</li>
                <li>Quiet, distraction-free environment</li>
                <li>Full {formatDuration(assessment.estimatedDuration)} of uninterrupted time</li>
                <li>Proper computer/browser setup</li>
                <li>Clear understanding this is your ONLY chance</li>
              </ul>
            </Space>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .high-risk-modal .ant-modal-header {
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border-bottom: 2px solid #dc2626;
        }
        
        .warning-banner {
          position: relative;
          animation: warning-pulse 2s infinite;
        }
        
        @keyframes warning-pulse {
          0% { background-color: #dc2626; }
          50% { background-color: #b91c1c; }
          100% { background-color: #dc2626; }
        }
        
        .critical-badge {
          animation: badge-glow 2s infinite alternate;
        }
        
        @keyframes badge-glow {
          from { box-shadow: 0 0 5px #dc2626; }
          to { box-shadow: 0 0 10px #dc2626, 0 0 15px #dc2626; }
        }
      `}</style>
    </>
  );
};