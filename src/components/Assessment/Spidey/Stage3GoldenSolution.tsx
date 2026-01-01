import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Upload, 
  Typography, 
  Alert, 
  Modal,
  Progress,
  List,
  message,
  Divider
} from 'antd';
import { 
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AssessmentTimer } from './AssessmentTimer';
import { Stage3Config } from '../../../hooks/Assessment/useSpideyAssessment';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface Stage3GoldenSolutionProps {
  submissionId: string;
  stage3Config: Stage3Config;
  onStageComplete: (data: any, timeSpent: number) => void;
  onAssessmentFailed: (reason: string) => void;
  onFileUpload: (files: File[]) => Promise<{ success: boolean; error?: string }>;
}

export const Stage3GoldenSolution: React.FC<Stage3GoldenSolutionProps> = ({
  submissionId,
  stage3Config,
  onStageComplete,
  onAssessmentFailed,
  onFileUpload
}) => {
  const [formData, setFormData] = useState({
    positiveRubric: '',
    negativeRubric: ''
  });
  
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [startTime] = useState(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const { requirements } = stage3Config;

  // Validation states
  const isPositiveRubricValid = formData.positiveRubric.length >= requirements.positiveRubricMinLength;
  const isNegativeRubricValid = formData.negativeRubric.length >= requirements.negativeRubricMinLength;
  const isFilesValid = files.length >= requirements.minFiles && files.length <= requirements.maxFiles;
  
  const allValid = isPositiveRubricValid && isNegativeRubricValid && isFilesValid;
  
  const getProgress = () => {
    let completed = 0;
    if (isPositiveRubricValid) completed++;
    if (isNegativeRubricValid) completed++;
    if (isFilesValid) completed++;
    return (completed / 3) * 100;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!requirements.allowedFileTypes.includes(`.${fileExtension}`)) {
      return `File type .${fileExtension} not allowed. Allowed types: ${requirements.allowedFileTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > requirements.maxFileSize) {
      const maxSizeMB = requirements.maxFileSize / (1024 * 1024);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    // Check for forbidden patterns (like Excel files)
    const forbiddenTypes = ['.xlsx', '.xls', '.xlsm'];
    if (forbiddenTypes.includes(`.${fileExtension}`)) {
      return 'Excel files are strictly forbidden. Use CSV, TXT, or JSON formats only.';
    }

    return null;
  };

  const handleFileSelect = (info: any) => {
    const { fileList } = info;
    
    // Validate each file
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];

    for (const file of fileList) {
      if (file.originFileObj) {
        const error = validateFile(file.originFileObj);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      } else if (file.status === 'done') {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      Modal.error({
        title: 'File Validation Errors',
        content: (
          <div>
            <p>The following files were rejected:</p>
            <ul>
              {errors.map((error, index) => (
                <li key={index} className="text-red-600">{error}</li>
              ))}
            </ul>
          </div>
        )
      });
    }

    // Check file count limits
    if (validFiles.length > requirements.maxFiles) {
      message.error(`Maximum ${requirements.maxFiles} files allowed`);
      return;
    }

    setFiles(validFiles);
  };

  const handleRemoveFile = (file: UploadFile) => {
    setFiles(prev => prev.filter(f => f.uid !== file.uid));
  };

  const handleSubmit = async () => {
    if (!allValid) {
      Modal.error({
        title: 'Validation Required',
        content: 'Please complete all required sections before submitting.',
        className: 'font-[gilroy-regular]'
      });
      return;
    }

    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // First upload files
      const filesToUpload = files
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj as File);

      if (filesToUpload.length > 0) {
        const uploadResult = await onFileUpload(filesToUpload);
        if (!uploadResult.success) {
          Modal.error({
            title: 'File Upload Failed',
            content: uploadResult.error || 'Failed to upload files'
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
      }

      // Then submit the form data
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      await onStageComplete(formData, timeSpent);
    } catch (error) {
      Modal.error({
        title: 'Submission Failed',
        content: 'An error occurred during submission. Please try again.'
      });
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleTimeUp = () => {
    Modal.error({
      title: 'Time Expired',
      content: 'Stage 3 time limit exceeded. Assessment failed.',
      onOk: () => onAssessmentFailed('Stage 3 timeout - Time limit exceeded')
    });
  };

  const uploadProps: UploadProps = {
    multiple: true,
    fileList: files,
    beforeUpload: () => false, // Prevent auto upload
    onChange: handleFileSelect,
    showUploadList: false,
    accept: requirements.allowedFileTypes.join(',')
  };

  return (
    <div className="stage3-solution max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="!mb-2 font-[gilroy-regular] text-purple-800 flex items-center gap-2">
              <CloudUploadOutlined />
              Stage 3: Golden Solution & Rubric
            </Title>
            <Text className="font-[gilroy-regular] text-purple-600">
              Submit reference solutions and detailed evaluation rubrics • File validation enforced
            </Text>
          </div>
          <div className="w-64">
            <AssessmentTimer
              timeLimit={stage3Config.timeLimit}
              onTimeUp={handleTimeUp}
              submissionId={submissionId}
              stage="stage3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Text className="font-[gilroy-regular] text-sm text-purple-700">
              Completion Progress
            </Text>
            <Text className="font-[gilroy-regular] text-sm text-purple-700">
              {Math.round(getProgress())}% Complete
            </Text>
          </div>
          <Progress 
            percent={getProgress()} 
            strokeColor="#722ed1"
            showInfo={false}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* File Upload Section */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileOutlined />
                <span className="font-[gilroy-regular]">Golden Solution Files</span>
              </div>
              {isFilesValid ? (
                <CheckCircleOutlined className="text-green-500" />
              ) : (
                <ExclamationCircleOutlined className="text-red-500" />
              )}
            </div>
          }
          className="border-2 border-gray-200"
        >
          <div className="space-y-4">
            <Alert
              message="File Requirements"
              description={
                <div className="space-y-2 text-sm">
                  <div>• Files: {requirements.minFiles}-{requirements.maxFiles} files required</div>
                  <div>• Size: Maximum {(requirements.maxFileSize / (1024 * 1024)).toFixed(1)}MB per file</div>
                  <div>• Types: {requirements.allowedFileTypes.join(', ')}</div>
                  <div className="text-red-600 font-semibold">• FORBIDDEN: Excel files (.xlsx, .xls) - Use CSV/TXT/JSON only</div>
                </div>
              }
              type="info"
              showIcon
              className="font-[gilroy-regular]"
            />

            <Dragger {...uploadProps} className="border-dashed border-2 border-gray-300 hover:border-purple-400">
              <p className="ant-upload-drag-icon">
                <UploadOutlined className="text-4xl text-purple-500" />
              </p>
              <p className="ant-upload-text font-[gilroy-regular] text-lg">
                Click or drag files to upload
              </p>
              <p className="ant-upload-hint font-[gilroy-regular] text-gray-600">
                Upload your golden solution files. Multiple files supported.
              </p>
            </Dragger>

            {files.length > 0 && (
              <div className="mt-4">
                <Title level={5} className="!mb-3 font-[gilroy-regular]">
                  Selected Files ({files.length}/{requirements.maxFiles})
                </Title>
                <List
                  size="small"
                  dataSource={files}
                  renderItem={(file) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFile(file)}
                          size="small"
                        />
                      ]}
                    >
                      <div className="flex items-center gap-2">
                        <FileOutlined />
                        <div>
                          <Text className="font-[gilroy-regular]">{file.name}</Text>
                          <div className="text-xs text-gray-500">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  className="border rounded p-2 bg-gray-50"
                />
              </div>
            )}

            <div className="mt-2">
              <Text className={`text-sm font-[gilroy-regular] ${
                isFilesValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {isFilesValid ? 
                  '✓ File requirements satisfied' : 
                  `${files.length}/${requirements.minFiles} minimum files uploaded`
                }
              </Text>
            </div>
          </div>
        </Card>

        {/* Rubrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Positive Rubric */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="font-[gilroy-regular] text-green-700">Positive Evaluation Rubric</span>
                {isPositiveRubricValid ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <ExclamationCircleOutlined className="text-red-500" />
                )}
              </div>
            }
            className="border-2 border-green-200"
          >
            <div className="space-y-3">
              <TextArea
                placeholder="Define criteria for excellent responses: What makes a submission exceptional? Include specific quality indicators, completeness requirements, accuracy thresholds..."
                value={formData.positiveRubric}
                onChange={(e) => handleInputChange('positiveRubric', e.target.value)}
                rows={8}
                className="font-[gilroy-regular]"
              />
              
              <div className="flex justify-between">
                <Text className={`text-sm font-[gilroy-regular] ${
                  isPositiveRubricValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositiveRubricValid ? 
                    '✓ Meets minimum length' : 
                    `${formData.positiveRubric.length}/${requirements.positiveRubricMinLength} characters`
                  }
                </Text>
                <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                  Min {requirements.positiveRubricMinLength} chars
                </Text>
              </div>
            </div>
          </Card>

          {/* Negative Rubric */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="font-[gilroy-regular] text-red-700">Negative Evaluation Rubric</span>
                {isNegativeRubricValid ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <ExclamationCircleOutlined className="text-red-500" />
                )}
              </div>
            }
            className="border-2 border-red-200"
          >
            <div className="space-y-3">
              <TextArea
                placeholder="Define failure conditions and rejection criteria: What automatically disqualifies a submission? Include quality violations, incomplete work, accuracy failures..."
                value={formData.negativeRubric}
                onChange={(e) => handleInputChange('negativeRubric', e.target.value)}
                rows={8}
                className="font-[gilroy-regular]"
              />
              
              <div className="flex justify-between">
                <Text className={`text-sm font-[gilroy-regular] ${
                  isNegativeRubricValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isNegativeRubricValid ? 
                    '✓ Meets minimum length' : 
                    `${formData.negativeRubric.length}/${requirements.negativeRubricMinLength} characters`
                  }
                </Text>
                <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                  Min {requirements.negativeRubricMinLength} chars
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Button */}
        <Card className="text-center">
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!allValid}
            className="bg-purple-500 border-purple-500 hover:bg-purple-600 font-[gilroy-regular] font-bold px-12"
          >
            Submit Golden Solution & Rubrics
          </Button>
          
          {!allValid && (
            <div className="mt-3">
              <Text className="text-red-500 font-[gilroy-regular] text-sm">
                Complete all sections to enable submission
              </Text>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Submit Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <WarningOutlined className="text-orange-500" />
            <span className="font-[gilroy-regular]">Submit Stage 3 Final Solution</span>
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
            Review Submission
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={handleConfirmSubmit}
            className="bg-red-500 border-red-500 hover:bg-red-600 font-[gilroy-regular] font-bold"
          >
            {isUploading ? 'Uploading Files...' : 'Final Submit - No Changes Allowed'}
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="Critical Stage 3 Submission"
            description="Your files and rubrics will be permanently submitted and cannot be modified. Ensure all content meets the highest quality standards."
            type="error"
            showIcon
            className="font-[gilroy-regular]"
          />

          <div className="bg-gray-50 p-4 rounded space-y-2">
            <div className="flex justify-between">
              <Text className="font-[gilroy-regular]">Files to upload:</Text>
              <Text className="font-bold">{files.length} files</Text>
            </div>
            <div className="flex justify-between">
              <Text className="font-[gilroy-regular]">Positive rubric:</Text>
              <Text className="font-bold">{formData.positiveRubric.length} chars</Text>
            </div>
            <div className="flex justify-between">
              <Text className="font-[gilroy-regular]">Negative rubric:</Text>
              <Text className="font-bold">{formData.negativeRubric.length} chars</Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};