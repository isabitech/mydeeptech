import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
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
  Empty,
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
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { useReviewTask } from '../../hooks/QA/useReviewTask';
import { useSubmitFinalReview } from '../../hooks/QA/useSubmitFinalReview';
import { multimediaAssessmentApi } from '../../service/axiosApi';
import { QAReviewMultimediaResponseType, Submission, Turn } from './QAReviews/qa-review-multimedia-response-type';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;

// Lazy load VPlayer for video playback
const VPlayer = lazy(() => import('../VideoPlayer/VPlayer'));

interface TaskReviewFormProps {
  submissionId: string;
  submission?: Submission | null;
  onComplete: (submissionId: string, decision: string) => void;
  onCancel: () => void;
}

export const TaskReviewForm: React.FC<TaskReviewFormProps> = ({
  submissionId,
  submission,
  onComplete,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { reviewTask, loading: reviewingTask } = useReviewTask();
  const { submitFinalReview, loading: submittingReview } = useSubmitFinalReview();
  
  // Local state for submission data
  const [loading, setLoading] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<Submission | null>(null);
  const [qaReview, setQaReview] = useState<any>(null);
  const [overallScore, setOverallScore] = useState(0);
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskReviews, setTaskReviews] = useState<{ [key: number]: any }>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [finalDecision, setFinalDecision] = useState<'Approve' | 'Reject' | 'Request Revision'>('Approve');
  const [privateNotes, setPrivateNotes] = useState('');

 
  useEffect(() => {
    console.log("submission data", submission);
    
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await multimediaAssessmentApi.getSubmissionForReview(submissionId);

        console.log("API response", response);
        
        if (response?.success && response?.data) {
          const { submission: submissionData, qaReview: reviewData, isReviewed } = response.data;
          
          // Set submission details
          setSubmissionDetails(submissionData);
          setQaReview(reviewData);
          
          console.log("Setting submission details", submissionData);
          
          // Initialize existing reviews if any
          if (submissionData.tasks) {
            console.log("tasks present");
            const existingReviews: { [key: number]: any } = {};
            submissionData.tasks.forEach((task: any, index: number) => {
              if (task.qaScore && (task.qaScore.taskTotal !== null || task.qaScore.individualFeedback)) {
                console.log("task reviews", task.qaScore);
                existingReviews[index] = {
                  score: task.qaScore.taskTotal,
                  feedback: task.qaScore.individualFeedback,
                  qualityRating: task.qaScore.qualityRating,
                  notes: task.qaScore.notes,
                  conversationQuality: task.qaScore.conversationQuality,
                  videoSegmentation: task.qaScore.videoSegmentation,
                  promptRelevance: task.qaScore.promptRelevance,
                  creativityAndCoherence: task.qaScore.creativityAndCoherence,
                  technicalExecution: task.qaScore.technicalExecution
                };
              }
            });
            setTaskReviews(existingReviews);
          }
          
          // Set overall review data if already reviewed
          if (reviewData) {
            setOverallFeedback(reviewData.overallFeedback || '');
            setFinalDecision(reviewData.decision || 'Approve');
            setPrivateNotes(reviewData.privateNotes || '');
          }
        } else {
          console.error('API call failed:', response?.data?.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Failed to load submission data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (submission?._id === submissionId) {
      // If we have the submission data, still load QA review metadata
      loadData();
    } else if (!submission) {
      // Load everything if no submission provided
      loadData();
    }
  }, [submission, submissionId]);

   // Load submission data (or use provided pre-fetched submission)
  // useEffect(() => {
  //   if (sourceSubmission) {
  //     // If parent passed the full submission, seed submissionDetails state
  //     // We'll still call loadSubmissionData to ensure QA review metadata is fetched
  //     // but prefer the provided submission for rendering.
  //     (async () => {
  //       try {
  //         const result = await getSubmissionDetails(submissionId);
  //         if (result.success && result.data) {
  //           // handled by hook state
  //         }
  //       } catch (err) {
  //         console.error('Error fetching submission details:', err);
  //       }
  //     })();
  //   } else {
  //     loadSubmissionData();
  //   }
  // }, [submissionId, sourceSubmission, getSubmissionDetails, loadSubmissionData]);

  // Handle individual task review
  const handleTaskReview = useCallback(async (taskIndex: number, reviewData: any) => {
    try {
      const result = await reviewTask({
        submissionId,
        taskIndex,
        ...reviewData,
      });

      if (result.success) {
        toast.success('Task review submitted successfully');
        setTaskReviews(prev => ({
          ...prev,
          [taskIndex]: {
            ...reviewData,
            reviewedAt: new Date().toISOString(),
          },
        }));
        
        // Auto-advance to next task if not the last one
        if (taskIndex < ((submissionDetails)?.tasks?.length || 0) - 1) {
          setCurrentTaskIndex(taskIndex + 1);
        }
      }
    } catch (error) {
      console.error('Failed to submit task review:', error);
    }
  }, [submissionId, reviewTask, submission, submissionDetails]);

  // Handle final review submission
  const handleFinalSubmission = useCallback(async () => {
    if (!submissionDetails) return;
    
    // Validate all tasks are reviewed
    const unreviewed = submissionDetails.tasks?.filter((_: any, index: number) => !taskReviews[index]) || [];
    
    if (unreviewed.length > 0) {
      Modal.warning({
        title: 'Incomplete Review',
        content: `Please review all ${submissionDetails.tasks?.length || 0} tasks before submitting final decision.`,
      });
      return;
    }

    // Calculate overall score
    // const taskScores = Object.values(taskReviews).map((review: any) => review.score);
    // const overallScore = taskScores.reduce((sum, score) => sum + score, 0) / taskScores.length;

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
  }, [submission, submissionDetails, taskReviews, overallFeedback, finalDecision, privateNotes, submitFinalReview, onComplete, submissionId]);

  // Use submissionDetails for task data as it contains the correct structure
  // Fall back to submission prop for other fields if needed
  const sourceSubmission = submissionDetails || submission;

  console.log("sourceSubmission:", sourceSubmission);
  console.log("submissionDetails.tasks:", submissionDetails?.tasks);
  console.log("submissionDetails:", submissionDetails);
  console.log("submissionDetails tasks:", submissionDetails?.tasks);
  console.log("submission prop:", submission);

  const reviewProgress = submissionDetails?.tasks?.length ? 
    (Object.keys(taskReviews).length / submissionDetails.tasks.length) * 100 : 0;

  const currentTask = submissionDetails?.tasks?.[currentTaskIndex];

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

  if (!sourceSubmission) {
    return (
      <Alert
        message="Unable to Load Submission"
        description="The submission data could not be loaded. Please try again."
        type="error"
        showIcon
      />
    );
  }

  // Log tasks for debugging
  if (submissionDetails?.tasks && submissionDetails.tasks.length > 0) {
    console.log('Found tasks:', submissionDetails.tasks);
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
                  {sourceSubmission?.annotatorId?.fullName||'Unknown User'}
                </Title>
                <Text type="secondary">{sourceSubmission?.annotatorId?.email || ''}</Text>
                <div className="mt-2">
                    <Tag color="blue">{sourceSubmission?.assessmentId?.title  || 'Assessment'}</Tag>
                    <Tag color="green">
                      {sourceSubmission?.metrics?.tasksCompleted ?? submissionDetails?.tasks?.length ?? 0}/{submissionDetails?.tasks?.length ?? 0} Tasks
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
                    {sourceSubmission?.metrics?.averageScore?.toFixed(1) || '0.0'}
                  </div>
                  <Text type="secondary">Avg Score</Text>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {Math.floor((sourceSubmission?.totalTimeSpent || 0) / 1000)}s
                  </div>
                  <Text type="secondary">Duration</Text>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      

      {/* Submission Statistics */}
      <Card title="Submission Statistics" className="mb-6">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {submissionDetails?.tasks?.length || 0}
              </div>
              <Text type="secondary">Total Tasks</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {submissionDetails?.tasks?.filter((task: any) => task.isCompleted).length || 0}
              </div>
              <Text type="secondary">Completed Tasks</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {submissionDetails?.tasks?.reduce((total: number, task: any) => total + (task.conversation?.turns?.length || 0), 0) || 0}
              </div>
              <Text type="secondary">Total Conversations Created</Text>
            </Card>
          </Col>
        </Row>
        
       
      </Card>

      {/* Task Review Carousel */}
      {submissionDetails?.tasks && submissionDetails.tasks.length > 0 ? (
        <Card>
          {/* Carousel Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Title level={4} className="!mb-0">Task Review</Title>
              <Tag color="blue">
                Task {currentTaskIndex + 1} of {submissionDetails.tasks.length}
              </Tag>
              <Tag color={taskReviews[currentTaskIndex] ? 'green' : 'orange'}>
                {taskReviews[currentTaskIndex] ? 'Reviewed' : 'Pending Review'}
              </Tag>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <Button
                type="default"
                icon={<LeftOutlined />}
                onClick={() => setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))}
                disabled={currentTaskIndex === 0}
              >
                Previous
              </Button>
              <Button
                type="default"
                icon={<RightOutlined />}
                iconPosition="end"
                onClick={() => setCurrentTaskIndex(Math.min(submissionDetails.tasks.length - 1, currentTaskIndex + 1))}
                disabled={currentTaskIndex === submissionDetails.tasks.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <Text type="secondary">Review Progress</Text>
              <Text type="secondary">{Object.keys(taskReviews).length}/{submissionDetails.tasks.length} completed</Text>
            </div>
            <Progress 
              percent={(Object.keys(taskReviews).length / submissionDetails.tasks.length) * 100}
              strokeColor="#52c41a"
              className="mb-4"
            />
            
            {/* Task Navigation Dots */}
            <div className="flex justify-center gap-2">
              {submissionDetails.tasks.map((_, index) => (
                <Button
                  key={index}
                  type={index === currentTaskIndex ? 'primary' : 'default'}
                  size="small"
                  shape="circle"
                  onClick={() => setCurrentTaskIndex(index)}
                  className={`w-8 h-8 ${taskReviews[index] ? 'border-green-500 bg-green-50' : ''}`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>

  
          
        </Card>
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">No tasks available for review</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  This submission does not contain any tasks to review.
                </Text>
              </div>
            }
          />
        </Card>
      )}

     

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
               

                  {/* Conversation Display */}
                  <Card size="small" title="Created Conversation Analysis">
                    {/* Conversation Metrics */}
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                      <Row gutter={[16, 8]}>
                        <Col xs={12} sm={6}>
                          <Text strong className="text-xs">Total Turns:</Text>
                          <div className="text-lg font-bold text-blue-600">{currentTask.conversation.turns.length}</div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text strong className="text-xs">Avg Response Length:</Text>
                          <div className="text-lg font-bold text-green-600">
                            {Math.round(currentTask.conversation.turns.reduce((acc: number, turn: Turn) => 
                              acc + (turn.aiResponse.responseText?.length || 0), 0) / currentTask.conversation.turns.length)}
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text strong className="text-xs">Video Segments:</Text>
                          <div className="text-lg font-bold text-purple-600">
                            {currentTask.conversation.turns.filter((turn: Turn) => turn.aiResponse.videoSegment).length}
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text strong className="text-xs">Quality Score:</Text>
                          <div className="text-lg font-bold text-orange-600">
                            {taskReviews[currentTaskIndex]?.score || 'N/A'}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {currentTask.conversation.turns.map((turn: Turn, index: number) => (
                        <div key={turn._id || index} className="space-y-3">
                          {/* Turn Header */}
                          <div className="text-xs text-gray-500 font-medium border-b pb-1">
                            Turn {turn.turnNumber} • {new Date(turn.timestamp).toLocaleTimeString()}
                          </div>
                          
                          {/* User Prompt */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex justify-end"
                          >
                            <div className="max-w-[80%] p-3 rounded-lg bg-blue-500 text-white">
                              <div className="text-sm font-medium mb-1">User Prompt <UserOutlined /></div>
                              <div>{turn.userPrompt}</div>
                              <div className="text-xs opacity-75 mt-1">
                                Length: {turn.userPrompt?.length || 0} chars
                              </div>
                            </div>
                          </motion.div>
                          
                          {/* AI Response */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.05 }}
                            className="flex justify-start"
                          >
                            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                              <div className="text-sm font-medium mb-1 flex items-center gap-1">AI Response <Bot /></div>
                              <div className="mb-2">{turn.aiResponse.responseText}</div>
                              
                              {turn.aiResponse.videoSegment && (
                                <div className="mt-2 p-3 bg-gray-50 rounded border">
                                  <div className="font-medium mb-2 text-sm">Video Segment Analysis:</div>
                                  <div className="text-xs space-y-1 mb-2">
                                    <div><strong>Time:</strong> {turn.aiResponse.videoSegment.startTime?.toFixed(2)}s - {turn.aiResponse.videoSegment.endTime?.toFixed(2)}s</div>
                                    <div><strong>Duration:</strong> {(turn.aiResponse.videoSegment.endTime - turn.aiResponse.videoSegment.startTime)?.toFixed(2)}s</div>
                                    <div><strong>Content:</strong> {turn.aiResponse.videoSegment.content}</div>
                                  </div>
                                  {turn.aiResponse.videoSegment.segmentUrl && (
                                    <div className="bg-black rounded overflow-hidden">
                                      <ReactPlayer
                                        url={turn.aiResponse.videoSegment.segmentUrl}
                                        width="100%"
                                        height="120px"
                                        controls={true}
                                        config={{
                                          youtube: {
                                            playerVars: {
                                              start: Math.floor(turn.aiResponse.videoSegment.startTime || 0),
                                              end: Math.floor(turn.aiResponse.videoSegment.endTime || 0)
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="text-xs opacity-75 mt-1 flex justify-between">
                                <span>Length: {turn.aiResponse.responseText?.length || 0} chars</span>
                                <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
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
                        <div>{Math.floor((currentTask.timeSpent || 0) / 1000)} seconds</div>
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
                        <Option value="Fair">Fair</Option>
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
            {/* Task Submission Details */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <Title level={5} className="!mb-3">Task Submission Details</Title>
              <Row gutter={[16, 8]}>
                <Col xs={12} sm={6}>
                  <Text strong className="text-xs">Task Number:</Text>
                  <div className="text-sm">{currentTask.taskNumber}</div>
                </Col>
                <Col xs={12} sm={6}>
                  <Text strong className="text-xs">Completion Status:</Text>
                  <div className="text-sm">
                    <Tag color={currentTask.isCompleted ? 'green' : 'orange'}>
                      {currentTask.isCompleted ? 'Completed' : 'In Progress'}
                    </Tag>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <Text strong className="text-xs">Time Spent:</Text>
                  <div className="text-sm">{Math.floor((currentTask.timeSpent || 0) / 1000)}s</div>
                </Col>
                <Col xs={12} sm={6}>
                  <Text strong className="text-xs">Submitted At:</Text>
                  <div className="md:text-sm text-xs">{new Date(currentTask.submittedAt).toLocaleTimeString()}</div>
                </Col>
              </Row>
              
              {/* QA Score Status */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <Text strong className="text-xs">QA Review Status:</Text>
                <div className="mt-1">
                  {currentTask.qaScore && (currentTask.qaScore.taskTotal !== null || currentTask.qaScore.individualFeedback) ? (
                    <Tag color="green">Already Reviewed</Tag>
                  ) : (
                    <Tag color="red">Pending Review</Tag>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {submissionDetails.tasks.map((_, index) => (
                <Button
                  key={index}
                  type={index === currentTaskIndex ? 'primary' : 'default'}
                  size="small"
                  shape="circle"
                  onClick={() => setCurrentTaskIndex(index)}
                  className={`w-8 h-8 ${taskReviews[index] ? 'border-green-500 bg-green-50' : ''}`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
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
                    <Text strong>Overall Score</Text>
                    <Select
                      value={overallScore}
                      onChange={setOverallScore}
                      className="w-full mt-2"
                      size="large"
                      placeholder="Select overall score"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                        <Option key={score} value={score}>
                          {score}/10
                        </Option>
                      ))}
                    </Select>
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