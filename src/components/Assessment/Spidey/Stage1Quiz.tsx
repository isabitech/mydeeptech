import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Typography, Progress, Alert, Space, Modal } from 'antd';
import { 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { AssessmentTimer } from './AssessmentTimer';
import { QuizQuestion, Stage1Config } from '../../../hooks/Assessment/useSpideyAssessment';

const { Title, Text } = Typography;

interface Stage1QuizProps {
  submissionId: string;
  stage1Config: Stage1Config;
  onStageComplete: (responses: any, timeSpent: number) => void;
  onAssessmentFailed: (reason: string) => void;
}

export const Stage1Quiz: React.FC<Stage1QuizProps> = ({
  submissionId,
  stage1Config,
  onStageComplete,
  onAssessmentFailed
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, Date>>({
    0: new Date()
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQuestion = stage1Config.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === stage1Config.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / stage1Config.questions.length) * 100;

  // Track time spent on each question
  useEffect(() => {
    if (!questionStartTimes[currentQuestionIndex]) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestionIndex]: new Date()
      }));
    }
  }, [currentQuestionIndex, questionStartTimes]);

  const handleAnswerChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.questionId]: value
    }));
  };

  const handleNext = () => {
    if (!responses[currentQuestion.questionId]) {
      Modal.error({
        title: 'Answer Required',
        content: 'You must select an answer before proceeding.',
        className: 'font-[gilroy-regular]'
      });
      return;
    }

    if (isLastQuestion) {
      setShowSubmitModal(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    
    const formattedResponses = stage1Config.questions.map(question => ({
      questionId: question.questionId,
      userAnswer: responses[question.questionId] || ''
    }));

    onStageComplete(formattedResponses, timeSpent);
  };

  const handleTimeUp = () => {
    Modal.error({
      title: 'Time Expired',
      content: 'Stage 1 time limit exceeded. Assessment failed.',
      onOk: () => onAssessmentFailed('Stage 1 timeout - Time limit exceeded')
    });
  };

  const getAnsweredCount = () => {
    return Object.keys(responses).length;
  };

  const getUnansweredQuestions = () => {
    return stage1Config.questions
      .filter(q => !responses[q.questionId])
      .map(q => q.questionId);
  };

  return (
    <div className="stage1-quiz max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={3} className="!mb-2 font-[gilroy-regular] text-blue-800 flex items-center gap-2">
              <CheckCircleOutlined />
              Stage 1: Guideline Comprehension
            </Title>
            <Text className="font-[gilroy-regular] text-blue-600">
              Pass Score Required: {stage1Config.passingScore}% • Critical Questions: Zero Tolerance
            </Text>
          </div>
          <div className="w-64">
            <AssessmentTimer
              timeLimit={stage1Config.timeLimit}
              onTimeUp={handleTimeUp}
              submissionId={submissionId}
              stage="stage1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Text className="font-[gilroy-regular] text-sm text-blue-700">
              Question {currentQuestionIndex + 1} of {stage1Config.questions.length}
            </Text>
            <Text className="font-[gilroy-regular] text-sm text-blue-700">
              Answered: {getAnsweredCount()}/{stage1Config.questions.length}
            </Text>
          </div>
          <Progress 
            percent={progress} 
            strokeColor="#1890ff"
            showInfo={false}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-gray-200 shadow-lg">
            <div className="space-y-4">
              {/* Question Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded font-bold font-[gilroy-regular] text-sm">
                      Q{currentQuestionIndex + 1}
                    </span>
                    {currentQuestion.isCritical && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded font-bold font-[gilroy-regular] text-xs">
                        CRITICAL
                      </span>
                    )}
                    <span className="text-gray-500 font-[gilroy-regular] text-sm">
                      {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                    </span>
                  </div>
                  
                  {currentQuestion.isCritical && (
                    <Alert
                      message="Critical Question"
                      description="Incorrect answer = Immediate failure. No second chances."
                      type="error"
                      showIcon
                      icon={<WarningOutlined />}
                      className="mb-4 font-[gilroy-regular]"
                      banner
                    />
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-gray-50 p-4 rounded border">
                <Title level={4} className="!mb-0 font-[gilroy-regular] text-gray-800">
                  {currentQuestion.questionText}
                </Title>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                <Radio.Group
                  value={responses[currentQuestion.questionId]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full"
                >
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <Radio
                        key={option.optionId}
                        value={option.optionId}
                        className="w-full font-[gilroy-regular]"
                      >
                        <div className="flex items-center p-3 bg-white border rounded hover:bg-blue-50 transition-colors">
                          <span className="font-semibold mr-2 text-blue-600">
                            {option.optionId}.
                          </span>
                          <span className="flex-1">{option.optionText}</span>
                        </div>
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="font-[gilroy-regular]"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-4">
                  {!responses[currentQuestion.questionId] && (
                    <Text className="text-red-500 font-[gilroy-regular] text-sm">
                      <ExclamationCircleOutlined className="mr-1" />
                      Please select an answer
                    </Text>
                  )}
                  
                  <Button
                    type="primary"
                    onClick={handleNext}
                    disabled={!responses[currentQuestion.questionId]}
                    className="bg-blue-500 border-blue-500 hover:bg-blue-600 font-[gilroy-regular] font-semibold"
                  >
                    {isLastQuestion ? 'Review & Submit' : 'Next Question'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-orange-500" />
            <span className="font-[gilroy-regular]">Submit Stage 1 Quiz</span>
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
            Review Answers
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit}
            className="bg-red-500 border-red-500 hover:bg-red-600 font-[gilroy-regular] font-bold"
          >
            Submit Final Answers
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="Final Submission Warning"
            description="Once submitted, your answers cannot be changed. Make sure you have reviewed all questions carefully."
            type="warning"
            showIcon
            className="font-[gilroy-regular]"
          />

          <div className="bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-2 gap-4 text-sm font-[gilroy-regular]">
              <div>
                <Text className="text-gray-600">Questions Answered:</Text>
                <div className="font-semibold">{getAnsweredCount()}/{stage1Config.questions.length}</div>
              </div>
              <div>
                <Text className="text-gray-600">Pass Score Required:</Text>
                <div className="font-semibold">{stage1Config.passingScore}%</div>
              </div>
            </div>
          </div>

          {getUnansweredQuestions().length > 0 && (
            <Alert
              message="Unanswered Questions Detected"
              description={`Questions ${getUnansweredQuestions().join(', ')} are not answered. Unanswered questions count as incorrect.`}
              type="error"
              showIcon
              className="font-[gilroy-regular]"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};