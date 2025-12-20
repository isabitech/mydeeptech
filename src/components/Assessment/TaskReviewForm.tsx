import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Rate,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Tag,
  Select,
  Modal,
  Avatar,
  Progress,
  Collapse,
  Timeline,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { multimediaAssessmentApi } from '../../service/axiosApi';
import { useReviewTask } from '../../hooks/QA/useReviewTask';
import { useSubmitFinalReview } from '../../hooks/QA/useSubmitFinalReview';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;

// Lazy load VPlayer for video playback
const VPlayer = lazy(() => import('../VideoPlayer/VPlayer'));

interface TaskReviewFormProps {
  submissionId: string;
  onComplete: (submissionId: string, decision: string) => void;
  onCancel: () => void;
}

export const TaskReviewForm: React.FC<TaskReviewFormProps> = ({
  submissionId,
  onComplete,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { reviewTask, loading: reviewingTask } = useReviewTask();
  const { submitFinalReview, loading: submittingReview } = useSubmitFinalReview();
  
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskReviews, setTaskReviews] = useState<{ [key: number]: any }>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [finalDecision, setFinalDecision] = useState<'Approve' | 'Reject' | 'Request Revision'>('Approve');
  const [privateNotes, setPrivateNotes] = useState('');

  // Load submission data
  useEffect(() => {
    loadSubmissionData();
  }, [submissionId]);

  const loadSubmissionData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await multimediaAssessmentApi.getSubmissionForReview(submissionId);
      
      if (response.data?.success) {
        setSubmissionData(response.data.data.submission);
        
        // Initialize existing reviews if any
        if (response.data.data.submission.tasks) {
          const existingReviews: { [key: number]: any } = {};
          response.data.data.submission.tasks.forEach((task: any, index: number) => {
            if (task.qaReview) {
              existingReviews[index] = task.qaReview;
            }
          });
          setTaskReviews(existingReviews);
        }
      }
    } catch (error) {
      console.error('Failed to load submission data:', error);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  // Handle individual task review
  const handleTaskReview = useCallback(async (taskIndex: number, reviewData: any) => {
    try {
      const result = await reviewTask({
        submissionId,
        taskIndex,
        ...reviewData,
      });

      if (result.success) {
        setTaskReviews(prev => ({
          ...prev,
          [taskIndex]: {
            ...reviewData,
            reviewedAt: new Date().toISOString(),
          },
        }));
        
        // Auto-advance to next task if not the last one
        if (taskIndex < submissionData.tasks.length - 1) {
          setCurrentTaskIndex(taskIndex + 1);
        }
      }
    } catch (error) {
      console.error('Failed to submit task review:', error);
    }
  }, [submissionId, reviewTask, submissionData]);

  // Handle final review submission
  const handleFinalSubmission = useCallback(async () => {
    // Validate all tasks are reviewed
    const unreviewed = submissionData.tasks.filter((_: any, index: number) => !taskReviews[index]);
    
    if (unreviewed.length > 0) {
      Modal.warning({
        title: 'Incomplete Review',
        content: `Please review all ${submissionData.tasks.length} tasks before submitting final decision.`,
      });
      return;
    }

    // Calculate overall score
    const taskScores = Object.values(taskReviews).map((review: any) => review.score);
    const overallScore = taskScores.reduce((sum, score) => sum + score, 0) / taskScores.length;

    try {
      const result = await submitFinalReview({
        submissionId,
        overallScore,
        overallFeedback,
        decision: finalDecision,
        privateNotes,
      });

      if (result.success) {
        onComplete(submissionId, finalDecision);
      }
    } catch (error) {
      console.error('Failed to submit final review:', error);
    }
  }, [submissionData, taskReviews, overallFeedback, finalDecision, privateNotes, submitFinalReview, onComplete, submissionId]);

  // Calculate review progress
  const reviewProgress = submissionData ? 
    (Object.keys(taskReviews).length / submissionData.tasks.length) * 100 : 0;

  const currentTask = submissionData?.tasks?.[currentTaskIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-lg mb-4">Loading Submission...</div>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <Alert
        message="Unable to Load Submission"
        description="The submission data could not be loaded. Please try again."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with submission overview */}
      <Card>
        <Row gutter={[24, 16]}>
          <Col xs={24} lg={16}>
            <div className="flex items-start gap-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div className="flex-1">
                <Title level={4} className="!mb-2">
                  {submissionData.userId.name}
                </Title>
                <Text type="secondary">{submissionData.userId.email}</Text>
                <div className="mt-2">
                  <Tag color="blue">{submissionData.assessmentId.title}</Tag>
                  <Tag color="green">
                    {submissionData.metrics.tasksCompleted}/{submissionData.tasks.length} Tasks
                  </Tag>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={24} lg={8}>
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between">
                <Text>Review Progress</Text>
                <Text>{reviewProgress.toFixed(0)}%</Text>
              </div>
              <Progress percent={reviewProgress} strokeColor="#52c41a" />
              
              <div className="flex items-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {submissionData.metrics.averageScore.toFixed(1)}
                  </div>
                  <Text type="secondary">Avg Score</Text>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {Math.floor(submissionData.metrics.completionTime / 60000)}m
                  </div>
                  <Text type="secondary">Duration</Text>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Task Navigation */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={5}>Tasks Review</Title>
          <Text type="secondary">
            {Object.keys(taskReviews).length} of {submissionData.tasks.length} reviewed
          </Text>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {submissionData.tasks.map((task: any, index: number) => (
            <Button
              key={task.taskNumber}
              type={index === currentTaskIndex ? "primary" : taskReviews[index] ? "default" : "dashed"}
              onClick={() => setCurrentTaskIndex(index)}
              icon={taskReviews[index] ? <CheckCircleOutlined /> : null}
              className={taskReviews[index] ? "border-green-500 text-green-600" : ""}
            >
              Task {task.taskNumber}
            </Button>
          ))}
        </div>
      </Card>

      {/* Current Task Review */}
      {currentTask && (
        <motion.div
          key={currentTaskIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card title={`Task ${currentTask.taskNumber} Review`}>
            <Row gutter={[24, 24]}>
              {/* Video and Conversation Display */}
              <Col xs={24} lg={14}>
                <Space direction="vertical" className="w-full">
                  {/* Video Reel */}
                  {currentTask.selectedReels?.[0] && (
                    <Card size="small" title="Selected Video Reel">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                        <Suspense fallback={
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            Loading video...
                          </div>
                        }>
                          <VPlayer
                            playerRef={React.createRef()}
                            url={currentTask.selectedReels[0].youtubeUrl}
                            className="w-full h-full"
                            controls
                          />
                        </Suspense>
                      </div>
                    </Card>
                  )}

                  {/* Conversation Display */}
                  <Card size="small" title="Created Conversation">
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {currentTask.conversation.turns.map((turn: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            turn.speaker === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="text-sm font-medium mb-1">
                              {turn.speaker === 'user' ? 'User' : 'Assistant'}
                            </div>
                            <div>{turn.message}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {new Date(turn.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <Divider />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Text strong>Conversation Length:</Text>
                        <div>{currentTask.conversation.turns.length} turns</div>
                      </div>
                      <div>
                        <Text strong>Time Spent:</Text>
                        <div>{Math.floor(currentTask.timeSpent / 60000)} minutes</div>
                      </div>
                    </div>
                  </Card>
                </Space>
              </Col>

              {/* Review Form */}
              <Col xs={24} lg={10}>
                <Card size="small" title="Review Assessment">
                  <Form
                    layout="vertical"
                    onFinish={(values) => handleTaskReview(currentTaskIndex, values)}
                    initialValues={taskReviews[currentTaskIndex]}
                  >
                    <Form.Item
                      label="Overall Score"
                      name="score"
                      rules={[{ required: true, message: 'Please provide a score' }]}
                    >
                      <Rate count={10} allowHalf />
                    </Form.Item>

                    <Form.Item
                      label="Quality Rating"
                      name="qualityRating"
                      rules={[{ required: true, message: 'Please select quality rating' }]}
                    >
                      <Select placeholder="Select quality rating">
                        <Option value="Excellent">Excellent</Option>
                        <Option value="Good">Good</Option>
                        <Option value="Satisfactory">Satisfactory</Option>
                        <Option value="Needs Improvement">Needs Improvement</Option>
                        <Option value="Poor">Poor</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Detailed Feedback"
                      name="feedback"
                      rules={[{ required: true, message: 'Please provide feedback' }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Provide detailed feedback on conversation quality, creativity, technical accuracy, etc."
                      />
                    </Form.Item>

                    <Form.Item
                      label="Review Notes (Optional)"
                      name="notes"
                    >
                      <TextArea
                        rows={2}
                        placeholder="Additional notes for internal use"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={reviewingTask}
                        block
                        disabled={!!taskReviews[currentTaskIndex]}
                      >
                        {taskReviews[currentTaskIndex] ? 'Task Reviewed' : 'Submit Task Review'}
                      </Button>
                    </Form.Item>
                  </Form>

                  {taskReviews[currentTaskIndex] && (
                    <Alert
                      message="Task Reviewed"
                      description={`Score: ${taskReviews[currentTaskIndex].score}/10 • ${taskReviews[currentTaskIndex].qualityRating}`}
                      type="success"
                      showIcon
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </Card>
        </motion.div>
      )}

      {/* Final Review Section */}
      {reviewProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card title="Final Review Decision">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" className="w-full">
                  <div>
                    <Text strong>Overall Feedback</Text>
                    <TextArea
                      rows={4}
                      value={overallFeedback}
                      onChange={(e) => setOverallFeedback(e.target.value)}
                      placeholder="Provide comprehensive feedback on the overall assessment performance..."
                    />
                  </div>

                  <div>
                    <Text strong>Private Notes (Internal)</Text>
                    <TextArea
                      rows={2}
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                      placeholder="Internal notes for team reference..."
                    />
                  </div>
                </Space>
              </Col>

              <Col xs={24} lg={8}>
                <Space direction="vertical" className="w-full">
                  <div>
                    <Text strong>Final Decision</Text>
                    <Select
                      value={finalDecision}
                      onChange={setFinalDecision}
                      className="w-full mt-2"
                      size="large"
                    >
                      <Option value="Approve">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Approve
                      </Option>
                      <Option value="Request Revision">
                        <ExclamationCircleOutlined className="text-orange-500 mr-2" />
                        Request Revision
                      </Option>
                      <Option value="Reject">
                        <ExclamationCircleOutlined className="text-red-500 mr-2" />
                        Reject
                      </Option>
                    </Select>
                  </div>

                  <Divider />

                  <div className="space-y-4">
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleFinalSubmission}
                      loading={submittingReview}
                      disabled={!overallFeedback.trim()}
                    >
                      Submit Final Review
                    </Button>
                    
                    <Button 
                      size="large"
                      block
                      onClick={onCancel}
                    >
                      Cancel Review
                    </Button>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </motion.div>
      )}
    </div>
  );
};