import React from 'react';
import { Table, Tag, Typography, Button } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import { AssessmentRecord } from '../../../../types/assessment.types';
import { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface AssessmentHistoryTableProps {
  assessments: AssessmentRecord[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onShowDetails: (assessment: AssessmentRecord) => void;
}

const AssessmentHistoryTable: React.FC<AssessmentHistoryTableProps> = ({
  assessments,
  loading,
  totalCount,
  currentPage,
  onPageChange,
  onShowDetails,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const columns: ColumnsType<AssessmentRecord> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
      sorter: true,
    },
    {
      title: 'Assessment Type',
      dataIndex: 'assessmentType',
      key: 'assessmentType',
      render: (type: string) => (
        <Text className="font-[gilroy-regular] capitalize">
          {type.replace('_', ' ')}
        </Text>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'scorePercentage',
      key: 'scorePercentage',
      render: (score: number) => (
        <Tag color={getGradeColor(score)} className="font-[gilroy-regular]">
          {score}%
        </Tag>
      ),
      sorter: true,
    },
    {
      title: 'Result',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed: boolean) => (
        <Tag 
          color={passed ? 'success' : 'error'} 
          icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          className="font-[gilroy-regular]"
        >
          {passed ? 'PASSED' : 'FAILED'}
        </Tag>
      ),
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpentMinutes',
      key: 'timeSpentMinutes',
      render: (minutes: number) => (
        <Text className="font-[gilroy-regular]">
          <ClockCircleOutlined className="mr-1" />
          {minutes}m
        </Text>
      ),
    },
    {
      title: 'Attempt',
      dataIndex: 'attemptNumber',
      key: 'attemptNumber',
      render: (attempt: number) => (
        <Tag color="blue" className="font-[gilroy-regular]">
          #{attempt}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onShowDetails(record)}
          className="font-[gilroy-regular]"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={assessments}
      rowKey="_id"
      loading={loading}
      pagination={{
        current: currentPage,
        total: totalCount,
        pageSize: 10,
        onChange: onPageChange,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} assessments`,
      }}
      className="font-[gilroy-regular]"
    />
  );
};

export default AssessmentHistoryTable;
export { AssessmentHistoryTable };
