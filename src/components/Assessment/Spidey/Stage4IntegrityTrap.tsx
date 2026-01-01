import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Typography, 
  Alert, 
  Modal,
  Space,
  Checkbox,
  Divider
} from 'antd';
import { 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AssessmentTimer } from './AssessmentTimer';
import { Stage4Config } from '../../../hooks/Assessment/useSpideyAssessment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Stage4IntegrityTrapProps {
  submissionId: string;
  stage4Config: Stage4Config;
  onAssessmentComplete: (data: any, timeSpent: number) => void;
  onAssessmentFailed: (reason: string) => void;
}

export const Stage4IntegrityTrap: React.FC<Stage4IntegrityTrapProps> = ({
  submissionId,
  stage4Config,
  onAssessmentComplete,
  onAssessmentFailed
}) => {
  const [userResponse, setUserResponse] = useState('');
  const [violationFlagged, setViolationFlagged] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  // Track when user starts responding
  const handleResponseStart = () => {
    if (!responseStartTime && !hasStartedTyping) {
      setResponseStartTime(new Date());
      setHasStartedTyping(true);
    }
  };

  const handleResponseChange = (value: string) => {
    if (!hasStartedTyping) {
      handleResponseStart();
    }
    setUserResponse(value);
  };

  const handleSubmit = () => {
    if (!userResponse.trim()) {
      Modal.error({
        title: 'Response Required',
        content: 'Please provide a response to the instruction.',
        className: 'font-[gilroy-regular]'
      });
      return;
    }

    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    
    const responseTime = responseStartTime ? 
      Math.floor((new Date().getTime() - responseStartTime.getTime()) / 1000) : 0;
    
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    
    const submissionData = {
      instructionGiven: stage4Config.trapInstruction,
      userResponse: userResponse.trim(),
      violationFlagged,
      responseTime,
      timeSpent
    };

    onAssessmentComplete(submissionData, timeSpent);
  };

  const handleTimeUp = () => {
    Modal.error({
      title: 'Time Expired',
      content: 'Stage 4 time limit exceeded. Assessment failed.',
      onOk: () => onAssessmentFailed('Stage 4 timeout - Time limit exceeded')
    });
  };

  // Simulate a realistic task instruction that contains a trap
  const displayInstruction = stage4Config.trapInstruction || 
    "Please analyze the attached document and provide a comprehensive 2-3 paragraph summary focusing on the key methodological flaws and potential improvements.";

  return (
    <div className="stage4-integrity max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="!mb-2 font-[gilroy-regular] text-red-800 flex items-center gap-2">
              {/* <ShieldOutlined /> */}
              Stage 4: Final Quality Assessment
            </Title>
            <Text className="font-[gilroy-regular] text-red-600">
              Complete the final assessment task with careful attention to instructions
            </Text>
          </div>
          <div className="w-64">
            <AssessmentTimer
              timeLimit={stage4Config.timeLimit}
              onTimeUp={handleTimeUp}
              submissionId={submissionId}
              stage="stage4"
            />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Task Instruction */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <EyeOutlined />
              <span className="font-[gilroy-regular]">Task Instruction</span>
            </div>
          }
          className="border-2 border-blue-200"
        >
          <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
            <Paragraph className="font-[gilroy-regular] text-lg leading-relaxed mb-0">
              {displayInstruction}
            </Paragraph>
          </div>

          <Alert
            message="Important Note"
            description="Please read the instruction carefully and complete the task as requested. Pay attention to all details and requirements."
            type="info"
            showIcon
            className="font-[gilroy-regular]"
          />
        </Card>

        {/* Response Section */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <CheckCircleOutlined />
              <span className="font-[gilroy-regular]">Your Response</span>
            </div>
          }
          className="border-2 border-gray-200"
        >
          <div className="space-y-4">
            <TextArea
              placeholder="Provide your detailed response to the task instruction above. Be thorough and precise in your analysis..."
              value={userResponse}
              onChange={(e) => handleResponseChange(e.target.value)}
              rows={8}
              className="font-[gilroy-regular]"
              onFocus={handleResponseStart}
            />
            
            <div className="text-right">
              <Text className="text-sm text-gray-500 font-[gilroy-regular]">
                Characters: {userResponse.length}
              </Text>
            </div>

            <Divider />

            {/* Integrity Check */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <Space direction="vertical" className="w-full">
                <Text className="font-[gilroy-regular] font-semibold text-yellow-800">
                  Quality Assurance Check:
                </Text>
                
                <Checkbox
                  checked={violationFlagged}
                  onChange={(e) => setViolationFlagged(e.target.checked)}
                  className="font-[gilroy-regular]"
                >
                  I notice that this task instruction contains a potential issue or violation that should be flagged for review.
                </Checkbox>
                
                <Text className="text-xs text-yellow-700 font-[gilroy-regular]">
                  Check this box if you identify any problems with the task instruction that violate quality standards or guidelines.
                </Text>
              </Space>
            </div>
          </div>
        </Card>

        {/* Submit Section */}
        <Card className="text-center border-2 border-green-200">
          <div className="space-y-4">
            <Title level={4} className="!mb-2 font-[gilroy-regular] text-green-700">
              Complete Assessment
            </Title>
            
            <Text className="font-[gilroy-regular] text-gray-600">
              Review your response carefully before final submission.
            </Text>
            
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              disabled={!userResponse.trim()}
              className="bg-green-500 border-green-500 hover:bg-green-600 font-[gilroy-regular] font-bold px-12"
            >
              Submit Final Assessment
            </Button>
            
            {!userResponse.trim() && (
              <div className="mt-2">
                <Text className="text-red-500 font-[gilroy-regular] text-sm">
                  Response required to complete assessment
                </Text>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Submit Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-500" />
            <span className="font-[gilroy-regular]">⚠️ FINAL ASSESSMENT SUBMISSION</span>
          </div>
        }
        open={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setShowSubmitModal(false)}
            disabled={isSubmitting}
            className="font-[gilroy-regular]"
          >
            Review Response
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={handleConfirmSubmit}
            className="bg-red-500 border-red-500 hover:bg-red-600 font-[gilroy-regular] font-bold"
          >
            COMPLETE ASSESSMENT - NO TURNING BACK
          </Button>,
        ]}
        width={700}
        className="final-submission-modal"
      >
        <div className="space-y-4">
          <Alert
            message="🚨 ASSESSMENT COMPLETION WARNING"
            description="This is your final submission. Once confirmed, the entire Spidey Assessment will be complete and submitted for evaluation. There are NO second chances, NO appeals, and NO modifications allowed."
            type="error"
            showIcon
            className="font-[gilroy-regular]"
          />

          <div className="bg-gray-50 p-4 rounded space-y-3">
            <Title level={5} className="!mb-2 font-[gilroy-regular]">
              Final Submission Summary:
            </Title>
            
            <div className="space-y-2 text-sm font-[gilroy-regular]">
              <div className="flex justify-between">
                <Text>Response length:</Text>
                <Text className="font-bold">{userResponse.length} characters</Text>
              </div>
              <div className="flex justify-between">
                <Text>Violation flagged:</Text>
                <Text className={`font-bold ${violationFlagged ? 'text-orange-600' : 'text-gray-600'}`}>
                  {violationFlagged ? 'YES' : 'NO'}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text>Response time:</Text>
                <Text className="font-bold">
                  {responseStartTime ? 
                    `${Math.floor((new Date().getTime() - responseStartTime.getTime()) / 1000)}s` : 
                    'Not tracked'
                  }
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <Space direction="vertical" size="small">
              <Text className="font-[gilroy-regular] font-semibold text-red-800">
                🎯 Final Reminders:
              </Text>
              <ul className="text-red-700 font-[gilroy-regular] text-sm list-disc list-inside space-y-1">
                <li>Server has final authority on all scoring decisions</li>
                <li>No appeals process available for any results</li>
                <li>Assessment results are permanent and binding</li>
                <li>Next attempt requires 30-day waiting period</li>
                <li>All responses will be analyzed for integrity</li>
              </ul>
            </Space>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .final-submission-modal .ant-modal-header {
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border-bottom: 3px solid #dc2626;
        }
        
        .final-submission-modal .ant-modal-title {
          color: #dc2626 !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};