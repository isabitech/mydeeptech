import { EyeOutlined, EditOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Space } from "antd";
import { PDFViewerModal, usePDFViewer } from '../../../../../components/PDFViewer';
import { Assessment } from './types';
import { getAverageScore, getScoreColor, getStatusColor } from './assessment-utils';

interface AssessmentTableProps {
  assessments: Assessment[];
  loading: boolean;
  onViewAssessment: (assessment: Assessment) => void;
  onReviewAssessment: (assessment: Assessment) => void;
}

const AssessmentTable = ({ 
  assessments, 
  loading, 
  onViewAssessment, 
  onReviewAssessment 
}: AssessmentTableProps) => {
  const { isVisible, fileUrl, openPDFViewer, closePDFViewer } = usePDFViewer();
  
  const columns = [
    {
      title: "Candidate",
      key: "candidate",
      render: (record: Assessment) => (
        <div>
          <div className="font-semibold">{record.fullName}</div>
          <div className="text-gray-500 text-sm">{record.emailAddress}</div>
        </div>
      ),
    },
    {
      title: "Scores",
      key: "scores",
      align: 'center' as const,
      render: (record: Assessment) => {
        const averageScore = getAverageScore(record);
        return (
          <div className="flex flex-col items-center justify-center">
            <Tag color={getScoreColor(averageScore)}>
              Avg: {averageScore}
            </Tag>
            <div className="text-xs text-gray-500 mt-1">
              English: {record.englishTestScore} | Problem Solving: {record.problemSolvingScore}
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: 'center' as const,
      render: (record: Assessment) => (
        <Tag color={getStatusColor(record.reviewStatus)}>
          {record.reviewStatus.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Submitted Date",
      key: "submittedDate",
      align: 'center' as const,
      render: (record: Assessment) => {
        const date = new Date(record.dateOfSubmission);
        return (
          <div className="flex flex-col items-center justify-center">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{record.timeOfSubmission}</div>
          </div>
        );
      },
    },
    {
      title: "Resume",
      key: "resume",
      align: 'center' as const,
      render: (record: Assessment) => {
        if (record.resume_url) {
          return (
            <Button
              type="link"
              icon={<FileTextOutlined />}
              onClick={() => openPDFViewer(record.resume_url!)}
              size="small"
            >
              View Resume
            </Button>
          );
        }
        return <span className="text-gray-400">N/A</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center' as const,
      render: (record: Assessment) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => onViewAssessment(record)}
            size="small"
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onReviewAssessment(record)}
            size="small"
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={assessments}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ['bottomCenter'],
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: "max-content" }}
        className="bg-white rounded-lg shadow-sm"
      />
      
      <PDFViewerModal
        visible={isVisible}
        fileUrl={fileUrl}
        title="Resume Preview"
        onClose={closePDFViewer}
      />
    </>
  );
};

export default AssessmentTable;