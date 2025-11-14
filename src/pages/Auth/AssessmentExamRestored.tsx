import React, { useState, useEffect, useCallback } from 'react';
import { Card, Radio, Button, Progress, Typography, Space, Modal, Alert, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { fallbackQuestions, fallbackAssessmentInfo, convertApiQuestionToComponent, ComponentQuestion } from '../../data/assessmentQuestions';
import { useAssessmentSystem, UserAnswer } from '../../hooks/Auth/User/useAssessmentSystem';

const { Title, Text } = Typography;

interface AssessmentExamProps {
  onSubmitSuccess: (score: number, status: string) => void;
}

const AssessmentExam: React.FC<AssessmentExamProps> = ({ onSubmitSuccess }) => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY EARLY RETURNS
  const { submitAssessment, getAssessmentQuestions } = useAssessmentSystem();
  
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [questions, setQuestions] = useState<ComponentQuestion[]>([]);
  const [sections, setSections] = useState(fallbackAssessmentInfo.sections);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [startTime] = useState(new Date().toISOString());

  // Load questions from API
  useEffect(() => {
    const loadAssessmentData = async () => {
      try {
        setLoadingQuestions(true);
        
        // Try to fetch from API first
        const questionsResult = await getAssessmentQuestions(5); // 5 questions per section
        console.log(questionsResult.data);
        if (questionsResult.success && questionsResult.data) {
          // The API response structure is { success, data: AssessmentTypeResponse }
          // where AssessmentTypeResponse has { success, message, data: { questions, assessmentInfo } }
          const apiResponse = questionsResult.data;
          
          
          if (apiResponse.success && apiResponse.data) {
            const apiQuestions = apiResponse.data.questions || [];
            const convertedQuestions = apiQuestions.map(convertApiQuestionToComponent);
            setQuestions(convertedQuestions);
            
            // Use sections from API response
            const apiSections = apiResponse.data.assessmentInfo?.sections || fallbackAssessmentInfo.sections;
            setSections(apiSections);
          } else {
            // Use fallback data if API response structure is invalid
            console.log('Invalid API response structure, using fallback static questions');
            const convertedQuestions = fallbackQuestions.map(convertApiQuestionToComponent);
            setQuestions(convertedQuestions);
            setSections(fallbackAssessmentInfo.sections);
          }
        } else {
          // Fallback to static data if API fails
          console.log('API request failed, using fallback static questions');
          const convertedQuestions = fallbackQuestions.map(convertApiQuestionToComponent);
          setQuestions(convertedQuestions);
          setSections(fallbackAssessmentInfo.sections);
        }
      } catch (error) {
        console.error('Error loading assessment data:', error);
        // Use static data as fallback
        const convertedQuestions = fallbackQuestions.map(convertApiQuestionToComponent);
        setQuestions(convertedQuestions);
        setSections(fallbackAssessmentInfo.sections);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadAssessmentData();
  }, [getAssessmentQuestions]);

  // Handle assessment submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const endTime = new Date().toISOString();
      
      // Create submission payload with metadata
      const submissionPayload = {
        answers,
        timeSpent: 900 - timeLeft,
        metadata: {
          startTime,
          endTime,
          userAgent: navigator.userAgent,
          browserInfo: {
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
          }
        }
      };

      // Submit to API - the backend will calculate score and determine status
      const result = await submitAssessment(submissionPayload);

      if (result.success && result.data) {
        // Extract score and status from API response
        const score = result.data.results?.scorePercentage || 0;
        const status = score >= 60 ? 'advanced' : 'basic';
        
        onSubmitSuccess(score, status);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Assessment submission failed:', error);
      Modal.error({
        title: 'Submission Failed',
        content: 'There was an error submitting your assessment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, timeLeft, startTime, submitAssessment, onSubmitSuccess]);

  // Auto-submit when time expires
  const handleAutoSubmit = useCallback(() => {
    if (!isSubmitting) {
      handleSubmit();
    }
  }, [isSubmitting, handleSubmit]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        if (prev <= 300 && !showTimeWarning) { // Show warning at 5 minutes left
          setShowTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimeWarning, handleAutoSubmit]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = (value: string | boolean) => {
    if (!questions[currentQuestionIndex]) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const existingAnswerIndex = answers.findIndex(
      (answer) => answer.questionId === currentQuestion.questionId
    );

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.questionId,
      selectedAnswer: value,
      timeSpent: 0
    };

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = newAnswer;
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  // Get current answer
  const getCurrentAnswer = () => {
    if (!questions[currentQuestionIndex]) return undefined;
    
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers.find((a) => a.questionId === currentQuestion.questionId);
    return answer?.selectedAnswer;
  };

  // Handle next question/section
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      
      // Check if we're moving to a new section
      const nextQuestion = questions[nextQuestionIndex];
      const nextSectionIndex = sections.findIndex((sectionName) =>
        nextQuestion.section === sectionName
      );
      
      if (nextSectionIndex !== -1 && nextSectionIndex !== currentSectionIndex) {
        setCurrentSectionIndex(nextSectionIndex);
      }
    }
  };

  // Calculate derived values AFTER all hooks
  const currentQuestion = questions[currentQuestionIndex];
  const currentSection = sections[currentSectionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = getCurrentAnswer() !== undefined;

  // Show loading state while fetching questions
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="text-center p-8 shadow-xl border-0 rounded-xl">
          <Spin indicator={<LoadingOutlined className="text-4xl text-[#F6921E]" spin />} />
          <Title level={3} className="!text-[#333333] !mt-4 font-[gilroy-regular]">
            Loading Assessment
          </Title>
          <Text className="text-gray-600 font-[gilroy-regular]">
            Preparing your English Proficiency Assessment...
          </Text>
        </Card>
      </div>
    );
  }

  // Show error state if no questions loaded
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="text-center p-8 shadow-xl border-0 rounded-xl">
          <Title level={3} className="!text-[#333333] !mt-4 font-[gilroy-regular]">
            Unable to Load Assessment
          </Title>
          <Text className="text-gray-600 font-[gilroy-regular]">
            There was an error loading the assessment questions. Please try again later.
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Time Warning Modal */}
      <Modal
        title={<span className="text-red-600 font-[gilroy-regular]">Time Warning</span>}
        open={showTimeWarning}
        onCancel={() => setShowTimeWarning(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowTimeWarning(false)}>
            Continue
          </Button>
        ]}
      >
        <Alert
          message="5 minutes remaining!"
          description="Please ensure you answer all questions before time expires."
          type="warning"
          showIcon
        />
      </Modal>

      {/* Header */}
      <Card className="mb-6 shadow-lg border-0 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="!text-[#333333] !mb-1 font-[gilroy-regular]">
              English Proficiency Assessment
            </Title>
            <Text className="text-gray-600 font-[gilroy-regular]">
              Section {currentSectionIndex + 1}: {currentSection || 'Loading...'}
            </Text>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <ClockCircleOutlined className={timeLeft <= 300 ? 'text-red-500' : 'text-[#F6921E]'} />
              <Text 
                strong 
                className={`font-[gilroy-regular] text-lg ${timeLeft <= 300 ? 'text-red-500' : 'text-[#333333]'}`}
              >
                {formatTime(timeLeft)}
              </Text>
            </div>
            <Text className="text-gray-500 text-sm font-[gilroy-regular]">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </div>
        </div>
        
        <Progress
          percent={progressPercentage}
          strokeColor="#F6921E"
          className="mt-4"
          showInfo={false}
        />
      </Card>

      {/* Question Card */}
      <Card className="shadow-xl border-0 rounded-xl">
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#F6921E] text-white rounded-full flex items-center justify-center font-[gilroy-regular] font-semibold">
                {currentQuestionIndex + 1}
              </div>
              <Title level={4} className="!text-[#333333] !mb-0 font-[gilroy-regular]">
                Question {currentQuestionIndex + 1}
              </Title>
            </div>
            
            <Text className="text-lg text-[#333333] font-[gilroy-regular] leading-relaxed">
              {currentQuestion?.questionText || 'Loading question...'}
            </Text>
          </div>

          {/* Answer Options */}
          <div className="pl-4">
            {currentQuestion?.questionType === 'multiple_choice' ? (
              <Radio.Group
                value={getCurrentAnswer()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  {currentQuestion.options?.map((option: string, index: number) => (
                    <Radio
                      key={index}
                      value={option}
                      className="font-[gilroy-regular] text-base p-3 border rounded-lg hover:border-[#F6921E] hover:bg-orange-50"
                    >
                      <Text className="font-[gilroy-regular] text-[#333333]">
                        {option}
                      </Text>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            ) : (
              <Radio.Group
                value={getCurrentAnswer()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <Radio
                    value="True"
                    className="font-[gilroy-regular] text-base p-3 border rounded-lg hover:border-[#F6921E] hover:bg-orange-50"
                  >
                    <Text className="font-[gilroy-regular] text-[#333333]">True</Text>
                  </Radio>
                  <Radio
                    value="False"
                    className="font-[gilroy-regular] text-base p-3 border rounded-lg hover:border-[#F6921E] hover:bg-orange-50"
                  >
                    <Text className="font-[gilroy-regular] text-[#333333]">False</Text>
                  </Radio>
                </Space>
              </Radio.Group>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              <Text className="text-gray-500 font-[gilroy-regular]">
                {answers.length} of {questions.length} questions answered
              </Text>
            </div>
            
            <div className="space-x-4">
              {!isLastQuestion ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular] px-8"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 font-[gilroy-regular] px-8"
                  icon={isSubmitting ? <Spin className="mr-2" /> : <CheckCircleOutlined />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </div>
          </div>
        </Space>
      </Card>

      {/* Section Progress Indicator */}
      <Card className="mt-6 shadow-lg border-0 rounded-xl">
        <Title level={5} className="!text-[#333333] !mb-4 font-[gilroy-regular]">
          Assessment Sections
        </Title>
        <div className="grid grid-cols-4 gap-4">
          {sections.map((sectionName, index) => {
            const sectionQuestions = questions.filter(q => q.section === sectionName);
            const answeredInSection = sectionQuestions.filter(q =>
              answers.some(a => a.questionId === q.questionId)
            ).length;
            const isCurrentSection = index === currentSectionIndex;
            
            return (
              <div
                key={index}
                className={`p-3 rounded-lg text-center ${
                  isCurrentSection
                    ? 'bg-[#F6921E] text-white'
                    : answeredInSection === sectionQuestions.length
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Text strong className={`font-[gilroy-regular] ${isCurrentSection ? 'text-white' : ''}`}>
                  Section {index + 1}
                </Text>
                <br />
                <Text className={`text-sm font-[gilroy-regular] ${isCurrentSection ? 'text-white' : ''}`}>
                  {answeredInSection}/{sectionQuestions.length}
                </Text>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AssessmentExam;