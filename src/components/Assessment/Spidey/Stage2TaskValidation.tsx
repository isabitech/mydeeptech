import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  Typography, 
  Alert, 
  Space, 
  Modal,
  Progress,
  Divider,
  Checkbox
} from 'antd';
import { 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AssessmentTimer } from './AssessmentTimer';
import { Stage2Config } from '../../../hooks/Assessment/useSpideyAssessment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Stage2TaskValidationProps {
  submissionId: string;
  stage2Config: Stage2Config;
  onStageComplete: (data: any, timeSpent: number) => void;
  onAssessmentFailed: (reason: string) => void;
}

export const Stage2TaskValidation: React.FC<Stage2TaskValidationProps> = ({
  submissionId,
  stage2Config,
  onStageComplete,
  onAssessmentFailed
}) => {
  const [formData, setFormData] = useState({
    promptText: '',
    domain: '',
    failureExplanation: '',
    fileReferences: [] as string[],
    response: ''
  });
  
  const [validationState, setValidationState] = useState({
    promptText: null as boolean | null,
    domain: null as boolean | null,
    failureExplanation: null as boolean | null,
    fileReferences: null as boolean | null,
    response: null as boolean | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFileForViewing, setSelectedFileForViewing] = useState<string | null>(null);

  // Real-time validation
  useEffect(() => {
    validateField('promptText', formData.promptText);
  }, [formData.promptText]);

  useEffect(() => {
    validateField('domain', formData.domain);
  }, [formData.domain]);

  useEffect(() => {
    validateField('failureExplanation', formData.failureExplanation);
  }, [formData.failureExplanation]);

  useEffect(() => {
    validateField('response', formData.response);
  }, [formData.response]);

  useEffect(() => {
    validateField('fileReferences', formData.fileReferences);
  }, [formData.fileReferences]);

  const validateField = (fieldName: string, value: any) => {
    let isValid = null;
    const req = stage2Config.requirements;

    switch (fieldName) {
      case 'promptText':
        isValid = typeof value === 'string' && 
                 value.length >= req.promptMinLength && 
                 value.length <= req.promptMaxLength;
        break;
      case 'domain':
        isValid = typeof value === 'string' && 
                 value.length >= req.domainMinLength && 
                 value.length <= req.domainMaxLength;
        break;
      case 'failureExplanation':
        isValid = typeof value === 'string' && 
                 value.length >= req.failureMinLength && 
                 value.length <= req.failureMaxLength;
        break;
      case 'response':
        isValid = typeof value === 'string' && 
                 value.length >= req.responseMinLength && 
                 value.length <= req.responseMaxLength;
        break;
      case 'fileReferences':
        isValid = Array.isArray(value) && value.length >= 1;
        break;
    }

    setValidationState(prev => ({
      ...prev,
      [fieldName]: isValid
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileReferenceToggle = (fileName: string, checked: boolean) => {
    const newReferences = checked 
      ? [...formData.fileReferences, fileName]
      : formData.fileReferences.filter(ref => ref !== fileName);
    
    handleInputChange('fileReferences', newReferences);
  };

  const handleSubmit = () => {
    const allValid = Object.values(validationState).every(state => state === true);
    
    if (!allValid) {
      Modal.error({
        title: 'Validation Errors',
        content: 'Please fix all validation errors before submitting.',
        className: 'font-[gilroy-regular]'
      });
      return;
    }

    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    onStageComplete(formData, timeSpent);
  };

  const handleTimeUp = () => {
    Modal.error({
      title: 'Time Expired',
      content: 'Stage 2 time limit exceeded. Assessment failed.',
      onOk: () => onAssessmentFailed('Stage 2 timeout - Time limit exceeded')
    });
  };

  const getValidationMessage = (field: string) => {
    const req = stage2Config.requirements;
    const value = formData[field as keyof typeof formData];
    const isValid = validationState[field as keyof typeof validationState];
    
    if (isValid === null) return null;
    
    const messages: Record<string, string> = {
      promptText: `Must be ${req.promptMinLength}-${req.promptMaxLength} characters. Current: ${(value as string)?.length || 0}`,
      domain: `Must be ${req.domainMinLength}-${req.domainMaxLength} characters. Current: ${(value as string)?.length || 0}`,
      failureExplanation: `Must be ${req.failureMinLength}-${req.failureMaxLength} characters. Current: ${(value as string)?.length || 0}`,
      response: `Must be ${req.responseMinLength}-${req.responseMaxLength} characters. Current: ${(value as string)?.length || 0}`,
      fileReferences: `Must reference at least 1 file. Currently selected: ${(value as string[])?.length || 0}`
    };

    return (
      <Text className={`text-xs font-[gilroy-regular] ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        {isValid ? '✓ Valid' : messages[field]}
      </Text>
    );
  };

  const getOverallProgress = () => {
    const validCount = Object.values(validationState).filter(state => state === true).length;
    return (validCount / Object.keys(validationState).length) * 100;
  };

  return (
    <div className="stage2-validation max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="!mb-2 font-[gilroy-regular] text-orange-800 flex items-center gap-2">
              <FileTextOutlined />
              Stage 2: Mini Task Validation
            </Title>
            <Text className="font-[gilroy-regular] text-orange-600">
              Design validation scenarios for quality enforcement • Zero tolerance for incomplete responses
            </Text>
          </div>
          <div className="w-64">
            <AssessmentTimer
              timeLimit={stage2Config.timeLimit}
              onTimeUp={handleTimeUp}
              submissionId={submissionId}
              stage="stage2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Text className="font-[gilroy-regular] text-sm text-orange-700">
              Completion Progress
            </Text>
            <Text className="font-[gilroy-regular] text-sm text-orange-700">
              {Math.round(getOverallProgress())}% Complete
            </Text>
          </div>
          <Progress 
            percent={getOverallProgress()} 
            strokeColor="#fa8c16"
            showInfo={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reference Files Panel */}
        <div className="lg:col-span-1">
          <Card 
            title={
              <div className="flex items-center gap-2">
                <EyeOutlined />
                <span className="font-[gilroy-regular]">Reference Files</span>
              </div>
            }
            className="h-fit"
          >
            <div className="space-y-3">
              {stage2Config.referenceFiles.map((file, index) => (
                <div key={index} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <Text className="font-semibold font-[gilroy-regular] text-sm">
                      {file.fileName}
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setSelectedFileForViewing(file.fileUrl)}
                      className="p-0 font-[gilroy-regular]"
                    >
                      View
                    </Button>
                  </div>
                  <Text className="text-xs text-gray-600 font-[gilroy-regular] block mb-2">
                    {file.description}
                  </Text>
                  <Checkbox
                    checked={formData.fileReferences.includes(file.fileName)}
                    onChange={(e) => handleFileReferenceToggle(file.fileName, e.target.checked)}
                    className="font-[gilroy-regular] text-sm"
                  >
                    Reference in response
                  </Checkbox>
                </div>
              ))}
              
              <div className="mt-3">
                {getValidationMessage('fileReferences')}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Form Panel */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="space-y-6">
              {/* Task Prompt */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Title level={5} className="!mb-0 font-[gilroy-regular]">
                    1. Task Prompt Design *
                  </Title>
                  {validationState.promptText === true && <CheckCircleOutlined className="text-green-500" />}
                  {validationState.promptText === false && <ExclamationCircleOutlined className="text-red-500" />}
                </div>
                
                <TextArea
                  placeholder="Design a clear, specific task prompt that would challenge annotators while maintaining quality standards..."
                  value={formData.promptText}
                  onChange={(e) => handleInputChange('promptText', e.target.value)}
                  rows={4}
                  className="font-[gilroy-regular]"
                />
                
                <div className="flex justify-between mt-1">
                  {getValidationMessage('promptText')}
                  <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                    {stage2Config.requirements.promptMinLength}-{stage2Config.requirements.promptMaxLength} chars
                  </Text>
                </div>
              </div>

              <Divider />

              {/* Domain Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Title level={5} className="!mb-0 font-[gilroy-regular]">
                    2. Task Domain *
                  </Title>
                  {validationState.domain === true && <CheckCircleOutlined className="text-green-500" />}
                  {validationState.domain === false && <ExclamationCircleOutlined className="text-red-500" />}
                </div>
                
                <Input
                  placeholder="e.g., Computer Vision, Natural Language Processing, Data Classification..."
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  className="font-[gilroy-regular]"
                />
                
                <div className="flex justify-between mt-1">
                  {getValidationMessage('domain')}
                  <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                    {stage2Config.requirements.domainMinLength}-{stage2Config.requirements.domainMaxLength} chars
                  </Text>
                </div>
              </div>

              <Divider />

              {/* Failure Explanation */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Title level={5} className="!mb-0 font-[gilroy-regular]">
                    3. Failure Mode Analysis *
                  </Title>
                  {validationState.failureExplanation === true && <CheckCircleOutlined className="text-green-500" />}
                  {validationState.failureExplanation === false && <ExclamationCircleOutlined className="text-red-500" />}
                </div>
                
                <TextArea
                  placeholder="Explain the most common failure modes for this task type and how they should be detected and prevented..."
                  value={formData.failureExplanation}
                  onChange={(e) => handleInputChange('failureExplanation', e.target.value)}
                  rows={4}
                  className="font-[gilroy-regular]"
                />
                
                <div className="flex justify-between mt-1">
                  {getValidationMessage('failureExplanation')}
                  <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                    {stage2Config.requirements.failureMinLength}-{stage2Config.requirements.failureMaxLength} chars
                  </Text>
                </div>
              </div>

              <Divider />

              {/* Validation Response */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Title level={5} className="!mb-0 font-[gilroy-regular]">
                    4. Quality Validation Strategy *
                  </Title>
                  {validationState.response === true && <CheckCircleOutlined className="text-green-500" />}
                  {validationState.response === false && <ExclamationCircleOutlined className="text-red-500" />}
                </div>
                
                <TextArea
                  placeholder="Describe your comprehensive strategy for validating quality, including specific checkpoints, red flags, and enforcement mechanisms..."
                  value={formData.response}
                  onChange={(e) => handleInputChange('response', e.target.value)}
                  rows={6}
                  className="font-[gilroy-regular]"
                />
                
                <div className="flex justify-between mt-1">
                  {getValidationMessage('response')}
                  <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                    {stage2Config.requirements.responseMinLength}-{stage2Config.requirements.responseMaxLength} chars
                  </Text>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={Object.values(validationState).some(state => state !== true)}
                  className="bg-orange-500 border-orange-500 hover:bg-orange-600 font-[gilroy-regular] font-bold"
                >
                  Submit Stage 2
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <WarningOutlined className="text-orange-500" />
            <span className="font-[gilroy-regular]">Submit Stage 2 Validation</span>
          </div>
        }
        open={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setShowSubmitModal(false)}
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
            Final Submit - Cannot Change
          </Button>,
        ]}
        width={600}
      >
        <Alert
          message="Final Stage 2 Submission"
          description="Your validation design will be evaluated for completeness, accuracy, and quality enforcement capability. Any violations will result in immediate failure."
          type="warning"
          showIcon
          className="font-[gilroy-regular]"
        />
      </Modal>

      {/* File Viewer Modal */}
      <Modal
        title="Reference File Viewer"
        open={!!selectedFileForViewing}
        onCancel={() => setSelectedFileForViewing(null)}
        footer={null}
        width={800}
        className="font-[gilroy-regular]"
      >
        {selectedFileForViewing && (
          <iframe
            src={selectedFileForViewing}
            className="w-full h-96 border rounded"
            title="Reference File"
          />
        )}
      </Modal>
    </div>
  );
};