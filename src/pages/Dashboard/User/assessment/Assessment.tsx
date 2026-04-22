import React, { useState } from 'react';
import { Typography, Row, Col, Empty, Spin, notification, Skeleton, Card, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Layout & Components
import Header from '../Header';
import DashboardAssessmentCard from './components/DashboardAssessmentCard';
import AssessmentConfirmationModal from './components/AssessmentConfirmationModal';

// hooks & Services
import { useAvailableAssessmentsQuery, useStartAssessmentMutation } from '../../../../services/assessement-service/assessment-service';

// Types
import { Assessment as AssessmentType } from '../../../../validators/assessment/assessment-schema';

const { Title, Text } = Typography;

const Assessment: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const navigate = useNavigate();

  // TanStack Queries
  const { 
    data: assessments = [], 
    isLoading: loadingAssessments, 
    isError: isAssessmentsError,
    error: assessmentsError,
    refetch: refetchAssessments 
  } = useAvailableAssessmentsQuery();

  const { 
    mutateAsync: startAssessment, 
    isPending: startingAssessment 
  } = useStartAssessmentMutation();

  const handleStartAssessment = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment);
    setShowStartModal(true);
  };

  const handleConfirmStart = async () => {
    if (!selectedAssessment) return;

    try {
      const sessionData = await startAssessment(selectedAssessment.id);
      
      notification.success({
        message: 'Assessment Started',
        description: 'Your assessment session has been initialized successfully.',
        placement: 'topRight',
        className: 'font-[gilroy-regular]'
      });
      
      // Navigate to the assessment session
      if (selectedAssessment.type === 'multimedia') {
        navigate(`/user/assessment/multimedia/${sessionData.submissionId}`);
      } else {
        navigate(`/user/assessment/session/${sessionData.submissionId}`, {
          state: { 
            assessmentType: selectedAssessment.type,
            sessionData 
          }
        });
      }
    } catch (err: any) {
      notification.error({
        message: 'Failed to Start',
        description: err.message || 'Unable to start assessment. Please try again.',
        placement: 'topRight',
        className: 'font-[gilroy-regular]'
      });
    } finally {
      setShowStartModal(false);
      setSelectedAssessment(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  if (loadingAssessments) {
    return (
      <div className="font-[gilroy-regular] p-8 min-h-screen bg-gray-50/50">
        <Header title="Assessments" />
        <div className="mt-8">
          <Skeleton active paragraph={{ rows: 2 }} className="mb-10 max-w-2xl" />
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} lg={12} xl={8} key={i}>
                <Card className="rounded-2xl border-0 shadow-sm overflow-hidden h-[400px]">
                  <Skeleton active avatar paragraph={{ rows: 8 }} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[gilroy-regular] p-8 min-h-screen bg-gray-50/50">
      <Header title="Assessments" />
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <Title level={2} className="!mb-2 !text-[#333333] font-black tracking-tight">
            Available Assessments
          </Title>
          <Text className="text-gray-500 text-lg">
            Complete specialized evaluations to unlock high-paying logic, creative, and technical roles.
          </Text>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetchAssessments()}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl shadow-sm hover:shadow-md hover:border-[#F6921E] hover:text-[#F6921E] transition-all font-bold text-sm"
        >
          <ReloadOutlined className={loadingAssessments ? 'animate-spin' : ''} />
          Refresh List
        </motion.button>
      </div>

      {isAssessmentsError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <ReloadOutlined className="text-xl" />
            </div>
            <div>
              <Text strong className="text-red-800 block text-base">Network Error</Text>
              <Text className="text-red-600">{(assessmentsError as any)?.message || "Failed to load assessments"}</Text>
            </div>
          </div>
          <Button type="primary" danger onClick={() => refetchAssessments()} className="font-bold">
            Retry Now
          </Button>
        </motion.div>
      )}

      {assessments.length === 0 && !isAssessmentsError ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-gray-100"
        >
          <Empty
            description={
              <Space direction="vertical" align="center">
                <Text className="font-bold text-xl text-gray-400">No assessments found</Text>
                <Text className="text-gray-400">You've cleared all pending evaluations or none are currently assigned.</Text>
              </Space>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row gutter={[24, 24]}>
            <AnimatePresence>
              {assessments.map((assessment) => (
                <Col xs={24} lg={12} xl={8} key={assessment.id}>
                  <motion.div variants={itemVariants}>
                    <DashboardAssessmentCard
                      assessment={assessment}
                      onStart={handleStartAssessment}
                      onViewResults={(id) => navigate(`/user/assessment/results/${id}`)}
                    />
                  </motion.div>
                </Col>
              ))}
            </AnimatePresence>
          </Row>
        </motion.div>
      )}

      {/* Start Assessment Confirmation Modal */}
      <AssessmentConfirmationModal
        assessment={selectedAssessment}
        visible={showStartModal}
        loading={startingAssessment}
        onCancel={() => {
          setShowStartModal(false);
          setSelectedAssessment(null);
        }}
        onConfirm={handleConfirmStart}
      />
    </div>
  );
};

export default Assessment;
