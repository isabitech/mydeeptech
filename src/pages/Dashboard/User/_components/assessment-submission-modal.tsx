import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, message, DatePicker, TimePicker, Checkbox, Radio, Row, Col } from 'antd';
import { LinkOutlined, UserOutlined, MailOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useUserInfoActions, useUserInfoStates } from '../../../../store/useAuthStore';
import dayjs from 'dayjs';
import assessmentMutationService from '../../../../services/assessement-service/assessment-mutation';
import ErrorMessage from '../../../../lib/error-message';
import { AssessmentType } from './assessments-modal';
import authService from '../../../../services/authentication/auth-query';
import { formSubmitPayload } from './formSubmitPayload';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface AssessmentSubmissionModalProps {
  open: boolean;
  onCloseModal: () => void;
  assessmentType: AssessmentType;
  onBackToInstructions?: () => void; // Callback to return to main assessments modal
  onSuccess?: () => void;
}

const AssessmentSubmissionModal: React.FC<AssessmentSubmissionModalProps> = ({
  open,
  onCloseModal,
  assessmentType,
  onBackToInstructions,
}) => {

  const [form] = Form.useForm();
  const { userInfo } = useUserInfoStates();
  const { setIsAssessmentSubmitted } = useUserInfoActions();
  const { submitReviewMutation, isSubmitReviewLoading } = assessmentMutationService.useSubmitReviewMutation();
  const { userProfileRefetch } = authService.useProfile(); // Refetch user profile to get latest info after submission

  const handleCancel = () => {
    if (isSubmitReviewLoading) {
      message.warning("Please wait for the submission to complete before closing.");
      return;
    }
    form.resetFields();
    
    // If onBackToInstructions is provided, go back to main assessments modal
    // Otherwise, just close this modal
    if (onBackToInstructions) {
      onBackToInstructions();
    } else {
      onCloseModal();
    }
  };

  const handleSubmit = async (values: any) => {

      const payload = formSubmitPayload(values);

      submitReviewMutation.mutate(payload, {
          onSuccess: async () => {
            await setIsAssessmentSubmitted(); // Manually update local state to mark assessment as submitted
            await userProfileRefetch(); // Refetch user profile to get latest info after submission
            message.success(`Your submission for ${assessmentType} was successful!`);
            form.resetFields();
            onCloseModal();
          },
          onError: (error) => {
            message.error(ErrorMessage(error));
          }
        })
  };


  useEffect(() => {
    if (open && userInfo) {
      form.setFieldsValue({
        fullName: userInfo.fullName,
        emailAddress: userInfo.email,
        dateOfSubmission: dayjs(),
      });
    }
  }, [open, userInfo, form]);

  return (
    <Modal
      open={open}
      onCancel={onCloseModal}
      footer={null}
      width={750}
      centered
      closable={!isSubmitReviewLoading}
      maskClosable={!isSubmitReviewLoading}
      title={null}
      styles={{
        content: {
          padding: 0,
          borderRadius: '12px',
          overflow: 'hidden',
        },
      }}
    >
      <div className="h-3 bg-[#673ab7] rounded-top-lg mb-6" />
      <div className="px-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <Title level={2} className="mt-2 mb-2 font-bold">
          Assessment Submission Form
        </Title>
        <Paragraph className="text-sm text-gray-500 mb-8 border-b pb-4">
          Please provide accurate details of your test results and submission status.
          Fields marked with <span className="text-red-500">*</span> are required.
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="assessment-form"
          initialValues={{
            instructionClarityRating: 7,
            encounteredIssues: 'No',
            confirmStatus: ['english', 'skill']
          }}
        >
          {/* Identity Section */}
          <div
            tabIndex={-1}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={<span className="font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></span>}
                  name="fullName"
                  rules={[
                    { required: true, message: 'Please enter your full name' },
                    { min: 2, message: 'Minimum 2 characters' },
                    { max: 150, message: 'Maximum 150 characters' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="rounded-md border-gray-300"
                    placeholder="Your Name"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></span>}
                  name="emailAddress"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                  extra={<span className="text-[10px] text-gray-400">Must match the address provided during application</span>}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    className="rounded-md border-gray-300"
                    placeholder="example@mydeeptech.ng"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Timing Section */}
          <div 
            tabIndex={-1}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={<span className="font-semibold text-gray-700">Date of Test Submission <span className="text-red-500">*</span></span>}
                  name="dateOfSubmission"
                  rules={[{ required: true, message: 'Select the date' }]}
                >
                  <DatePicker
                    className="w-full rounded-md"
                    format="YYYY-MM-DD"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="font-semibold text-gray-700">Approximate Time of Submission <span className="text-red-500">*</span></span>}
                  name="timeOfSubmission"
                  rules={[{ required: true, message: 'Select the time' }]}
                >
                  <TimePicker
                    className="w-full rounded-md"
                    format="hh:mm A"
                    use12Hours
                    suffixIcon={<ClockCircleOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Confirmation Checklist */}
          <div
            tabIndex={-1}
          >
            <Form.Item
              label={<span className="font-semibold text-gray-700">Status Confirmation <span className="text-red-500">*</span></span>}
              name="confirmStatus"
              rules={[
                { 
                  validator: (_, value) => {
                    if (value && value.length === 2) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('You must confirm both tests have been uploaded'));
                  }
                }
              ]}
            >
              <Checkbox.Group className="w-full flex flex-col gap-4">
                <div className="flex items-start gap-2 p-3 bg-purple-100/20 rounded-md border border-purple-100">
                  <Checkbox value="english">
                    <span className="text-xs leading-5 text-gray-600">
                      English Test Screenshot and Screen Recording has been uploaded to the shared folder and set as viewable by anyone with the link.
                    </span>
                  </Checkbox>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-100/20 rounded-md border border-blue-100">
                  <Checkbox value="skill">
                    <span className="text-xs leading-5 text-gray-600">
                      Problem Solving Test Screenshot and Screen Recording has been uploaded to the shared folder and set as viewable by anyone with the link.
                    </span>
                  </Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>
          </div>

          {/* Scores Section */}
          <div
            tabIndex={-1}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={<span className="font-semibold text-gray-700">English Test Score <span className="text-red-500">*</span></span>}
                  name="englishTestScore"
                  rules={[
                    { required: true, message: 'Required' },
                    { max: 20, message: 'Max 20 characters' }
                  ]}
                >
                  <Input placeholder="e.g. 18" className="rounded-md" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="font-semibold text-gray-700">Problem Solving Score <span className="text-red-500">*</span></span>}
                  name="problemSolvingScore"
                  rules={[
                    { required: true, message: 'Required' },
                    { max: 20, message: 'Max 20 characters' }
                  ]}
                >
                  <Input placeholder="e.g. 15" className="rounded-md" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Link Section */}
          <div
            tabIndex={-1}
          >
            <Form.Item
              label={<span className="font-semibold">Google Drive Link to Recordings <span className="text-red-500">*</span></span>}
              name="googleDriveLink"
              rules={[
                { required: true, message: 'Required' },
                { type: 'url', message: 'Enter a valid drive link' },
                { max: 500, message: 'Maximum 500 characters' }
              ]}
              extra={<span className="text-xs text-purple-700">Ensure link sharing is properly configured</span>}
            >
              <Input
                prefix={<LinkOutlined className="text-purple-600" />}
                placeholder="https://drive.google.com/..."
                className="border-purple-200 focus:border-[#4c1d95] rounded-md"
              />
            </Form.Item>
          </div>

          {/* Issues Section */}
          <div
            tabIndex={-1}
          >
            <Form.Item
              label={<span className="font-semibold text-gray-700 mt-2">Did you encounter any technical issues while completing the tests?</span>}
              name="encounteredIssues"
            >
              <Radio.Group>
                <Radio value="Yes">Yes, I encountered issues.</Radio>
                <Radio value="No">No, the process was smooth.</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.encounteredIssues !== currentValues.encounteredIssues}
            >
              {({ getFieldValue }) => 
                getFieldValue('encounteredIssues') === 'Yes' ? (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Form.Item
                      label={<span className="text-sm font-semibold text-gray-700">Please describe them briefly: <span className="text-red-500">*</span></span>}
                      name="issueDescription"
                      rules={[
                        { required: true, message: 'Please describe the issues you encountered' },
                        { max: 1000, message: 'Maximum 1000 characters' }
                      ]}
                    >
                      <TextArea rows={3} placeholder="Describe your experience here..." className="rounded-md border-gray-300" />
                    </Form.Item>
                  </div>
                ) : null
              }
            </Form.Item>
          </div>

          {/* Quality Section */}
          <div
            tabIndex={-1}
          >
            <Form.Item
              label={
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">How would you rate the clarity of the instructions?</span>
                  <span className="text-[10px] text-gray-400 mt-1">(1 = Very Unclear, 7 = Very Clear)</span>
                </div>
              }
              name="instructionClarityRating"
              rules={[{ type: 'number', min: 1, max: 7, message: 'Rating must be between 1 and 7' }]}
            >
              <Radio.Group className="w-full justify-between flex mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <div key={num} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">{num}</span>
                    <Radio value={num} className="m-0" />
                  </div>
                ))}
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white py-4 flex justify-end gap-4 border-t border-gray-200 italic">
            <Button
              onClick={handleCancel}
              disabled={isSubmitReviewLoading}
              className="rounded-md px-6"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitReviewLoading}
              className="bg-[#673ab7] hover:bg-[#5e35b1] border-none rounded-md px-8 h-10"
            >
              Submit Assessment
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AssessmentSubmissionModal;
