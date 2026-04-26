import React, { useState } from 'react';
import { Card, Typography, Button, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

// Hooks
import { 
  useAssessmentHistoryQuery, 
  useRetakeEligibilityQuery 
} from '../../../services/assessement-service/assessment-history-query';

// Components
import AssessmentStats from './components/AssessmentStats';
import AssessmentHistoryTable from './components/AssessmentHistoryTable';
import AssessmentDetailsModal from './components/AssessmentDetailsModal';

// Types
import { AssessmentRecord } from '../../../types/assessment.types';

const { Title, Text } = Typography;

const AssessmentHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // TanStack Queries
  const { 
    assessments, 
    statistics, 
    pagination, 
    isLoadingHistory, 
    refreshHistory 
  } = useAssessmentHistoryQuery(currentPage, 10);

  const { 
    eligibility, 
    refreshEligibility 
  } = useRetakeEligibilityQuery();

  const handleRefresh = () => {
    refreshHistory();
    refreshEligibility();
  };

  const handleShowDetails = (assessment: AssessmentRecord) => {
    setSelectedAssessment(assessment);
    setIsModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
            
            Assessment History
          </Title>
          <Text className="text-gray-600 font-[gilroy-regular]">
            Track your assessment performance and progress
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
        >
          Refresh
        </Button>
      </div>

      {/* Retake Eligibility Alert */}
      {eligibility && !eligibility.canRetake && eligibility.nextRetakeTime && (
        <Alert
          message="Retake Available Soon"
          description={`You can retake the assessment after ${formatDate(eligibility.nextRetakeTime)}`}
          type="info"
          showIcon
          className="mb-6 font-[gilroy-regular]"
        />
      )}

      {eligibility && eligibility.canRetake && (
        <Alert
          message="Retake Available"
          description="You are eligible to retake the assessment now!"
          type="success"
          showIcon
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => window.location.href = '/dashboard/assessment'}
              className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
            >
              Take Assessment
            </Button>
          }
          className="mb-6 font-[gilroy-regular]"
        />
      )}

      {/* Statistics */}
      <AssessmentStats statistics={statistics} />

      {/* Assessment History Table */}
      <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
        <AssessmentHistoryTable
          assessments={assessments}
          loading={isLoadingHistory}
          totalCount={pagination?.totalCount ?? 0}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onShowDetails={handleShowDetails}
        />
      </Card>

      {/* Assessment Details Modal */}
      <AssessmentDetailsModal
        assessment={selectedAssessment}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default AssessmentHistory;